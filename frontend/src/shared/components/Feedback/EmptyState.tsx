type Props = {
  icon?: string;
  title: string;
  description: string;
  action?: string;
  onActionClick?: () => void;
  className?: string;
};

const EmptyState = ({ icon = "ℹ️", title, description, action, onActionClick, className = "" }: Props) => (
  <div
    className={`flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white/90 p-6 text-center text-sm text-slate-600 shadow-sm ${className}`}
  >
    <span className="text-3xl">{icon}</span>
    <p className="text-base font-semibold text-slate-900">{title}</p>
    <p className="text-xs text-slate-500">{description}</p>
    {action && onActionClick && (
      <button
        type="button"
        className="mt-2 rounded-full border border-slate-200 px-4 py-1 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
        onClick={onActionClick}
      >
        {action}
      </button>
    )}
  </div>
);

export default EmptyState;
