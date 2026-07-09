import Phaser from "phaser";
import { generatePlayerTexture } from "./pixelTexture";

export interface WorldMapNode {
  id: string;
  title: string;
  locked: boolean;
  cleared: boolean;
  mapX: number | null;
  mapY: number | null;
}

const PLAZA_WIDTH = 800;
const PLAZA_HEIGHT = 480;
const ENTER_RADIUS = 48;
const MOVE_SPEED = 160;

interface DoorObject {
  node: WorldMapNode;
  container: Phaser.GameObjects.Container;
  x: number;
  y: number;
}

export class WorldMapScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private enterKey!: Phaser.Input.Keyboard.Key;
  private doors: DoorObject[] = [];
  private promptText!: Phaser.GameObjects.Text;
  private nearbyDoor: DoorObject | null = null;

  constructor() {
    super("WorldMapScene");
  }

  preload() {
    generatePlayerTexture(this, "player");
  }

  create() {
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

    const nodes = (this.registry.get("nodes") as WorldMapNode[]) ?? [];
    this.doors = nodes.map((node, index) => this.createDoor(node, index, nodes.length));

    this.player = this.physics.add.sprite(PLAZA_WIDTH / 2, PLAZA_HEIGHT - 60, "player");
    this.player.setCollideWorldBounds(true);
    this.physics.world.setBounds(0, 0, PLAZA_WIDTH, PLAZA_HEIGHT);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.promptText = this.add
      .text(0, 0, "スペースキーで入る", {
        fontSize: "14px",
        color: "#2b2440",
        backgroundColor: "#fbf9f5",
        padding: { x: 6, y: 4 },
      })
      .setVisible(false)
      .setDepth(10);

    this.cameras.main.setBounds(0, 0, PLAZA_WIDTH, PLAZA_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  private createDoor(node: WorldMapNode, index: number, total: number): DoorObject {
    const x = node.mapX ?? 100 + (index * (PLAZA_WIDTH - 200)) / Math.max(total - 1, 1);
    const y = node.mapY ?? PLAZA_HEIGHT / 2;

    const color = node.locked ? 0x9ca3af : node.cleared ? 0x16a34a : 0x7c3aed;
    const rect = this.add.rectangle(0, 0, 48, 64, color).setStrokeStyle(2, 0x2b2440);
    const label = this.add
      .text(0, -46, node.title, { fontSize: "11px", color: "#2b2440", align: "center" })
      .setOrigin(0.5, 1)
      .setWordWrapWidth(90);

    const container = this.add.container(x, y, [rect, label]);
    return { node, container, x, y };
  }

  update() {
    if (!this.player.body) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0);

    if (this.cursors.left.isDown) body.setVelocityX(-MOVE_SPEED);
    else if (this.cursors.right.isDown) body.setVelocityX(MOVE_SPEED);
    if (this.cursors.up.isDown) body.setVelocityY(-MOVE_SPEED);
    else if (this.cursors.down.isDown) body.setVelocityY(MOVE_SPEED);

    let closest: DoorObject | null = null;
    let closestDist = Infinity;
    for (const door of this.doors) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, door.x, door.y);
      if (dist < ENTER_RADIUS && dist < closestDist) {
        closest = door;
        closestDist = dist;
      }
    }

    this.nearbyDoor = closest && !closest.node.locked ? closest : null;

    if (this.nearbyDoor) {
      this.promptText.setPosition(this.nearbyDoor.x - 60, this.nearbyDoor.y + 20).setVisible(true);
    } else {
      this.promptText.setVisible(false);
    }

    if (this.nearbyDoor && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.game.events.emit("enter-problem", this.nearbyDoor.node.id);
    }
  }
}
