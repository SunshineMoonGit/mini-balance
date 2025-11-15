import type { JournalEntry } from "../../../features/journal/types/domain";

type Props = {
  entries: JournalEntry[];
};

const PendingJournalList = ({ entries }: Props) => (
  <section className="rounded-2xl border border-slate-100 bg-white p-6">
    <header className="flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-400">승인 대기</p>
        <h2 className="text-xl font-semibold text-slate-900">미결 전표</h2>
      </div>
      <button className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600">전표 승인</button>
    </header>
    <ul className="mt-4 space-y-3">
      {entries.length === 0 && (
        <li className="rounded-2xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500">
          승인을 기다리는 전표가 없습니다.
        </li>
      )}
      {entries.slice(0, 3).map((entry) => (
        <li key={entry.id} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
          <div>
            <p className="text-base font-semibold text-slate-900">{entry.description ?? "설명 없음"}</p>
            <p className="text-sm text-slate-500">ID #{entry.id}</p>
            <p className="text-xs text-slate-400">{new Date(entry.postedAt).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">
              ₩{" "}
              {entry.lines
                .reduce((sum, line) => sum + (line.debit || line.credit || 0), 0)
                .toLocaleString()}
            </p>
            <span className="text-xs text-amber-600">승인 대기</span>
          </div>
        </li>
      ))}
    </ul>
  </section>
);

export default PendingJournalList;
