import { useQuery } from "@tanstack/react-query";
import {
  dashboardApi,
  type DashboardSnapshot,
} from "./dashboard/api/dashboardApi";

export const useDashboardData = () => {
  const query = useQuery<DashboardSnapshot>({
    queryKey: ["dashboard-data"],
    queryFn: () => dashboardApi.fetchDashboardData(),
  });

  const data = query.data;

  return {
    kpiCards: data?.kpiCards ?? [],
    alerts: data?.alerts ?? [],
    cashFlow: data?.cashFlow ?? [],
    entries: data?.entries ?? [],
    trialBalance: data?.trialBalance ?? null,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
  };
};
