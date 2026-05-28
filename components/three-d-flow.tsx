import type { CSSProperties } from "react";

type ThreeDFlowProps = {
  items: string[];
};

export function ThreeDFlow({ items }: ThreeDFlowProps) {
  return (
    <div className="observe-section flow-stage grid gap-4 md:grid-cols-3">
      {items.map((item, index) => (
        <div key={item} className="flow-card" style={{ "--flow-index": index } as CSSProperties}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <p>{item}</p>
        </div>
      ))}
    </div>
  );
}
