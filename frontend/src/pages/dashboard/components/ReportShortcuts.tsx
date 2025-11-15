type ReportShortcut = {
  id: string;
  title: string;
  description: string;
  badge?: string;
  onClick: () => void;
};

type ReportShortcutsProps = {
  shortcuts: ReportShortcut[];
};

const ReportShortcuts = ({ shortcuts }: ReportShortcutsProps) => (
  <article className="rounded-2xl border border-slate-100 bg-white p-6">
    <header className="mb-4">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
        주요 보고서
      </p>
      <h2 className="text-xl font-semibold text-slate-900">빠른 이동</h2>
    </header>
    <div className="grid gap-3 md:grid-cols-4">
      {shortcuts.map((shortcut) => (
        <button
          key={shortcut.id}
          type="button"
          className="rounded-2xl border border-slate-200 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/50"
          onClick={shortcut.onClick}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            {shortcut.badge ?? "보고서"}
          </p>
          <p className="mt-2 text-base font-semibold text-slate-900">
            {shortcut.title}
          </p>
          <p className="mt-1 text-sm text-slate-600">{shortcut.description}</p>
        </button>
      ))}
    </div>
  </article>
);

export default ReportShortcuts;
