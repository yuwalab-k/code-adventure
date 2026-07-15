import Phaser from "phaser";
import { generatePixelTexture } from "../worldmap/pixelTexture";
import { COLOR, hex } from "./theme";
import { ROBOT_ROWS } from "./robotFrames";
import { type ParsedGrid, TileType, facingAngle, parseGrid } from "./tileGrid";
import type { RobotStep } from "./robotProgram";
import type { RunResult } from "./algolabWorker";
import type { AlgoLesson } from "./lesson";

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 600;

const MAZE_X = 20;
const MAZE_Y = 70;
const MAZE_W = 420;
const MAZE_H = 460;
const MAX_TILE = 56;

const PANEL_X = 460;
export const CODE_BOX = { x: PANEL_X, y: 150, width: 460, height: 240 };

const FONT = "14px monospace";
const LINE_HEIGHT = 21;

export interface CodeValue {
  text: string;
  cursor: number;
}

// A small, self-contained Phaser scene (fixed 960x600 canvas, no
// scroll/resize) for the algorithm-understanding stage: a maze on the
// left, a code editor + controls on the right. Deliberately not the
// fullscreen/camera-following pattern WorldMapScene uses — this is a
// discrete lesson screen, not an open world.
export class AlgoLabScene extends Phaser.Scene {
  private lesson!: AlgoLesson;
  private grid!: ParsedGrid;
  private tileSize = 40;
  private originX = 0;
  private originY = 0;

  private robot!: Phaser.GameObjects.Sprite;
  private goalTile: Phaser.GameObjects.Rectangle | null = null;
  private codeText!: Phaser.GameObjects.Text;
  private cursorRect!: Phaser.GameObjects.Rectangle;
  private resultText!: Phaser.GameObjects.Text;
  private runButton!: Phaser.GameObjects.Rectangle;
  private charWidth = 8.4;
  private busy = false;

  constructor() {
    super("AlgoLabScene");
  }

  preload(): void {
    generatePixelTexture(this, "algolab-floor", ["1"], { "1": hex(COLOR.floor) }, MAX_TILE);
    generatePixelTexture(this, "algolab-floor-alt", ["1"], { "1": hex(COLOR.floorAlt) }, MAX_TILE);
    generatePixelTexture(this, "algolab-wall", ["1"], { "1": hex(COLOR.wall) }, MAX_TILE);
    generatePixelTexture(this, "algolab-robot", ROBOT_ROWS, {
      "1": hex(COLOR.robotBody),
      "2": hex(COLOR.robotDetail),
    });
  }

