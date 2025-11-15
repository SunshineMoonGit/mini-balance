import { KPI_CARDS } from "../../../shared/constants/dashboard";

export type KpiCard = {
  label: string;
  value: string;
  badge?: string;
  highlight?: boolean;
};

type Props = {
  cards?: KpiCard[];
};

const KpiGrid = ({ cards = KPI_CARDS }: Props) => (
  <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    {cards.map((card) => (
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
          {card.badge ?? "요약"}
        </span>
      </article>
    ))}
  </section>
);

export default KpiGrid;
