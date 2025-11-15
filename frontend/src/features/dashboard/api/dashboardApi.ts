import { accountsApi } from "../../accounts/api/accountsApi";
import { journalApi } from "../../journal/api/journalApi";
import {
  trialBalanceApi,
  type TrialBalanceParams,
} from "../../trialBalance/api/trialBalanceApi";
import type { JournalEntry } from "../../journal/types/domain";
import type {
  DashboardAlert,
  DashboardCashFlow,
  DashboardKpi,
} from "../types";

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDefaultPeriod = (): TrialBalanceParams => {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return { from: formatDate(start), to: formatDate(end) };
};

const buildDateSeries = (length: number) => {
  const series: string[] = [];
  const today = new Date();
  for (let i = length - 1; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    series.push(formatDate(date));
  }
  return series;
};

const buildCashFlowSeries = (entries: JournalEntry[]) => {
  const allDates = buildDateSeries(90);
  const cashFlowMap: Record<string, { inflow: number; outflow: number }> = {};
  entries.forEach((entry) => {
    const date = entry.postedAt?.split("T")[0];
    if (!date) {
      return;
    }
    if (!cashFlowMap[date]) {
      cashFlowMap[date] = { inflow: 0, outflow: 0 };
    }
    entry.lines.forEach((line) => {
      cashFlowMap[date].inflow += line.credit || 0;
      cashFlowMap[date].outflow += line.debit || 0;
    });
  });
  return allDates.map((date) => ({
    date,
    inflow: cashFlowMap[date]?.inflow ?? 0,
    outflow: cashFlowMap[date]?.outflow ?? 0,
  }));
};

export type DashboardSnapshot = {
  kpiCards: DashboardKpi[];
  alerts: DashboardAlert[];
  cashFlow: DashboardCashFlow[];
  entries: JournalEntry[];
  trialBalance: {
    lines: Awaited<ReturnType<typeof trialBalanceApi.fetch>>["lines"];
    totals: Awaited<ReturnType<typeof trialBalanceApi.fetch>>["totals"];
    period: Awaited<ReturnType<typeof trialBalanceApi.fetch>>["period"];
  };
};

export const dashboardApi = {
  async fetchDashboardData(): Promise<DashboardSnapshot> {
    const [accounts, trialBalance, entries] = await Promise.all([
      accountsApi.listAccounts(),
      trialBalanceApi.fetch(getDefaultPeriod()),
      journalApi.listEntries({ limit: 5 }),
    ]);

    const totalAccounts = accounts.length;
    const typeCounts = accounts.reduce<Record<string, number>>(
      (acc, account) => {
        acc[account.type] = (acc[account.type] ?? 0) + 1;
        return acc;
      },
      {}
    );

    const summaries = trialBalance.totals;
    const diff = summaries.debit - summaries.credit;
    const isBalanced = summaries.isBalanced;
    const latestEntry = entries[0];

    const kpiCards: DashboardKpi[] = [
      {
        label: "총 계정 수",
        value: `${totalAccounts}개`,
        badge: `자산 ${typeCounts.asset ?? 0}개`,
      },
      {
        label: "최근 전표",
        value: `${entries.length}건`,
        badge: latestEntry
          ? `최근 ${new Date(latestEntry.postedAt).toLocaleDateString()}`
          : "전표 없음",
      },
      {
        label: "총 차변",
        value: `₩ ${summaries.debit.toLocaleString()}`,
        badge: "당월",
      },
      {
        label: "차이",
        value: `₩ ${Math.abs(diff).toLocaleString()}`,
        badge: isBalanced ? "균형" : "불균형",
        highlight: !isBalanced,
      },
    ];

    const alerts: DashboardAlert[] = [];
    if (!isBalanced) {
      alerts.push({
        title: "차변/대변 불균형",
        description: "이번 기간의 시산표가 균형을 이루지 못했습니다.",
        severity: "critical",
      });
    }
    if (entries.some((entry) => entry.description?.includes("임시"))) {
      alerts.push({
        title: "임시 저장 전표",
        description: "임시 저장된 전표가 감지되었습니다.",
        severity: "warning",
      });
    }
    if ((typeCounts.asset ?? 0) > 100) {
      alerts.push({
        title: "계정 수 급증",
        description: "자산 계정이 100개를 넘어섰습니다.",
        severity: "info",
      });
    }

    const cashFlow = buildCashFlowSeries(entries);

    return {
      kpiCards,
      alerts,
      cashFlow,
      entries,
      trialBalance,
    };
  },
};
