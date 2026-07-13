import Phaser from "phaser";
import { generatePlayerTexture, generateMascotTexture, generateWorldIconTexture } from "./pixelTexture";

export interface WorldMapNode {
  id: string;
  title: string;
  difficulty: number;
  locked: boolean;
  cleared: boolean;
  mapX: number | null;
  mapY: number | null;
}

const PLAZA_WIDTH = 800;
const PLAZA_HEIGHT = 480;
const TOUCH_RADIUS = 34;
const MOVE_SPEED = 160;
const ARRIVE_RADIUS = 6;
const ZOOM = 1.4;
const STORE_X = 90;
const STORE_Y = 90;
const DOJO_X = 700;
const DOJO_Y = 90;

interface DoorObject {
  node: WorldMapNode;
  x: number;
  y: number;
}

export class WorldMapScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private mascot!: Phaser.GameObjects.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private doors: DoorObject[] = [];
  private entered = false;
  private moveTarget: Phaser.Math.Vector2 | null = null;

  constructor() {
    super("WorldMapScene");
  }

  preload() {
    generatePlayerTexture(this, "player");
    generateMascotTexture(this, "mascot-companion");
    generateWorldIconTexture(this, "store");
    generateWorldIconTexture(this, "dojo");
    generateWorldIconTexture(this, "door");
  }

  create() {
    this.entered = false;
    this.moveTarget = null;

    this.createStore();
    this.createDojo();

    const nodes = (this.registry.get("nodes") as WorldMapNode[]) ?? [];
    this.doors = nodes.map((node, index) => this.createDoor(node, index, nodes.length));

    this.player = this.physics.add.sprite(PLAZA_WIDTH / 2, PLAZA_HEIGHT - 60, "player");
    this.player.setCollideWorldBounds(true);
    this.physics.world.setBounds(0, 0, PLAZA_WIDTH, PLAZA_HEIGHT);

    this.mascot = this.add.sprite(this.player.x - 20, this.player.y + 6, "mascot-companion");

    this.cursors = this.input.keyboard!.createCursorKeys();

    // Tap/click a spot in the room to walk there — smartphone-game style
    // control, in addition to arrow keys for desktop.
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.moveTarget = new Phaser.Math.Vector2(world.x, world.y);
    });

    this.cameras.main.setBounds(0, 0, PLAZA_WIDTH, PLAZA_HEIGHT);
    this.cameras.main.setZoom(ZOOM);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.scale.on("resize", () => this.cameras.main.setZoom(ZOOM));
  }

  private createStore() {
    this.add.sprite(STORE_X, STORE_Y, "world-icon-store");
    this.add
      .text(STORE_X, STORE_Y - 26, "ストア", { fontSize: "11px", color: "#000000", align: "center" })
      .setOrigin(0.5, 1);
  }

  private createDojo() {
    this.add.sprite(DOJO_X, DOJO_Y, "world-icon-dojo");
    this.add
      .text(DOJO_X, DOJO_Y - 26, "道場", { fontSize: "11px", color: "#000000", align: "center" })
      .setOrigin(0.5, 1);
  }

  private createDoor(node: WorldMapNode, index: number, total: number): DoorObject {
    const x = node.mapX ?? 200 + (index * (PLAZA_WIDTH - 300)) / Math.max(total - 1, 1);
    const y = node.mapY ?? PLAZA_HEIGHT / 2 + 40;

    const tint = node.locked ? 0xaaaaaa : node.cleared ? 0x666666 : 0x111111;
    this.add.sprite(x, y, "world-icon-door").setTint(tint);
    this.add
      .text(x, y - 30, node.title, { fontSize: "11px", color: "#000000", align: "center" })
      .setOrigin(0.5, 1)
      .setWordWrapWidth(90);
    this.add.text(x, y + 24, `★${node.difficulty}`, { fontSize: "11px", color: "#000000" }).setOrigin(0.5, 0);

    return { node, x, y };
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
    const targetX = this.player.x - 22;
    const targetY = this.player.y + 8 + bob;
    this.mascot.x = Phaser.Math.Linear(this.mascot.x, targetX, 0.08);
    this.mascot.y = Phaser.Math.Linear(this.mascot.y, targetY, 0.08);

    const nearStore = Phaser.Math.Distance.Between(this.player.x, this.player.y, STORE_X, STORE_Y) < TOUCH_RADIUS;
    const nearDojo = Phaser.Math.Distance.Between(this.player.x, this.player.y, DOJO_X, DOJO_Y) < TOUCH_RADIUS;
    const nearDoor = this.doors.find(
      (door) => !door.node.locked && Phaser.Math.Distance.Between(this.player.x, this.player.y, door.x, door.y) < TOUCH_RADIUS,
    );

    // Re-arms once the player has walked away from every trigger zone —
    // needed because the dojo opens as an overlay without leaving this
    // scene, so its trigger must be able to fire again on a later visit.
    if (!nearStore && !nearDojo && !nearDoor) {
      this.entered = false;
      return;
    }
    if (this.entered) return;

    if (nearStore) {
      this.entered = true;
      this.game.events.emit("enter-store");
      return;
    }
    if (nearDojo) {
      this.entered = true;
      this.game.events.emit("enter-dojo");
      return;
    }
    if (nearDoor) {
      this.entered = true;
      this.game.events.emit("enter-problem", nearDoor.node.id);
    }
  }
}
