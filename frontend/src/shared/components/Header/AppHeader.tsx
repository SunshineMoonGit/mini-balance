import { useLocation } from "react-router-dom";

import { PAGE_META } from "../../constants/navigation";

const AppHeader = () => {
  const location = useLocation();
  const meta = PAGE_META[location.pathname] ?? {
    breadcrumbs: ["장부"],
    title: "미니 장부",
    subtitle: "워크플로우",
    primaryAction: "전표 관리",
    secondaryAction: "보고서",
  };

  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-8 py-6">
      <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-slate-500">
        {meta.breadcrumbs.map((crumb, index) => (
          <span key={crumb} className="flex items-center gap-2">
            {crumb}
            {index < meta.breadcrumbs.length - 1 && (
              <span className="text-slate-300">/</span>
            )}
          </span>
        ))}
      </nav>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">
            {meta.subtitle}
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            {meta.title}
          </h1>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
