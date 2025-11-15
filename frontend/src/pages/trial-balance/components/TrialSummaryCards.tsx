import { memo, useMemo } from "react";
import { formatCurrency } from "../../../shared/utils";

type SummaryProps = {
  totals: { debit: number; credit: number; isBalanced: boolean };
};

const TrialSummaryCards = memo(({ totals }: SummaryProps) => {
  const summaryCards = useMemo(() => [
    { label: "총 차변", value: formatCurrency(totals.debit, "KRW", { zeroDisplay: "-" }), badge: "균형 체크" },
    { label: "총 대변", value: formatCurrency(totals.credit, "KRW", { zeroDisplay: "-" }), badge: "균형 체크" },
    {
      label: "차이",
      value: formatCurrency(totals.debit - totals.credit, "KRW", { zeroDisplay: "-" }),
      badge: totals.isBalanced ? "정상" : "불일치",
      highlight: totals.isBalanced,
    },
  ], [totals]);

  return (
    <section className="grid gap-4 md:grid-cols-3">
    {summaryCards.map((card) => (
      <article
        key={card.label}
        className={`rounded-2xl border p-4 ${
          card.highlight ? "border-emerald-200 bg-emerald-50" : "border-slate-100 bg-white"
        }`}
      >
        <p className="text-xs uppercase tracking-widest text-slate-400">{card.label}</p>
        <p className="mt-3 text-2xl font-semibold text-slate-900">{card.value}</p>
        <span
          className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs ${
            card.highlight ? "bg-white text-emerald-600" : "bg-slate-100 text-slate-600"
          }`}
        >
          {card.badge}
        </span>
      </article>
    ))}
    </section>
  );
});

TrialSummaryCards.displayName = "TrialSummaryCards";

export default TrialSummaryCards;
