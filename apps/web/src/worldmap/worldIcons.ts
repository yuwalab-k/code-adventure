// World-object icons (store/dojo/door/plaque/training), drawn with the same
// grid+palette technique as the player/mascot/monster sprites (see
// pixelTexture.ts generatePixelTexture) instead of smooth vector shapes —
// one consistent "2D dot" drawing rule for every object in the game world.

const STORE_ROWS = [
  "....11....",
  "...1111...",
  "..111111..",
  ".11111111.",
  "1111111111",
  "1111111111",
  "1122222211",
  "1111111111",
  "1111..1111",
  "1111..1111",
];

const DOJO_ROWS = [
  "1111111111",
  ".11111111.",
  "..111111..",
  "..111111..",
  "1111111111",
  ".11111111.",
  ".12222221.",
  ".11111111.",
  ".111..111.",
  ".111..111.",
];

const DOOR_ROWS = [
  ".111111.",
  "11111111",
  "11111111",
  "11222211",
  "11111111",
  "11111111",
  "11111111",
  "11111111",
  "11....11",
  "11....11",
];

const PLAQUE_ROWS = [
  "..1111..",
  ".111111.",
  ".122221.",
  ".111111.",
  ".111111.",
  "..1111..",
  "...11...",
  "...11...",
  "...11...",
  "..1111..",
];

const TRAINING_ROWS = [
  "11....11",
  "11....11",
  "11111111",
  "..1111..",
  "..1111..",
  "11111111",
  "11....11",
  "11....11",
];

export const WORLD_ICON_ROWS = {
  store: STORE_ROWS,
  dojo: DOJO_ROWS,
  door: DOOR_ROWS,
  plaque: PLAQUE_ROWS,
  training: TRAINING_ROWS,
} as const;

export type WorldIconKind = keyof typeof WORLD_ICON_ROWS;
