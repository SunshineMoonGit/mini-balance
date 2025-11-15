/**
 * 계정과목 API
 *
 * 계정과목 CRUD 작업을 위한 API 함수들
 */

import { apiClient } from "./client";
import type { Account, AccountCreate, AccountUpdate, AccountDeactivateResponse } from "../../types/api";

/**
 * 계정과목 목록 조회
 *
 * @param includeInactive - 비활성 계정 포함 여부 (기본값: false)
 * @returns 계정 목록
 */
export const getAccounts = async (includeInactive = false): Promise<Account[]> => {
  const query = includeInactive ? "?include_inactive=true" : "";
  return apiClient.get<Account[]>(`/v1/accounts${query}`);
};

/**
 * 계정과목 단건 조회
 *
 * @param accountId - 계정 ID
 * @returns 계정 정보
 */
export const getAccount = async (accountId: number): Promise<Account> => {
  return apiClient.get<Account>(`/v1/accounts/${accountId}`);
};

/**
 * 계정과목 생성
 *
 * @param data - 생성할 계정 정보
 * @returns 생성된 계정
 */
export const createAccount = async (data: AccountCreate): Promise<Account> => {
  return apiClient.post<Account>("/v1/accounts", data);
};

/**
 * 계정과목 수정
 *
 * @param accountId - 계정 ID
 * @param data - 수정할 정보
 * @returns 수정된 계정
 */
export const updateAccount = async (accountId: number, data: AccountUpdate): Promise<Account> => {
  return apiClient.put<Account>(`/v1/accounts/${accountId}`, data);
};

/**
 * 계정과목 비활성화 (soft-delete)
 *
 * @param accountId - 계정 ID
 * @returns 비활성화 응답
 */
export const deactivateAccount = async (accountId: number): Promise<AccountDeactivateResponse> => {
  return apiClient.put<AccountDeactivateResponse>(`/v1/accounts/${accountId}/status`, { activate: false });
};

export const activateAccount = async (accountId: number): Promise<AccountDeactivateResponse> => {
  return apiClient.put<AccountDeactivateResponse>(`/v1/accounts/${accountId}/status`, { activate: true });
};
