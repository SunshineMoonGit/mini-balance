/**
 * 분개 API
 *
 * 분개 CRUD 작업을 위한 API 함수들
 */

import { apiClient } from "./client";
import type { JournalEntry, JournalEntryCreate, JournalEntryUpdate, JournalEntryDeleteResponse } from "../../types/api";

export interface ListJournalEntriesParams {
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  limit?: number;
  offset?: number;
}

/**
 * 분개 목록 조회
 *
 * @param params - 조회 파라미터 (날짜 범위, 제한)
 * @returns 분개 목록
 */
export const getJournalEntries = async (params?: ListJournalEntriesParams): Promise<JournalEntry[]> => {
  const searchParams = new URLSearchParams();
  if (params?.from) searchParams.append("from", params.from);
  if (params?.to) searchParams.append("to", params.to);
  if (params?.limit !== undefined && params.limit !== null) {
    searchParams.append("limit", params.limit.toString());
  }
  if (params?.offset !== undefined && params.offset !== null) {
    searchParams.append("offset", params.offset.toString());
  }

  const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return apiClient.get<JournalEntry[]>(`/v1/journal-entries${query}`);
};

/**
 * 분개 단건 조회
 *
 * @param entryId - 분개 ID
 * @returns 분개 정보
 */
export const getJournalEntry = async (entryId: number): Promise<JournalEntry> => {
  return apiClient.get<JournalEntry>(`/v1/journal-entries/${entryId}`);
};

/**
 * 분개 생성
 *
 * @param data - 생성할 분개 정보
 * @returns 생성된 분개
 */
export const createJournalEntry = async (data: JournalEntryCreate): Promise<JournalEntry> => {
  return apiClient.post<JournalEntry>("/v1/journal-entries", data);
};

/**
 * 분개 수정
 *
 * @param entryId - 분개 ID
 * @param data - 수정할 정보
 * @returns 수정된 분개
 */
export const updateJournalEntry = async (entryId: number, data: JournalEntryUpdate): Promise<JournalEntry> => {
  return apiClient.put<JournalEntry>(`/v1/journal-entries/${entryId}`, data);
};

/**
 * 분개 삭제 (soft-delete)
 *
 * @param entryId - 분개 ID
 * @returns 삭제 응답
 */
export const deleteJournalEntry = async (entryId: number): Promise<JournalEntryDeleteResponse> => {
  return apiClient.delete<JournalEntryDeleteResponse>(`/v1/journal-entries/${entryId}`);
};
