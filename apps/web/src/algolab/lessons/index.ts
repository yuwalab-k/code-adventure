import type { AlgoLesson } from "../lesson";

// Lesson content as typed TS data (not JSON files under repo-root data/,
// which scripts/seed owns for backend-seeded AtCoder content) — this stage
// is intentionally client-only for now, so its content ships as part of
// the web bundle. Shape stays JSON-serializable in spirit.
export const LESSONS: AlgoLesson[] = [
  {
    id: "forward-1",
    title: "まっすぐ進もう",
    instruction: "move_forward() を必要な回数だけ書いて、ロボットをゴール（緑のマス）まで歩かせよう。",
    grid: ["#######", "#S...G#", "#######"],
    startFacing: "right",
    starterCode: "# move_forward() をならべてゴールまで進もう\n",
  },
  {
    id: "turn-1",
    title: "曲がってみよう",
    instruction:
      "turn_left() / turn_right() で向きを変えられる。move_forward() と組み合わせて角を曲がり、ゴールを目指そう。",
    grid: ["#######", "#S....#", "####.##", "#....G#", "#######"],
    startFacing: "right",
    starterCode: "# move_forward() / turn_left() / turn_right() を組み合わせよう\n",
  },
  {
    id: "loop-1",
    title: "くり返しで進もう",
    instruction:
      "at_wall() で「前が壁か」、at_goal() で「ゴールに着いたか」を調べられる。while 文で、着くまで自動的に歩かせてみよう。",
    grid: ["######", "#S...#", "####.#", "####G#", "######"],
    startFacing: "right",
    starterCode: "while not at_goal():\n    if at_wall():\n        turn_right()\n    else:\n        move_forward()\n",
  },
];
