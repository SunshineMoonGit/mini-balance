// 공통 타입 정의

export type PeriodFilters = {
  from: string;
  to: string;
};

export type SortDirection = "asc" | "desc";

export type LoadingState = {
  isLoading: boolean;
  error: Error | null;
};

export type PaginationParams = {
  page: number;
  pageSize: number;
  offset: number;
  limit: number;
};

export type ApiFilters = {
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
};
