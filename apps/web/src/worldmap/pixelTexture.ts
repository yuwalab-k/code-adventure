import Phaser from "phaser";
import { MASCOT_FRAMES, MASCOT_BODY, MASCOT_EYE } from "../mascot/frames";
import { NPC_ROWS, type NpcMotif } from "../npc/npcFrames";
import { WORLD_ICON_ROWS, BADGE_ROWS, type WorldIconKind, type BadgeKind } from "./worldIcons";

// One dot size for every pixel-art object in the game world (player, mascot,
// NPCs, gates) — the grid unit must match everywhere for it to read as one
// consistent pixel-art world instead of mismatched scales.
export const PIXEL_UNIT = 1.5;

export function generatePixelTexture(
  scene: Phaser.Scene,
  key: string,
  rows: string[],
  palette: Record<string, number>,
  cellSize = PIXEL_UNIT,
): void {
  if (scene.textures.exists(key)) return;

  const graphics = scene.make.graphics({ x: 0, y: 0 });
  rows.forEach((row, y) => {
    [...row].forEach((char, x) => {
      const color = palette[char];
      if (color === undefined) return;
      graphics.fillStyle(color, 1);
      graphics.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    });
  });

  const width = rows[0].length * cellSize;
  const height = rows.length * cellSize;
  graphics.generateTexture(key, width, height);
  graphics.destroy();
}

const PLAYER_ROWS = [
  "...2222...",
  "..222222..",
  ".22ffff22.",
  ".2ff11ff2.",
  "..2ffff2..",
  "..333333..",
  ".33333333.",
  ".33....33.",
  "..44..44..",
  "..44..44..",
];

const PLAYER_PALETTE: Record<string, number> = {
  "2": 0xffffff, // hair
  f: 0xaaaaaa, // skin
  "1": 0x000000, // eyes
  "3": 0x777777, // shirt
  "4": 0x333333, // pants
};

export function generatePlayerTexture(scene: Phaser.Scene, key = "player"): void {
  generatePixelTexture(scene, key, PLAYER_ROWS, PLAYER_PALETTE);
}

const MASCOT_PALETTE: Record<string, number> = {
  "1": Phaser.Display.Color.HexStringToColor(MASCOT_BODY).color,
  "2": Phaser.Display.Color.HexStringToColor(MASCOT_EYE).color,
  "3": Phaser.Display.Color.HexStringToColor(MASCOT_BODY).color,
};

export function generateMascotTexture(scene: Phaser.Scene, key = "mascot-companion"): void {
  generatePixelTexture(scene, key, MASCOT_FRAMES.idle, MASCOT_PALETTE);
}

// NPCs stay near-white so setTint() can recolor them for locked/cleared state.
const NPC_PALETTE: Record<string, number> = { "1": 0xffffff, "2": 0x000000 };

export function generateNpcTexture(scene: Phaser.Scene, motif: NpcMotif): string {
  const key = `npc-${motif}`;
  generatePixelTexture(scene, key, NPC_ROWS[motif], NPC_PALETTE);
  return key;
}

// gates stay near-white so setTint() can show locked (dim) vs unlocked (bright).
const WORLD_ICON_PALETTE: Record<string, number> = { "1": 0xffffff };

export function generateWorldIconTexture(scene: Phaser.Scene, kind: WorldIconKind): string {
  const key = `world-icon-${kind}`;
  generatePixelTexture(scene, key, WORLD_ICON_ROWS[kind], WORLD_ICON_PALETTE);
  return key;
}

const BADGE_PALETTE: Record<string, number> = { "1": 0xffffff };

export function generateBadgeTexture(scene: Phaser.Scene, kind: BadgeKind): string {
  const key = `badge-${kind}`;
  generatePixelTexture(scene, key, BADGE_ROWS[kind], BADGE_PALETTE, PIXEL_UNIT * 1.5);
  return key;
}
