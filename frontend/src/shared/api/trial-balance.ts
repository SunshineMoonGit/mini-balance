/**
 * 시산표 API
 *
 * 시산표 조회를 위한 API 함수
 */

import { apiClient } from "./client";
import type { TrialBalanceResponse } from "../../types/api";

export interface GetTrialBalanceParams {
  from: string; // YYYY-MM-DD (필수)
  to: string; // YYYY-MM-DD (필수)
}

/**
 * 시산표 조회 (B 방식: 기초 + 기중 + 기말)
 *
 * @param params - 조회 기간
 * @returns 시산표 데이터
 */
export const getTrialBalance = async (params: GetTrialBalanceParams): Promise<TrialBalanceResponse> => {
  const searchParams = new URLSearchParams({
    from: params.from,
    to: params.to,
  });

  return apiClient.get<TrialBalanceResponse>(`/v1/trial-balance?${searchParams.toString()}`);
};
