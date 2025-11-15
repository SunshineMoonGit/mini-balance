export type Trend = "up" | "down" | "flat";

type CashSnapshotProps = {
  periodLabel: string;
  inflow: number;
  outflow: number;
  netChange: number;
  latestInflow: number;
  latestOutflow: number;
  trend: Trend;
};

const formatCurrency = (value: number) =>
  `₩ ${Math.round(value).toLocaleString()}`;

const trendCopy: Record<Trend, string> = {
  up: "현금이 순증가했습니다.",
  down: "현금이 순감소했습니다.",
  flat: "현금 변동이 크지 않습니다.",
};

const CashSnapshot = ({
  periodLabel,
  inflow,
  outflow,
  netChange,
  latestInflow,
  latestOutflow,
  trend,
}: CashSnapshotProps) => (
  <article className="rounded-2xl border border-slate-100 bg-white p-6">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          자금 스냅샷
        </p>
        <h2 className="text-xl font-semibold text-slate-900">{periodLabel}</h2>
      </div>
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          trend === "up"
            ? "bg-emerald-50 text-emerald-700"
            : trend === "down"
            ? "bg-rose-50 text-rose-700"
            : "bg-slate-100 text-slate-600"
        }`}
      >
        {trend === "up"
          ? "↗ 순증가"
          : trend === "down"
          ? "↘ 순감소"
          : "→ 보합"}
      </span>
    </header>
    <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
        <p className="text-xs uppercase tracking-widest text-slate-400">
          총 유입
        </p>
        <p className="mt-2 text-lg font-semibold text-slate-900">
          {formatCurrency(inflow)}
        </p>
      </div>
      <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
        <p className="text-xs uppercase tracking-widest text-slate-400">
          총 유출
        </p>
        <p className="mt-2 text-lg font-semibold text-slate-900">
          {formatCurrency(outflow)}
        </p>
      </div>
      <div className="rounded-xl border border-slate-100 bg-white p-4">
        <p className="text-xs uppercase tracking-widest text-slate-400">
          순변동
        </p>
        <p
          className={`mt-2 text-lg font-semibold ${
            netChange >= 0 ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {formatCurrency(netChange)}
        </p>
      </div>
      <div className="rounded-xl border border-slate-100 bg-white p-4">
        <p className="text-xs uppercase tracking-widest text-slate-400">
          오늘
        </p>
        <div className="mt-2 text-sm text-slate-600">
          <p>
            유입{" "}
            <span className="font-semibold text-slate-900">
              {formatCurrency(latestInflow)}
            </span>
          </p>
          <p className="mt-1">
            유출{" "}
            <span className="font-semibold text-slate-900">
              {formatCurrency(latestOutflow)}
            </span>
          </p>
        </div>
      </div>
    </div>
    <p className="mt-4 text-sm text-slate-600">{trendCopy[trend]}</p>
  </article>
);

export default CashSnapshot;
