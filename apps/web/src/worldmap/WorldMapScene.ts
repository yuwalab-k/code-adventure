import Phaser from "phaser";
import {
  generatePlayerTexture,
  generateMascotTexture,
  generateNpcTexture,
  generateWorldIconTexture,
  generateBadgeTexture,
} from "./pixelTexture";
import type { NpcMotif } from "../npc/npcFrames";

export interface MapArea {
  id: string;
  name: string;
  position: number;
  unlockRating: number;
  unlocked: boolean;
  gateX: number | null;
  gateY: number | null;
}

export interface MapNpc {
  id: string;
  title: string;
  difficulty: number;
  areaId: string;
  mapX: number | null;
  mapY: number | null;
  npcMotif: NpcMotif;
  status: "not_started" | "attempted" | "cleared";
  locked: boolean;
}

const AREA_WIDTH = 480;
const GATE_GAP = 100;
const PLAZA_HEIGHT = 360;
const TOUCH_RADIUS = 34;
const MOVE_SPEED = 160;
const ARRIVE_RADIUS = 6;
const ZOOM = 1.4;
const NPC_MOTIFS: NpcMotif[] = ["student", "engineer", "robot", "book", "computer"];

interface AreaBand {
  area: MapArea;
  startX: number;
  endX: number;
  gateX: number | null; // gate at the *end* of this band, null for the last area
}

interface NpcObject {
  npc: MapNpc;
  x: number;
  y: number;
}

