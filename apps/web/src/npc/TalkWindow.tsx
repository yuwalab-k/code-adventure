import { NpcPortrait } from "./NpcPortrait";
import type { MapNpc } from "../worldmap/WorldMapScene";

const STATUS_LABEL: Record<MapNpc["status"], string> = {
  not_started: "未挑戦",
  attempted: "挑戦中",
  cleared: "クリア済み",
};

export function TalkWindow({ npc, onChallenge }: { npc: MapNpc; onChallenge: () => void }) {
  return (
    <div className="talk-window">
      <NpcPortrait motif={npc.npcMotif} />
      <div className="talk-window-body">
        <p className="talk-window-title">
          {npc.title} <span className="talk-window-difficulty">★{npc.difficulty}</span>
        </p>
        <p className="talk-window-status">{STATUS_LABEL[npc.status]}</p>
        <button className="talk-window-cta" onClick={onChallenge}>
          <span className="choice-cursor">▶</span> {npc.status === "not_started" ? "挑戦する" : "もう一度挑戦する"}
        </button>
      </div>
    </div>
  );
}
