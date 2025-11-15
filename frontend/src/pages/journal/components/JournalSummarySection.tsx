import { memo, useMemo } from "react";
import { formatCurrency, formatNumber } from "../../../shared/utils";
import type { JournalEntry } from "../../../features/journal/types/domain";

type Props = {
  entries: JournalEntry[];
};

const JournalSummarySection = memo(({ entries }: Props) => {
  const summaryData = useMemo(() => {
    const totalLineCount = entries.reduce(
      (sum, entry) => sum + entry.lines.length,
      0
    );
    const averageLineCount =
      entries.length === 0 ? 0 : Math.round(totalLineCount / entries.length);
    const totalEntryAmount = entries
      .flatMap((entry) => entry.lines)
      .reduce((sum, line) => sum + (line.debit || line.credit || 0), 0);

    return {
      totalLineCount,
      averageLineCount,
      totalEntryAmount,
    };
  }, [entries]);

  const summaryCards = useMemo(() => [
    {
      label: "총 등록 전표",
      value: `${formatNumber(entries.length)}건`,
      hint: "전체 데이터 기준",
    },
    {
      label: "평균 분개 라인",
      value: `${formatNumber(summaryData.averageLineCount)}개`,
      hint: "1건당 평균",
    },
    {
      label: "총 분개금액",
      value: formatCurrency(summaryData.totalEntryAmount),
      hint: "차변+대변 합계",
    },
  ], [entries.length, summaryData.averageLineCount, summaryData.totalEntryAmount]);

  return (
    <div className="mt-4 grid gap-4 md:grid-cols-3">
      {summaryCards.map((card) => (
        <article
          key={card.label}
          className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600"
        >
          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
            {card.label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {card.value}
          </p>
          <p className="text-xs text-slate-500">{card.hint}</p>
        </article>
      ))}
    </div>
  );
});

JournalSummarySection.displayName = "JournalSummarySection";

export default JournalSummarySection;
