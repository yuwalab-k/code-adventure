import Phaser from "phaser";
import {
  generatePlayerTexture,
  generateMascotTexture,
  generateMonsterTexture,
  generateWorldIconTexture,
} from "../worldmap/pixelTexture";
import type { MonsterVariant } from "../monsters/monsterFrames";

export interface RoomSpot {
  screen: string;
  kind: "plaque" | "training" | "monster";
  label: string;
  locked: boolean;
  defeated: boolean;
}

const ROOM_WIDTH = 420;
const ROOM_HEIGHT = 420;
const TOUCH_RADIUS = 30;
const MOVE_SPEED = 150;
const ARRIVE_RADIUS = 6;
const ZOOM = 1.3;
const DOOR_X = 210;
const DOOR_Y = 380;

// A proper room, not a single-file corridor: monsters guard the back
// (top) of the room, training spots flank the middle, the problem plaque
// sits near the entrance, and the door is at the front (bottom).
const SPOT_POS: Record<string, { x: number; y: number }> = {
  s1: { x: 210, y: 300 },
  s3: { x: 90, y: 220 },
  s5: { x: 330, y: 220 },
  s2: { x: 110, y: 110 },
  s4: { x: 210, y: 70 },
  s6: { x: 310, y: 110 },
  s7: { x: 210, y: 30 },
};

interface SpotPosition {
  screen: string;
  x: number;
  y: number;
}

const MONSTER_VARIANT_FOR_SCREEN: Record<string, MonsterVariant> = {
  s2: "m1",
  s4: "m2",
  s6: "m3",
  s7: "boss",
};

const LOCKED_TINT = 0xaaaaaa;
const DEFEATED_TINT = 0x777777;

