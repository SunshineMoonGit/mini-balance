import { NavLink } from "react-router-dom";

import { MAIN_MENU } from "../../constants/navigation";

const Sidebar = () => (
  <aside className="sticky top-0 flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
    <NavLink to="/">
      <div className="flex items-center gap-2 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
          M
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">
            작아도 꽉 찬 장부
          </p>
          <p className="text-sm font-semibold text-slate-900">미니 밸런스</p>
        </div>
      </div>
    </NavLink>

    <div className="flex-1 overflow-y-auto px-2 pb-4">
      <nav className="space-y-1">
        {MAIN_MENU.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex w-full items-center gap-3 rounded-md px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`
            }
          >
            <span className="text-lg">▸</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  </aside>
);

export default Sidebar;
