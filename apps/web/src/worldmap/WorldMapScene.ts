import Phaser from "phaser";
import { generatePlayerTexture } from "./pixelTexture";

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
const STORE_X = 90;
const STORE_Y = 90;

interface DoorObject {
  node: WorldMapNode;
  x: number;
  y: number;
}

export class WorldMapScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private doors: DoorObject[] = [];
  private entered = false;

  constructor() {
    super("WorldMapScene");
  }

  preload() {
    generatePlayerTexture(this, "player");
  }

  create() {
    this.entered = false;

    this.add.grid(
      PLAZA_WIDTH / 2,
      PLAZA_HEIGHT / 2,
      PLAZA_WIDTH,
      PLAZA_HEIGHT,
      32,
      32,
      0xf1ecfb,
      1,
      0xe4dff2,
      1,
    );

    this.createStore();

    const nodes = (this.registry.get("nodes") as WorldMapNode[]) ?? [];
    this.doors = nodes.map((node, index) => this.createDoor(node, index, nodes.length));

    this.player = this.physics.add.sprite(PLAZA_WIDTH / 2, PLAZA_HEIGHT - 60, "player");
    this.player.setCollideWorldBounds(true);
    this.physics.world.setBounds(0, 0, PLAZA_WIDTH, PLAZA_HEIGHT);

    this.cursors = this.input.keyboard!.createCursorKeys();

    this.cameras.main.setBounds(0, 0, PLAZA_WIDTH, PLAZA_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  private createStore() {
    this.add.rectangle(STORE_X, STORE_Y, 64, 56, 0xf59e0b).setStrokeStyle(2, 0x2b2440);
    this.add.rectangle(STORE_X, STORE_Y - 20, 72, 20, 0xe11d48).setStrokeStyle(2, 0x2b2440);
    this.add
      .text(STORE_X, STORE_Y - 46, "ストア", { fontSize: "11px", color: "#2b2440", align: "center" })
      .setOrigin(0.5, 1);
  }

  private createDoor(node: WorldMapNode, index: number, total: number): DoorObject {
    const x = node.mapX ?? 200 + (index * (PLAZA_WIDTH - 300)) / Math.max(total - 1, 1);
    const y = node.mapY ?? PLAZA_HEIGHT / 2 + 40;

    const color = node.locked ? 0x9ca3af : node.cleared ? 0x16a34a : 0x7c3aed;
    this.add.rectangle(x, y, 48, 64, color).setStrokeStyle(2, 0x2b2440);
    this.add
      .text(x, y - 46, node.title, { fontSize: "11px", color: "#2b2440", align: "center" })
      .setOrigin(0.5, 1)
      .setWordWrapWidth(90);

    this.add.rectangle(x, y + 44, 40, 20, 0xfbf9f5).setStrokeStyle(1, 0x2b2440);
    this.add
      .text(x, y + 44, `★${node.difficulty}`, { fontSize: "12px", color: "#2b2440" })
      .setOrigin(0.5, 0.5);

    return { node, x, y };
  }

  update() {
    if (!this.player.body) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0);

    if (this.cursors.left.isDown) body.setVelocityX(-MOVE_SPEED);
    else if (this.cursors.right.isDown) body.setVelocityX(MOVE_SPEED);
    if (this.cursors.up.isDown) body.setVelocityY(-MOVE_SPEED);
    else if (this.cursors.down.isDown) body.setVelocityY(MOVE_SPEED);

    if (this.entered) return;

    if (Phaser.Math.Distance.Between(this.player.x, this.player.y, STORE_X, STORE_Y) < TOUCH_RADIUS) {
      this.entered = true;
      this.game.events.emit("enter-store");
      return;
    }

    for (const door of this.doors) {
      if (door.node.locked) continue;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, door.x, door.y);
      if (dist < TOUCH_RADIUS) {
        this.entered = true;
        this.game.events.emit("enter-problem", door.node.id);
        break;
      }
    }
  }
}
