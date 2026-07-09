import Phaser from "phaser";
import { generatePlayerTexture, generateMascotTexture } from "../worldmap/pixelTexture";

export interface RoomSpot {
  screen: string;
  kind: "plaque" | "training" | "monster";
  label: string;
  locked: boolean;
  defeated: boolean;
}

const ROOM_WIDTH = 300;
const ROOM_HEIGHT = 680;
const TOUCH_RADIUS = 30;
const MOVE_SPEED = 140;
const DOOR_X = 150;
const DOOR_Y = 40;

// Fixed vertical order matching S1→S7: walking further into the room is
// walking through the problem, same order as the old linear stage path.
const SPOT_Y: Record<string, number> = {
  s1: 110,
  s2: 190,
  s3: 270,
  s4: 350,
  s5: 430,
  s6: 510,
  s7: 610,
};

interface SpotPosition {
  screen: string;
  x: number;
  y: number;
}

export class RoomScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private mascot!: Phaser.GameObjects.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spotPositions: SpotPosition[] = [];
  private spotShapes: Record<string, Phaser.GameObjects.Shape> = {};
  private spotData: Record<string, RoomSpot> = {};
  private entered = false;

  constructor() {
    super("RoomScene");
  }

  preload() {
    generatePlayerTexture(this, "player");
    generateMascotTexture(this, "mascot-companion");
  }

  create() {
    this.entered = false;
    this.spotPositions = [];
    this.spotShapes = {};
    this.spotData = {};

    this.add.grid(
      ROOM_WIDTH / 2,
      ROOM_HEIGHT / 2,
      ROOM_WIDTH,
      ROOM_HEIGHT,
      32,
      32,
      0xf1ecfb,
      1,
      0xe4dff2,
      1,
    );

    this.createDoor();

    const initialSpots = (this.registry.get("spots") as RoomSpot[]) ?? [];
    initialSpots.forEach((spot) => this.createSpot(spot));

    this.registry.events.on("changedata-spots", (_parent: unknown, value: RoomSpot[]) => {
      value.forEach((spot) => {
        this.spotData[spot.screen] = spot;
        const shape = this.spotShapes[spot.screen];
        if (shape) shape.setFillStyle(this.colorFor(spot));
      });
    });

    this.player = this.physics.add.sprite(DOOR_X, DOOR_Y + 40, "player");
    this.player.setCollideWorldBounds(true);
    this.physics.world.setBounds(0, 0, ROOM_WIDTH, ROOM_HEIGHT);

    this.mascot = this.add.sprite(this.player.x - 18, this.player.y + 6, "mascot-companion");

    this.cursors = this.input.keyboard!.createCursorKeys();

    this.cameras.main.setBounds(0, 0, ROOM_WIDTH, ROOM_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.15);
  }

  private colorFor(spot: RoomSpot): number {
    if (spot.kind === "plaque") return 0xf1ecfb;
    if (spot.locked) return 0x9ca3af;
    if (spot.defeated) return 0x16a34a;
    return spot.kind === "training" ? 0x2563eb : 0xe11d48;
  }

  private createDoor() {
    this.add.rectangle(DOOR_X, DOOR_Y, 40, 16, 0x5c4326).setStrokeStyle(2, 0x2b2440);
    this.add.text(DOOR_X, DOOR_Y - 16, "出口", { fontSize: "11px", color: "#2b2440" }).setOrigin(0.5, 1);
  }

  private createSpot(spot: RoomSpot) {
    const x = DOOR_X;
    const y = SPOT_Y[spot.screen] ?? 300;
    const color = this.colorFor(spot);

    let shape: Phaser.GameObjects.Shape;
    if (spot.kind === "plaque") {
      shape = this.add.rectangle(x, y, 40, 30, color).setStrokeStyle(2, 0x7c3aed);
    } else if (spot.kind === "training") {
      shape = this.add.rectangle(x, y, 34, 34, color).setStrokeStyle(2, 0x2b2440);
    } else {
      shape = this.add.triangle(x, y, 0, 32, 32, 32, 16, 0, color).setStrokeStyle(2, 0x2b2440);
    }

    this.add
      .text(x, y - 26, spot.label, { fontSize: "10px", color: "#2b2440", align: "center" })
      .setOrigin(0.5, 1)
      .setWordWrapWidth(80);

    this.spotShapes[spot.screen] = shape;
    this.spotData[spot.screen] = spot;
    this.spotPositions.push({ screen: spot.screen, x, y });
  }

  update() {
    if (!this.player.body) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0);

    if (this.cursors.left.isDown) body.setVelocityX(-MOVE_SPEED);
    else if (this.cursors.right.isDown) body.setVelocityX(MOVE_SPEED);
    if (this.cursors.up.isDown) body.setVelocityY(-MOVE_SPEED);
    else if (this.cursors.down.isDown) body.setVelocityY(MOVE_SPEED);

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
