import { useMemo, useRef, useState } from "react";
import { Card, SectionHeader } from "../../../shared/components/ui";

type DataPoint = {
  date: string;
  inflow: number;
  outflow: number;
};

const RANGE_OPTIONS = [
  { label: "1W", days: 7, label_kr: "일주일" },
  { label: "1M", days: 30, label_kr: "한 달" },
  { label: "3M", days: 90, label_kr: "90 일" },
];

type Props = {
  data?: DataPoint[];
};

const CHART_WIDTH = 360;
const CHART_HEIGHT = 180;
const BASELINE_Y = 160;

const buildSmoothPath = (points: { x: number; y: number }[]) => {
  if (points.length === 0) {
    return { path: "", firstX: 0, lastX: 0 };
  }
  if (points.length === 1) {
    const { x, y } = points[0];
    return { path: `M${x},${y}`, firstX: x, lastX: x };
  }
  const commands: string[] = [`M${points[0].x},${points[0].y}`];
  for (let i = 0; i < points.length - 1; i += 1) {
    const current = points[i];
    const next = points[i + 1];
    const cx = (current.x + next.x) / 2;
    const cy = (current.y + next.y) / 2;
    commands.push(`Q${current.x},${current.y} ${cx},${cy}`);
  }
  const last = points[points.length - 1];
  commands.push(`T${last.x},${last.y}`);
  return { path: commands.join(" "), firstX: points[0].x, lastX: last.x };
};

const formatCurrency = (value: number) =>
  `₩ ${Math.round(value).toLocaleString()}`;

