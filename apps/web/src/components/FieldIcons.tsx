import type { FieldObject } from "../game/types";

// Pixel-art decoration icons, ported from stage1_field_mockup.html.
export function FieldIcon({ kind }: { kind: FieldObject }) {
  switch (kind) {
    case "bush":
      return (
        <svg viewBox="0 0 14 10" className="field-icon">
          <g fill="#1c1c1c">
            <rect x="3" y="2" width="8" height="1" />
            <rect x="1" y="3" width="12" height="5" />
            <rect x="2" y="8" width="10" height="1" />
          </g>
        </svg>
      );
    case "tree":
      return (
        <svg viewBox="0 0 12 15" className="field-icon">
          <g fill="#1c1c1c">
            <rect x="5" y="9" width="2" height="6" />
            <rect x="2" y="1" width="8" height="8" />
          </g>
        </svg>
      );
    case "sign":
      return (
        <svg viewBox="0 0 14 9" className="field-icon">
          <g fill="#1c1c1c">
            <rect x="1" y="4" width="3" height="3" />
            <rect x="4" y="2" width="6" height="5" />
            <rect x="10" y="4" width="3" height="3" />
          </g>
        </svg>
      );
    case "gate":
      return (
        <svg viewBox="0 0 9 7" className="field-icon">
          <g fill="#1c1c1c">
            <rect x="2" y="1" width="5" height="1" />
            <rect x="1" y="2" width="7" height="3" />
            <rect x="2" y="5" width="5" height="1" />
          </g>
        </svg>
      );
    default:
      return null;
  }
}
