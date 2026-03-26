"use client";

import type { Scores } from "@/lib/types";

interface RadarChartProps {
  scores: Scores;
}

const AXES = [
  { key: "impact" as const, label: "インパクト", max: 25 },
  { key: "specificity" as const, label: "具体性", max: 25 },
  { key: "targetFit" as const, label: "適合性", max: 20 },
  { key: "readability" as const, label: "読みやすさ", max: 15 },
  { key: "emotion" as const, label: "感情設計", max: 15 },
];

const SIZE = 300;
const CENTER = SIZE / 2;
const RADIUS = 110;
const LEVELS = 4;

function polarToCartesian(
  angle: number,
  radius: number
): { x: number; y: number } {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

export default function RadarChart({ scores }: RadarChartProps) {
  const angleStep = 360 / AXES.length;

  // グリッド線
  const gridLines = Array.from({ length: LEVELS }, (_, i) => {
    const r = (RADIUS / LEVELS) * (i + 1);
    const points = AXES.map((_, j) => {
      const p = polarToCartesian(j * angleStep, r);
      return `${p.x},${p.y}`;
    }).join(" ");
    return points;
  });

  // データポイント
  const dataPoints = AXES.map((axis, i) => {
    const value = scores[axis.key];
    const normalized = value / axis.max;
    const r = RADIUS * normalized;
    return polarToCartesian(i * angleStep, r);
  });

  const dataPath = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[280px]">
        {/* グリッド */}
        {gridLines.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}

        {/* 軸線 */}
        {AXES.map((_, i) => {
          const p = polarToCartesian(i * angleStep, RADIUS);
          return (
            <line
              key={i}
              x1={CENTER}
              y1={CENTER}
              x2={p.x}
              y2={p.y}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          );
        })}

        {/* データエリア */}
        <polygon
          points={dataPath}
          fill="rgba(26, 54, 93, 0.15)"
          stroke="#c7924e"
          strokeWidth="2.5"
        />

        {/* データポイント */}
        {dataPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#c7924e"
            stroke="white"
            strokeWidth="2"
          />
        ))}

        {/* ラベル */}
        {AXES.map((axis, i) => {
          const p = polarToCartesian(i * angleStep, RADIUS + 28);
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[11px] font-bold fill-navy"
            >
              {axis.label}
            </text>
          );
        })}

        {/* スコア値 */}
        {AXES.map((axis, i) => {
          const p = polarToCartesian(i * angleStep, RADIUS + 42);
          return (
            <text
              key={`score-${i}`}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] fill-gold font-bold"
            >
              {scores[axis.key]}/{axis.max}
            </text>
          );
        })}
      </svg>

      {/* 総合スコア */}
      <div className="mt-4 text-center">
        <div className="text-4xl font-black text-navy">{scores.total}</div>
        <div className="text-sm text-text-light font-medium">/ 100 点</div>
      </div>
    </div>
  );
}