export class WorldMapScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private mascot!: Phaser.GameObjects.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private bands: AreaBand[] = [];
  private npcObjects: NpcObject[] = [];
  private npcSprites: Record<string, Phaser.GameObjects.Sprite> = {};
  private npcBadges: Record<string, Phaser.GameObjects.Sprite> = {};
  private gateSprites: Record<string, Phaser.GameObjects.Sprite> = {};
  private currentAreaId: string | null = null;
  private currentNpcId: string | null = null;
  private moveTarget: Phaser.Math.Vector2 | null = null;
  private plazaWidth = AREA_WIDTH;

  constructor() {
    super("WorldMapScene");
  }

  preload() {
    generatePlayerTexture(this, "player");
    generateMascotTexture(this, "mascot-companion");
    NPC_MOTIFS.forEach((m) => generateNpcTexture(this, m));
    generateWorldIconTexture(this, "gate");
    generateBadgeTexture(this, "available");
    generateBadgeTexture(this, "cleared");
  }

  create() {
    this.currentNpcId = null;
    this.moveTarget = null;
    this.currentAreaId = null;
    this.bands = [];
    this.npcObjects = [];
    this.npcSprites = {};
    this.npcBadges = {};
    this.gateSprites = {};

    const areas = (this.registry.get("areas") as MapArea[]) ?? [];
    const npcs = (this.registry.get("npcs") as MapNpc[]) ?? [];

    this.bands = areas
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((area, i) => {
        const startX = i * (AREA_WIDTH + GATE_GAP);
        const endX = startX + AREA_WIDTH;
        return { area, startX, endX, gateX: i < areas.length - 1 ? endX + GATE_GAP / 2 : null };
      });
    this.plazaWidth = this.bands.length > 0 ? this.bands[this.bands.length - 1].endX + 40 : AREA_WIDTH;

    for (const band of this.bands) {
      const npcsInArea = npcs.filter((n) => n.areaId === band.area.id);
      npcsInArea.forEach((npc, i) => {
        const x = npc.mapX ?? band.startX + ((i + 1) * AREA_WIDTH) / (npcsInArea.length + 1);
        const y = npc.mapY ?? PLAZA_HEIGHT / 2;
        this.createNpc(npc, x, y);
      });
      if (band.gateX !== null) this.createGate(band);
    }

    this.player = this.physics.add.sprite(40, PLAZA_HEIGHT / 2, "player");
    this.player.setCollideWorldBounds(true);
    this.physics.world.setBounds(0, 0, this.plazaWidth, PLAZA_HEIGHT);

    this.mascot = this.add.sprite(this.player.x - 20, this.player.y + 6, "mascot-companion");

    this.cursors = this.input.keyboard!.createCursorKeys();

    // Tap/click a spot in the room to walk there — smartphone-game style
    // control, in addition to arrow keys for desktop.
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.moveTarget = new Phaser.Math.Vector2(world.x, world.y);
    });

    this.cameras.main.setBounds(0, 0, this.plazaWidth, PLAZA_HEIGHT);
    this.cameras.main.setZoom(ZOOM);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.scale.on("resize", () => this.cameras.main.setZoom(ZOOM));

    this.registry.events.on("changedata-areas", (_p: unknown, value: MapArea[]) => this.applyAreaState(value));
    this.registry.events.on("changedata-npcs", (_p: unknown, value: MapNpc[]) => this.applyNpcState(value));

    // Report the starting area once the scene settles.
    this.reportAreaIfChanged();
  }

  private createNpc(npc: MapNpc, x: number, y: number) {
    const sprite = this.add.sprite(x, y, `npc-${npc.npcMotif}`);
    this.applyNpcTint(sprite, npc);

    const badgeKey = npc.status === "cleared" ? "badge-cleared" : "badge-available";
    const badge = this.add.sprite(x + 10, y - 12, badgeKey);
    if (npc.locked) badge.setVisible(false);

    this.add
      .text(x, y - 20, npc.title, { fontSize: "9px", color: "#ffffff", align: "center" })
      .setOrigin(0.5, 1)
      .setWordWrapWidth(80);
    this.add.text(x, y + 14, `★${npc.difficulty}`, { fontSize: "9px", color: "#ffffff" }).setOrigin(0.5, 0);

    this.npcSprites[npc.id] = sprite;
    this.npcBadges[npc.id] = badge;
    this.npcObjects.push({ npc, x, y });
  }

  private applyNpcTint(sprite: Phaser.GameObjects.Sprite, npc: MapNpc) {
    if (npc.locked) sprite.setTint(0x444444);
    else if (npc.status === "cleared") sprite.setTint(0x888888);
    else sprite.clearTint();
  }

  private applyNpcState(npcs: MapNpc[]) {
    for (const npc of npcs) {
      const sprite = this.npcSprites[npc.id];
      const badge = this.npcBadges[npc.id];
      if (!sprite || !badge) continue;
      this.applyNpcTint(sprite, npc);
      badge.setTexture(npc.status === "cleared" ? "badge-cleared" : "badge-available");
      badge.setVisible(!npc.locked);
      const obj = this.npcObjects.find((o) => o.npc.id === npc.id);
      if (obj) obj.npc = npc;
    }
  }

  private createGate(band: AreaBand) {
    if (band.gateX === null) return;
    const y = PLAZA_HEIGHT / 2;
    const sprite = this.add.sprite(band.gateX, y, "world-icon-gate");
    this.gateSprites[band.area.id] = sprite;
    this.add
      .text(band.gateX, y - 30, "closed gate", { fontSize: "9px", color: "#ffffff" })
      .setOrigin(0.5, 1);
  }

  private applyAreaState(areasList: MapArea[]) {
    for (const band of this.bands) {
      const updated = areasList.find((a) => a.id === band.area.id);
      if (!updated) continue;
      band.area = updated;
      const gate = this.gateSprites[band.area.id];
      if (!gate) continue;
      // The gate stands for "can I pass into the NEXT area" — tint by whether
      // the following band (by position) is unlocked.
      const next = this.bands.find((b) => b.area.position === band.area.position + 1);
      gate.setTint(next?.area.unlocked ? 0x888888 : 0x333333);
    }
  }

  private reportAreaIfChanged() {
    const band = this.bands.find((b) => this.player.x >= b.startX && this.player.x < b.endX + GATE_GAP);
    const areaId = band?.area.id ?? null;
    if (areaId !== this.currentAreaId) {
      this.currentAreaId = areaId;
      this.game.events.emit("area-changed", areaId);
    }
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
    this.mascot.x = Phaser.Math.Linear(this.mascot.x, this.player.x - 22, 0.08);
    this.mascot.y = Phaser.Math.Linear(this.mascot.y, this.player.y + 8 + bob, 0.08);

    this.reportAreaIfChanged();

    // Continuous proximity report (not a one-shot trigger) — the bottom
    // conversation panel just mirrors "who am I standing next to", so
    // walking away closes it automatically, no dismiss button needed.
    const nearNpc = this.npcObjects.find(
      (o) =>
        !o.npc.locked &&
        Phaser.Math.Distance.Between(this.player.x, this.player.y, o.x, o.y) < TOUCH_RADIUS,
    );
    const npcId = nearNpc?.npc.id ?? null;
    if (npcId !== this.currentNpcId) {
      this.currentNpcId = npcId;
      this.game.events.emit("npc-nearby", npcId);
    }
  }
}
