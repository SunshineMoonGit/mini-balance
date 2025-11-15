import { useNavigate } from "react-router-dom";
import KpiGrid from "./components/KpiGrid";
import LedgerChart from "./components/LedgerChart";
import ReportShortcuts from "./components/ReportShortcuts";
import TrialBalancePreview from "./components/TrialBalancePreview";

import { useDashboardData } from "../../features/dashboard";
import ActivityList from "./components/ActivityList";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { kpiCards, cashFlow, entries, trialBalance, loading } =
    useDashboardData();

  const reportShortcuts = [
    {
      id: "journal",
      title: "전표 관리",
      description: "최근 입력된 분개와 전표 목록을 조회합니다.",
      badge: "Journal",
      onClick: () => navigate("/journal"),
    },
    {
      id: "trial",
      title: "시산표",
      description: "차변·대변 균형 및 계정별 잔액을 검토합니다.",
      badge: "Trial Balance",
      onClick: () => navigate("/trial-balance"),
    },
    {
      id: "ledger",
      title: "총계정원장",
      description: "계정별 원장 내역을 빠르게 확인합니다.",
      badge: "Ledger",
      onClick: () => navigate("/general-ledger"),
    },
    {
      id: "accounts",
      title: "계정과목",
      description: "신규 계정 생성 및 계정 정보를 조회합니다.",
      badge: "Accounts",
      onClick: () => navigate("/accounts"),
    },
  ];

  return (
    <section className="space-y-6">
      <ReportShortcuts shortcuts={reportShortcuts} />
      <KpiGrid cards={kpiCards.length ? kpiCards : undefined} />

      <LedgerChart data={cashFlow} />
      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityList entries={entries} onManage={() => navigate("/journal")} />
        <TrialBalancePreview
          trialBalance={trialBalance}
          isLoading={loading}
          onNavigate={() => navigate("/trial-balance")}
        />
      </div>
    </section>
  );
};

export default DashboardPage;
