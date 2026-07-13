import Phaser from "phaser";

// Idle squash/stretch wobble, BABA IS YOU style — objects are never fully
// still, even when the player isn't moving anything.
export function addIdleWiggle(scene: Phaser.Scene, target: Phaser.GameObjects.Sprite): void {
  scene.tweens.add({
    targets: target,
    scaleX: { from: 0.92, to: 1.08 },
    scaleY: { from: 1.08, to: 0.92 },
    duration: 450 + Math.random() * 200,
    delay: Math.random() * 400,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
}
