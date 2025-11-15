export type DashboardKpi = {
  label: string;
  value: string;
  badge?: string;
  highlight?: boolean;
};

export type DashboardAlert = {
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
};

export type DashboardCashFlow = {
  date: string;
  inflow: number;
  outflow: number;
};
