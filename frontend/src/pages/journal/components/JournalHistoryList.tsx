import type { JournalEntry } from "../../../features/journal/types/domain";
import { formatCurrency, formatDate } from "../../../shared/utils";

const formatLineAmount = (value: number) => {
  if (Number(value) === 0) {
    return "-";
  }
  return formatCurrency(value);
};

type Props = {
  entries: JournalEntry[];
  accountLookup: Record<number, string>;
  onEditEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (entry: JournalEntry) => void;
  isDeletingEntry: boolean;
  currentPage: number;
};

const JournalHistoryList = ({
  entries,
  accountLookup,
  onEditEntry,
  onDeleteEntry,
  isDeletingEntry,
}: Props) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-6">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-400">
          전표 목록
        </p>
        <h2 className="text-xl font-semibold text-slate-900">
          기간 내 전표 {entries.length}건
        </h2>
      </div>
    </div>

    <div className="mt-4 space-y-3">
      {entries.map((entry) => {
        const totalDebit = entry.lines.reduce(
          (sum, line) => sum + Number(line.debit ?? 0),
          0
        );
        const totalCredit = entry.lines.reduce(
          (sum, line) => sum + Number(line.credit ?? 0),
          0
        );
        return (
          <article
            key={entry.id}
            className="rounded-2xl border border-slate-100 p-4 transition hover:border-blue-200 hover:bg-blue-50/30"
          >
            <header className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
              <div className="flex flex-wrap gap-3">
                <span>{formatDate(entry.postedAt)}</span>
                <span>전표 #{entry.id}</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
                  onClick={() => onEditEntry(entry)}
                >
                  수정
                </button>
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-rose-300 hover:text-rose-600 disabled:border-slate-200 disabled:text-slate-300"
                  onClick={() => onDeleteEntry(entry)}
                  disabled={isDeletingEntry}
                >
                  {isDeletingEntry ? "삭제 중..." : "삭제"}
                </button>
              </div>
            </header>
            <h3 className="mt-2 text-base font-semibold text-slate-900">
              {entry.description ?? "설명 없음"}
            </h3>
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-100 text-sm">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[12%]" />
                  <col className="w-[38%]" />
                  <col className="w-[25%]" />
                  <col className="w-[25%]" />
                </colgroup>
                <thead className="bg-slate-50 text-left text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  <tr>
                    <th className="px-3 py-2">코드</th>
                    <th className="px-3 py-2">계정명</th>
                    <th className="px-3 py-2">차변</th>
                    <th className="px-3 py-2 text-right">대변</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.lines.map((line, idx) => {
                    const accountLabel =
                      accountLookup[line.accountId] ??
                      `계정 #${line.accountId}`;
                    const [code, ...nameParts] = accountLabel.split(" · ");
                    const name = nameParts.join(" · ") || code;
                    const debitValue = Number(line.debit);
                    const creditValue = Number(line.credit);
                    const debitClass =
                      debitValue === 0 ? "text-slate-500" : "text-emerald-600";
                    const creditClass =
                      creditValue === 0 ? "text-slate-500" : "text-rose-600";
                    return (
                      <tr key={idx} className="border-t border-slate-100">
                        <td className="px-3 py-2 text-xs text-slate-400">
                          {code}
                        </td>
                        <td className="px-3 py-2 text-slate-700">{name}</td>
                        <td className={`px-3 py-2 font-semibold ${debitClass}`}>
                          {formatLineAmount(debitValue)}
                        </td>
                        <td
                          className={`px-3 py-2 text-right font-semibold ${creditClass}`}
                        >
                          {formatLineAmount(creditValue)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50 text-xs font-semibold text-slate-600">
                  <tr>
                    <td className="px-3 py-2 text-right" colSpan={2}>
                      합계
                    </td>
                    <td className="px-3 py-2 text-emerald-600">
                      {formatLineAmount(totalDebit)}
                    </td>
                    <td className="px-3 py-2 text-right text-rose-600">
                      {formatLineAmount(totalCredit)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </article>
        );
      })}
      {entries.length === 0 && (
        <p className="text-center text-sm text-slate-500">
          등록된 전표가 없습니다.
        </p>
      )}
    </div>
  </div>
);

export default JournalHistoryList;
