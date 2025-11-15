import { Card } from "../../../shared/components/ui";

type SummaryCard = {
  label: string;
  value: string;
};

type Props = {
  cards: SummaryCard[];
};

const AccountsSummary = ({ cards }: Props) => (
  <Card as="section" className="p-6">
    <div className="mb-2">
      <p className="text-xs uppercase tracking-widest text-slate-400">계정 현황</p>
      <h2 className="text-xl font-semibold text-slate-900">계정과목 요약</h2>
    </div>
    <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="p-4">
          <p className="text-xs uppercase tracking-widest text-slate-400">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
        </Card>
      ))}
    </div>
  </Card>
);

export default AccountsSummary;
