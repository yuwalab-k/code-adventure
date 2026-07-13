import Phaser from "phaser";
import { MASCOT_FRAMES, MASCOT_BODY, MASCOT_EYE } from "../mascot/frames";
import { MONSTER_ROWS, MONSTER_BODY, MONSTER_EYE, type MonsterVariant } from "../monsters/monsterFrames";

export function generatePixelTexture(
  scene: Phaser.Scene,
  key: string,
  rows: string[],
  palette: Record<string, number>,
  cellSize = 6,
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
  "2": 0x333333, // hair
  f: 0xeeeeee, // skin
  "1": 0x000000, // eyes
  "3": 0x555555, // shirt
  "4": 0x000000, // pants
};

export function generatePlayerTexture(scene: Phaser.Scene, key = "player"): void {
  generatePixelTexture(scene, key, PLAYER_ROWS, PLAYER_PALETTE, 1.5);
}

const MASCOT_PALETTE: Record<string, number> = {
  "1": Phaser.Display.Color.HexStringToColor(MASCOT_BODY).color,
  "2": Phaser.Display.Color.HexStringToColor(MASCOT_EYE).color,
  "3": Phaser.Display.Color.HexStringToColor(MASCOT_BODY).color,
};

export function generateMascotTexture(scene: Phaser.Scene, key = "mascot-companion"): void {
  generatePixelTexture(scene, key, MASCOT_FRAMES.idle, MASCOT_PALETTE, 1.5);
}

export function generateMonsterTexture(scene: Phaser.Scene, variant: MonsterVariant, cellSize = 3): string {
  const key = `monster-${variant}`;
  const palette: Record<string, number> = {
    "1": Phaser.Display.Color.HexStringToColor(MONSTER_BODY[variant]).color,
    "2": Phaser.Display.Color.HexStringToColor(MONSTER_EYE[variant]).color,
  };
  generatePixelTexture(scene, key, MONSTER_ROWS[variant], palette, cellSize);
  return key;
}
