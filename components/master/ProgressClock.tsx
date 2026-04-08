"use client";

interface ProgressClockProps {
  segments: number;
  filled: number;
  onSegmentClick: (index: number) => void;
}

function describeSlice(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

export function ProgressClock({ segments, filled, onSegmentClick }: ProgressClockProps) {
  const cx = 50;
  const cy = 50;
  const r = 45;

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-20 h-20"
      aria-label={`Relogio de progresso: ${filled} de ${segments} segmentos preenchidos`}
    >
      {Array.from({ length: segments }, (_, i) => {
        const startAngle = (i / segments) * 2 * Math.PI - Math.PI / 2;
        const endAngle = ((i + 1) / segments) * 2 * Math.PI - Math.PI / 2;
        const isFilled = i < filled;
        return (
          <path
            key={i}
            d={describeSlice(cx, cy, r, startAngle, endAngle)}
            fill={isFilled ? "#D4AF37" : "transparent"}
            stroke="#D4AF37"
            strokeWidth="1.5"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onSegmentClick(i)}
          />
        );
      })}
    </svg>
  );
}