export class RoomScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private mascot!: Phaser.GameObjects.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spotPositions: SpotPosition[] = [];
  private spotVisuals: Record<string, Phaser.GameObjects.Sprite> = {};
  private spotData: Record<string, RoomSpot> = {};
  private entered = false;
  private moveTarget: Phaser.Math.Vector2 | null = null;

  constructor() {
    super("RoomScene");
  }

  preload() {
    generatePlayerTexture(this, "player");
    generateMascotTexture(this, "mascot-companion");
    (["m1", "m2", "m3", "boss"] as MonsterVariant[]).forEach((v) => generateMonsterTexture(this, v));
    generateWorldIconTexture(this, "door");
    generateWorldIconTexture(this, "plaque");
    generateWorldIconTexture(this, "training");
  }

  create() {
    this.entered = false;
    this.moveTarget = null;
    this.spotPositions = [];
    this.spotVisuals = {};
    this.spotData = {};

    this.createDoor();

    const initialSpots = (this.registry.get("spots") as RoomSpot[]) ?? [];
    initialSpots.forEach((spot) => this.createSpot(spot));

    this.registry.events.on("changedata-spots", (_parent: unknown, value: RoomSpot[]) => {
      value.forEach((spot) => {
        this.spotData[spot.screen] = spot;
        this.applyVisualState(spot);
      });
    });

    this.player = this.physics.add.sprite(DOOR_X, DOOR_Y - 40, "player");
    this.player.setCollideWorldBounds(true);
    this.physics.world.setBounds(0, 0, ROOM_WIDTH, ROOM_HEIGHT);

    this.mascot = this.add.sprite(this.player.x - 18, this.player.y + 6, "mascot-companion");

    this.cursors = this.input.keyboard!.createCursorKeys();

    // Tap/click a spot in the room to walk there — smartphone-game style
    // control, in addition to arrow keys for desktop.
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.moveTarget = new Phaser.Math.Vector2(world.x, world.y);
    });

    this.cameras.main.setBounds(0, 0, ROOM_WIDTH, ROOM_HEIGHT);
    this.cameras.main.setZoom(ZOOM);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.15);

    this.scale.on("resize", () => this.cameras.main.setZoom(ZOOM));
  }

  private tintFor(spot: RoomSpot): number {
    if (spot.locked) return 0xaaaaaa;
    if (spot.defeated) return 0x777777;
    return 0x111111;
  }

  private applyVisualState(spot: RoomSpot) {
    const visual = this.spotVisuals[spot.screen];
    if (!visual) return;

    if (spot.kind === "monster") {
      const sprite = visual as Phaser.GameObjects.Sprite;
      if (spot.locked) sprite.setTint(LOCKED_TINT);
      else if (spot.defeated) sprite.setTint(DEFEATED_TINT);
      else sprite.clearTint();
      return;
    }

    if (spot.kind === "training") {
      (visual as Phaser.GameObjects.Sprite).setTint(this.tintFor(spot));
    }
  }

  private createDoor() {
    this.add.sprite(DOOR_X, DOOR_Y, "world-icon-door").setTint(0x444444);
    this.add.text(DOOR_X, DOOR_Y - 22, "出口", { fontSize: "11px", color: "#000000" }).setOrigin(0.5, 1);
  }

  private createSpot(spot: RoomSpot) {
    const pos = SPOT_POS[spot.screen] ?? { x: ROOM_WIDTH / 2, y: ROOM_HEIGHT / 2 };
    const { x, y } = pos;

    let visual: Phaser.GameObjects.Sprite;
    if (spot.kind === "plaque") {
      visual = this.add.sprite(x, y, "world-icon-plaque").setTint(0x222222);
    } else if (spot.kind === "training") {
      visual = this.add.sprite(x, y, "world-icon-training").setTint(this.tintFor(spot));
    } else {
      const variant = MONSTER_VARIANT_FOR_SCREEN[spot.screen] ?? "m1";
      visual = this.add.sprite(x, y, `monster-${variant}`);
    }

    this.add
      .text(x, y - 26, spot.label, { fontSize: "10px", color: "#000000", align: "center" })
      .setOrigin(0.5, 1)
      .setWordWrapWidth(80);

    this.spotVisuals[spot.screen] = visual;
    this.spotData[spot.screen] = spot;
    this.spotPositions.push({ screen: spot.screen, x, y });
    this.applyVisualState(spot);
  }

  update() {
    if (!this.player.body) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0);

    const keyDown =
      this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown;

    if (keyDown) {
      this.moveTarget = null;
      if (this.cursors.left.isDown) body.setVelocityX(-MOVE_SPEED);
      else if (this.cursors.right.isDown) body.setVelocityX(MOVE_SPEED);
      if (this.cursors.up.isDown) body.setVelocityY(-MOVE_SPEED);
      else if (this.cursors.down.isDown) body.setVelocityY(MOVE_SPEED);
    } else if (this.moveTarget) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.moveTarget.x, this.moveTarget.y);
      if (dist < ARRIVE_RADIUS) {
        this.moveTarget = null;
      } else {
        this.physics.velocityFromRotation(
          Phaser.Math.Angle.Between(this.player.x, this.player.y, this.moveTarget.x, this.moveTarget.y),
          MOVE_SPEED,
          body.velocity,
        );
      }
    }

    const bob = Math.sin(this.time.now / 300) * 3;
    this.mascot.x = Phaser.Math.Linear(this.mascot.x, this.player.x - 18, 0.08);
    this.mascot.y = Phaser.Math.Linear(this.mascot.y, this.player.y + 6 + bob, 0.08);

    const nearDoor = Phaser.Math.Distance.Between(this.player.x, this.player.y, DOOR_X, DOOR_Y) < TOUCH_RADIUS;
    const nearSpot = this.spotPositions.find(
      (p) =>
        !this.spotData[p.screen]?.locked &&
        Phaser.Math.Distance.Between(this.player.x, this.player.y, p.x, p.y) < TOUCH_RADIUS,
    );

    // Re-arms once the player has walked away from every trigger zone, so
    // returning to an already-visited spot (or the door) can fire again.
    if (!nearDoor && !nearSpot) {
      this.entered = false;
      return;
    }
    if (this.entered) return;

    if (nearDoor) {
      this.entered = true;
      this.game.events.emit("exit-room");
      return;
    }
    if (nearSpot) {
      this.entered = true;
      this.game.events.emit("enter-spot", nearSpot.screen);
    }
  }
}