const LedgerChart = ({ data = [] }: Props) => {
  const [range, setRange] = useState(RANGE_OPTIONS[1]);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const sliced = useMemo(() => data.slice(-range.days), [data, range]);
  const totalInflow = sliced.reduce((sum, point) => sum + point.inflow, 0);
  const totalOutflow = sliced.reduce((sum, point) => sum + point.outflow, 0);

  const inflowShape = useMemo(() => {
    const maxValue = Math.max(...sliced.map((point) => point.inflow), 1);
    const points = sliced.map((point, idx) => {
      const ratio = idx / (sliced.length - 1 || 1);
      const x = ratio * CHART_WIDTH;
      const y =
        BASELINE_Y -
        (point.inflow / maxValue) * 120 -
        10; /* padding top/bottom */
      return { x, y };
    });
    return buildSmoothPath(points);
  }, [sliced]);

  const outflowShape = useMemo(() => {
    const maxValue = Math.max(...sliced.map((point) => point.outflow), 1);
    const points = sliced.map((point, idx) => {
      const ratio = idx / (sliced.length - 1 || 1);
      const x = ratio * CHART_WIDTH;
      const y = BASELINE_Y - (point.outflow / maxValue) * 120 - 10;
      return { x, y };
    });
    return buildSmoothPath(points);
  }, [sliced]);

  const handleChartMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!chartRef.current || sliced.length === 0) {
      return;
    }
    const rect = chartRef.current.getBoundingClientRect();
    const ratio =
      rect.width === 0 ? 0 : (event.clientX - rect.left) / rect.width;
    const clamped = Math.min(Math.max(ratio, 0), 1);
    const index = Math.round(clamped * (sliced.length - 1));
    setHoverIndex(index);
  };

  const handleChartMouseLeave = () => setHoverIndex(null);

  const hoverRatio =
    hoverIndex !== null && sliced.length > 1
      ? hoverIndex / (sliced.length - 1)
      : 0;

  return (
    <Card as="section" className="p-6">
      <SectionHeader
        label="현금 흐름"
        title={`최근 ${range.label_kr}`}
        action={
          <div className="flex gap-2 text-xs">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.label}
                className={`rounded-full border px-3 py-1 transition ${
                  option.label === range.label
                    ? "border-blue-300 bg-blue-50 text-blue-600"
                    : "border-slate-200 text-slate-500"
                }`}
                onClick={() => setRange(option)}
              >
                {option.label}
              </button>
            ))}
          </div>
        }
      />
      <div className="mt-6 min-h-40 rounded-2xl bg-gradient-to-br from-blue-50 via-white to-rose-50 p-4">
        {sliced.length === 0 ? (
          <div className="h-full w-full rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500">
            최근 데이터가 없습니다.
          </div>
        ) : (
          <div
            className="relative h-44 w-full cursor-crosshair"
            ref={chartRef}
            onMouseMove={handleChartMouseMove}
            onMouseLeave={handleChartMouseLeave}
          >
            <svg
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              preserveAspectRatio="none"
              className="h-full w-full"
            >
              <defs>
                <linearGradient
                  id="cash-flow-gradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient
                  id="cash-flow-gradient-outflow"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#fb7185" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <g className="pointer-events-none">
                {[20, 40, 60, 80, 100].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={BASELINE_Y - y * 1.4}
                    x2={CHART_WIDTH}
                    y2={BASELINE_Y - y * 1.4}
                    stroke="#e2e8f0"
                    strokeWidth={0.5}
                    strokeDasharray="4 4"
                  />
                ))}
              </g>
              {inflowShape.path && (
                <>
                  <path
                    d={`${inflowShape.path} L${inflowShape.lastX},${BASELINE_Y} L${inflowShape.firstX},${BASELINE_Y} Z`}
                    fill="url(#cash-flow-gradient)"
                    opacity={0.35}
                  />
                  <path
                    d={inflowShape.path}
                    fill="none"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </>
              )}
              {outflowShape.path && (
                <>
                  <path
                    d={`${outflowShape.path} L${outflowShape.lastX},${BASELINE_Y} L${outflowShape.firstX},${BASELINE_Y} Z`}
                    fill="url(#cash-flow-gradient-outflow)"
                    opacity={0.4}
                  />
                  <path
                    d={outflowShape.path}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </>
              )}
            </svg>
            {hoverIndex !== null && sliced[hoverIndex] && (
              <>
                <div
                  className="pointer-events-none absolute inset-y-0"
                  style={{
                    left: `${hoverRatio * 100}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <div className="absolute inset-y-4 w-px bg-slate-300" />
                </div>
                <div
                  className="pointer-events-none absolute top-2 flex justify-center"
                  style={{
                    left: `${hoverRatio * 100}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-xs text-slate-800 shadow-xl">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                      {new Date(sliced[hoverIndex].date).toLocaleDateString()}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-emerald-600">
                      유입 {formatCurrency(sliced[hoverIndex].inflow)}
                    </p>
                    <p className="text-sm font-semibold text-rose-600">
                      유출 {formatCurrency(sliced[hoverIndex].outflow)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      순변동{" "}
                      <span
                        className={`font-semibold ${
                          sliced[hoverIndex].inflow -
                            sliced[hoverIndex].outflow >=
                          0
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {formatCurrency(
                          sliced[hoverIndex].inflow - sliced[hoverIndex].outflow
                        )}
                      </span>
                    </p>
                  </div>
                </div>
              </>
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between px-1 text-[10px] uppercase tracking-[0.3em] text-slate-400">
              {[0, Math.floor(sliced.length / 2), sliced.length - 1]
                .filter(
                  (idx, pos, arr) => arr.indexOf(idx) === pos && sliced[idx]
                )
                .map((idx) => (
                  <span key={`${sliced[idx]?.date}-${idx}`}>
                    {new Date(sliced[idx]!.date).toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>
      <dl className="mt-6 grid gap-4 md:grid-cols-3 text-sm text-slate-600">
        {[
          { label: "유입", value: totalInflow },
          { label: "유출", value: totalOutflow },
          { label: "순현금", value: totalInflow - totalOutflow },
        ].map((item) => (
          <div key={item.label}>
            <dt className="text-xs uppercase tracking-widest text-slate-400">
              {item.label}
            </dt>
            <dd className="text-lg font-semibold text-slate-900">
              {formatCurrency(item.value)}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
};

export default LedgerChart;
