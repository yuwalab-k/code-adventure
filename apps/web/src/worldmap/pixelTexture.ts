import Phaser from "phaser";

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
  "..2222..",
  ".222222.",
  ".2ffff2.",
  ".2f11f2.",
  "..ffff..",
  ".333333.",
  ".333333.",
  ".33..33.",
  ".44..44.",
  ".44..44.",
];

const PLAYER_PALETTE: Record<string, number> = {
  "2": 0x4a3728, // hair
  f: 0xffdbac, // skin
  "1": 0x2b2440, // eyes
  "3": 0x7c3aed, // shirt
  "4": 0x2b2440, // pants
};

export function generatePlayerTexture(scene: Phaser.Scene, key = "player"): void {
  generatePixelTexture(scene, key, PLAYER_ROWS, PLAYER_PALETTE, 1.5);
}
