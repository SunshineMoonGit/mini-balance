import { type PropsWithChildren } from "react";
import { Outlet } from "react-router-dom";

import AppHeader from "../../components/Header/AppHeader";
import Sidebar from "../../components/Sidebar/Sidebar";
import { ToastRoot } from "../toast/ToastStack";

const AppShell = ({ children }: PropsWithChildren) => {
  const content = children ?? <Outlet />;
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto px-8 py-6">{content}</main>
        <ToastRoot />
      </div>
    </div>
  );
};

export default AppShell;
