import type { JournalEntry } from "../../../features/journal/types/domain";
import EmptyState from "../../../shared/components/Feedback/EmptyState";

type Props = {
  entries: JournalEntry[];
  onManage?: () => void;
};

const ActivityList = ({ entries, onManage }: Props) => (
  <section className="rounded-2xl border border-slate-100 bg-white p-6">
    <header className="flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-400">최근 활동</p>
        <h2 className="text-xl font-semibold text-slate-900">전표 타임라인</h2>
      </div>
      <button
        type="button"
        className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600"
        onClick={onManage}
      >
        전표 관리
      </button>
    </header>

    {entries.length === 0 ? (
      <div className="mt-4">
        <EmptyState
          icon="📋"
          title="최근 활동이 없습니다"
          description="전표를 작성하면 여기에 표시됩니다"
          action="첫 전표 작성"
          onActionClick={onManage}
        />
      </div>
    ) : (
      <ul className="mt-4 space-y-3">
        {entries.slice(0, 3).map((entry) => {
          const total = entry.lines.reduce((sum, line) => sum + (line.debit || line.credit || 0), 0);
          return (
            <li
              key={entry.id}
              className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 text-sm text-slate-600"
            >
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">
                  {new Date(entry.postedAt).toLocaleDateString()}
                </p>
                <p className="text-base font-semibold text-slate-900">
                  {entry.description ?? "설명 없음"}
                </p>
                <p className="text-xs text-slate-400">{entry.lines.length}개 라인</p>
              </div>
              <p className="text-base font-semibold text-slate-900">
                ₩ {total.toLocaleString()}
              </p>
            </li>
          );
        })}
      </ul>
    )}
  </section>
);

export default ActivityList;
