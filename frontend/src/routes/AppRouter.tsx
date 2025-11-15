import { lazy, Suspense, memo } from "react";
import { Route, Routes } from "react-router-dom";

import AppShell from "../shared/components/Layout/AppShell";

// 페이지별 lazy loading 적용
const DashboardPage = lazy(() => import("../pages/dashboard/DashboardPage"));
const AccountsPage = lazy(() => import("../pages/accounts/AccountsPage"));
const JournalPage = lazy(() => import("../pages/journal/JournalPage"));
const GeneralLedgerPage = lazy(() => import("../pages/general-ledger/GeneralLedgerPage"));
const TrialBalancePage = lazy(() => import("../pages/trial-balance/TrialBalancePage"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const ApiTest = lazy(() => import("../features/api-test/ApiTest").then(module => ({ default: module.ApiTest })));

// 로딩 컴포넌트
const PageLoader = memo(() => (
  <div className="flex items-center justify-center min-h-screen" role="status" aria-live="polite">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" aria-label="페이지 로딩 중"></div>
    <span className="sr-only">페이지를 불러오는 중입니다...</span>
  </div>
));

PageLoader.displayName = "PageLoader";

const AppRouter = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/general-ledger" element={<GeneralLedgerPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/trial-balance" element={<TrialBalancePage />} />
        <Route path="/api-test" element={<ApiTest />} />
        <Route path="*" element={<DashboardPage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  </Suspense>
);

export default AppRouter;