  create(): void {
    this.lesson = this.game.registry.get("lesson") as AlgoLesson;
    this.grid = parseGrid(this.lesson.grid, this.lesson.startFacing);
    this.busy = false;

    this.cameras.main.setBackgroundColor(COLOR.bg);
    this.measureFont();
    this.layoutMaze();
    this.buildRightPanel();

    const initialCode = this.game.registry.get("code") as CodeValue | undefined;
    if (initialCode) this.updateCodeMirror(initialCode);
    this.game.registry.events.on("changedata-code", (_parent: unknown, value: CodeValue) => {
      this.updateCodeMirror(value);
    });

    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => this.cursorRect.setVisible(!this.cursorRect.visible),
    });
  }

  private measureFont(): void {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.font = FONT;
    this.charWidth = ctx.measureText("M").width;
  }

  private layoutMaze(): void {
    const tileSize = Math.min(Math.floor(MAZE_W / this.grid.cols), Math.floor(MAZE_H / this.grid.rows), MAX_TILE);
    this.tileSize = tileSize;
    const gridW = tileSize * this.grid.cols;
    const gridH = tileSize * this.grid.rows;
    this.originX = MAZE_X + (MAZE_W - gridW) / 2;
    this.originY = MAZE_Y + (MAZE_H - gridH) / 2;

    for (let row = 0; row < this.grid.rows; row++) {
      for (let col = 0; col < this.grid.cols; col++) {
        const type = this.grid.tiles[row][col];
        const x = this.originX + col * tileSize;
        const y = this.originY + row * tileSize;
        if (type === TileType.Wall) {
          this.add.image(x, y, "algolab-wall").setOrigin(0, 0).setDisplaySize(tileSize, tileSize);
        } else if (type === TileType.Goal) {
          this.goalTile = this.add.rectangle(x, y, tileSize, tileSize, hex(COLOR.goal)).setOrigin(0, 0);
        } else {
          const key = (row + col) % 2 === 0 ? "algolab-floor" : "algolab-floor-alt";
          this.add.image(x, y, key).setOrigin(0, 0).setDisplaySize(tileSize, tileSize);
        }
      }
    }

    const robotSize = tileSize * 0.7;
    const start = this.cellCenter(this.grid.start.col, this.grid.start.row);
    this.robot = this.add
      .sprite(start.x, start.y, "algolab-robot")
      .setDisplaySize(robotSize, robotSize)
      .setAngle(facingAngle(this.grid.startFacing));
  }

  private cellCenter(col: number, row: number): { x: number; y: number } {
    return { x: this.originX + col * this.tileSize + this.tileSize / 2, y: this.originY + row * this.tileSize + this.tileSize / 2 };
  }

  private buildRightPanel(): void {
    this.add.text(PANEL_X, 16, this.lesson.title, { fontFamily: "monospace", fontSize: "20px", color: COLOR.textLight }).setOrigin(0, 0);
    this.add
      .text(PANEL_X, 50, this.lesson.instruction, {
        fontFamily: "monospace",
        fontSize: "13px",
        color: COLOR.textLight,
        wordWrap: { width: 460 },
      })
      .setOrigin(0, 0);

    const box = this.add.rectangle(CODE_BOX.x, CODE_BOX.y, CODE_BOX.width, CODE_BOX.height, hex(COLOR.panelBg)).setOrigin(0, 0);
    box.setStrokeStyle(2, hex(COLOR.panelBorder));

    const maskShape = this.make.graphics({});
    maskShape.fillRect(CODE_BOX.x, CODE_BOX.y, CODE_BOX.width, CODE_BOX.height);
    const mask = maskShape.createGeometryMask();

    this.codeText = this.add
      .text(CODE_BOX.x + 8, CODE_BOX.y + 8, "", { fontFamily: "monospace", fontSize: "14px", color: COLOR.text })
      .setOrigin(0, 0)
      .setLineSpacing(LINE_HEIGHT - 16);
    this.codeText.setMask(mask);

    this.cursorRect = this.add
      .rectangle(CODE_BOX.x + 8, CODE_BOX.y + 8, 2, LINE_HEIGHT - 4, hex(COLOR.accentYellow))
      .setOrigin(0, 0);

    const buttonY = CODE_BOX.y + CODE_BOX.height + 16;
    this.runButton = this.add
      .rectangle(PANEL_X, buttonY, 110, 36, hex(COLOR.accentYellow))
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.requestRun());
    this.add
      .text(PANEL_X + 55, buttonY + 18, "実行", { fontFamily: "monospace", fontSize: "14px", color: COLOR.text })
      .setOrigin(0.5, 0.5);

    const resetButton = this.add
      .rectangle(PANEL_X + 126, buttonY, 110, 36, hex(COLOR.panelBg))
      .setOrigin(0, 0)
      .setStrokeStyle(2, hex(COLOR.panelBorder))
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.resetRobot());
    this.add
      .text(PANEL_X + 181, buttonY + 18, "リセット", { fontFamily: "monospace", fontSize: "14px", color: COLOR.text })
      .setOrigin(0.5, 0.5);
    resetButton.setData("static", true);

    const backButton = this.add
      .rectangle(20, 20, 90, 32, hex(COLOR.panelBg))
      .setOrigin(0, 0)
      .setStrokeStyle(2, hex(COLOR.panelBorder))
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.game.events.emit("algolab-exit"));
    this.add.text(65, 36, "一覧へ", { fontFamily: "monospace", fontSize: "13px", color: COLOR.text }).setOrigin(0.5, 0.5);
    backButton.setData("static", true);

    this.resultText = this.add
      .text(PANEL_X, buttonY + 52, "", { fontFamily: "monospace", fontSize: "13px", color: COLOR.textLight, wordWrap: { width: 460 } })
      .setOrigin(0, 0);
  }

  private updateCodeMirror(value: CodeValue): void {
    this.codeText.setText(value.text);
    const before = value.text.slice(0, value.cursor);
    const lines = before.split("\n");
    const lineIndex = lines.length - 1;
    const colIndex = lines[lines.length - 1].length;
    this.cursorRect.setPosition(CODE_BOX.x + 8 + colIndex * this.charWidth, CODE_BOX.y + 8 + lineIndex * LINE_HEIGHT);
    this.cursorRect.setVisible(true);
  }

  private setButtonsEnabled(enabled: boolean): void {
    this.busy = !enabled;
    this.runButton.setAlpha(enabled ? 1 : 0.5);
  }

  private requestRun(): void {
    if (this.busy) return;
    this.resultText.setText("");
    this.setButtonsEnabled(false);
    const code = (this.game.registry.get("code") as CodeValue | undefined)?.text ?? "";
    this.game.events.emit("algolab-run-requested", code);
  }

  resetRobot(): void {
    if (this.busy) return;
    const start = this.cellCenter(this.grid.start.col, this.grid.start.row);
    this.robot.setPosition(start.x, start.y);
    this.robot.setAngle(facingAngle(this.grid.startFacing));
    this.resultText.setText("");
  }

  // Called by AlgoLabCanvas once the worker returns — plays the recorded
  // step list back tile-by-tile, then the clear/fail reaction. A runaway
  // script can produce hundreds of steps (up to the 500-step cap); at the
  // normal ~150ms/step pace that would take over a minute to watch, so
  // long runs fast-forward instead of making the player wait it out.
  async playResult(result: RunResult): Promise<void> {
    this.resetRobot();
    this.setButtonsEnabled(false);
    const speed = result.steps.length > 40 ? 15 : 150;
    for (const step of result.steps) {
      await this.animateStep(step, speed);
    }
    if (result.status === "clear") {
      await this.playClear();
    } else if (result.status === "fail") {
      await this.playFail(this.failMessage(result.reason));
    } else {
      await this.playFail(`エラー: ${result.message}`);
    }
    this.setButtonsEnabled(true);
  }

  private failMessage(reason: "step_limit" | "call_limit" | "not_cleared"): string {
    if (reason === "step_limit") return "手数が多すぎます（500手）。ムダな動きがないか見直してみよう。";
    if (reason === "call_limit") return "処理が終わりません。無限ループになっていないか確認しよう。";
    return "ゴールにたどりつけませんでした。";
  }

  private animateStep(step: RobotStep, speed: number): Promise<void> {
    return new Promise((resolve) => {
      const targetAngle = facingAngle(step.facing);
      if (step.action !== "forward") {
        this.tweens.add({ targets: this.robot, angle: targetAngle, duration: speed, onComplete: () => resolve() });
        return;
      }
      if (step.bumped) {
        const nudge = this.facingVector(step.facing);
        const ox = this.robot.x;
        const oy = this.robot.y;
        this.tweens.add({
          targets: this.robot,
          x: ox + nudge.x * (this.tileSize * 0.18),
          y: oy + nudge.y * (this.tileSize * 0.18),
          duration: Math.max(speed * 0.6, 12),
          yoyo: true,
          onComplete: () => resolve(),
        });
        return;
      }
      const target = this.cellCenter(step.cell.col, step.cell.row);
      this.tweens.add({ targets: this.robot, x: target.x, y: target.y, duration: speed, onComplete: () => resolve() });
    });
  }

  private facingVector(facing: RobotStep["facing"]): { x: number; y: number } {
    switch (facing) {
      case "up":
        return { x: 0, y: -1 };
      case "down":
        return { x: 0, y: 1 };
      case "left":
        return { x: -1, y: 0 };
      case "right":
        return { x: 1, y: 0 };
    }
  }

  private playClear(): Promise<void> {
    this.resultText.setText("ゴール！");
    return new Promise((resolve) => {
      this.tweens.add({
        targets: this.robot,
        angle: this.robot.angle + 360,
        duration: 500,
        ease: "Sine.easeInOut",
      });
      if (this.goalTile) {
        this.tweens.add({
          targets: this.goalTile,
          scaleX: 1.15,
          scaleY: 1.15,
          yoyo: true,
          repeat: 2,
          duration: 200,
          onComplete: () => resolve(),
        });
      } else {
        this.time.delayedCall(600, () => resolve());
      }
    });
  }

  private playFail(message: string): Promise<void> {
    this.resultText.setText(message);
    return new Promise((resolve) => {
      const ox = this.robot.x;
      this.tweens.add({
        targets: this.robot,
        x: ox - 6,
        duration: 60,
        yoyo: true,
        repeat: 3,
        onComplete: () => resolve(),
      });
    });
  }
}
