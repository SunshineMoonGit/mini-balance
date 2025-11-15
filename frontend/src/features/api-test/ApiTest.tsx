/**
 * API 연결 테스트 컴포넌트
 *
 * 백엔드 API와의 연결을 테스트합니다.
 */

import { useState, useEffect } from "react";
import { getAccounts, getJournalEntries, getTrialBalance } from "../../shared/api";
import type { Account, JournalEntry, TrialBalanceResponse } from "../../types";

export function ApiTest() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [trialBalance, setTrialBalance] = useState<TrialBalanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 계정과목 조회
        const accountsData = await getAccounts();
        setAccounts(accountsData);

        // 분개 목록 조회
        const journalsData = await getJournalEntries({ limit: 10 });
        setJournals(journalsData);

        // 시산표 조회 (2025-01-01 ~ 2025-01-31)
        const trialBalanceData = await getTrialBalance({
          from: "2025-01-01",
          to: "2025-01-31",
        });
        setTrialBalance(trialBalanceData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "API 연결 실패");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">API 데이터 로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">에러: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">API 연결 테스트 ✅</h1>

      {/* 계정과목 */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">계정과목 ({accounts.length}개)</h2>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">코드</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">계정명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">타입</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accounts.slice(0, 5).map((account) => (
                <tr key={account.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{account.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{account.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{account.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      account.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {account.is_active ? "활성" : "비활성"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 분개 */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">분개 내역 ({journals.length}개)</h2>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">일자</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">적요</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">라인 수</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {journals.slice(0, 5).map((journal) => (
                <tr key={journal.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{journal.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{journal.date}</td>
                  <td className="px-6 py-4 text-sm">{journal.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{journal.lines.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 시산표 */}
      {trialBalance && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            시산표 ({trialBalance.period.from} ~ {trialBalance.period.to})
          </h2>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                총 차변: <span className="font-semibold">{Number(trialBalance.total.debit).toLocaleString()}원</span>
                {" | "}
                총 대변: <span className="font-semibold">{Number(trialBalance.total.credit).toLocaleString()}원</span>
                {" | "}
                균형: <span className={`font-semibold ${trialBalance.total.is_balanced ? "text-green-600" : "text-red-600"}`}>
                  {trialBalance.total.is_balanced ? "✓ 일치" : "✗ 불일치"}
                </span>
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">계정</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">계정 코드</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">차변 합계</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">대변 합계</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">잔액</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trialBalance.rows.slice(0, 10).map((row) => (
                    <tr key={row.account_id}>
                      <td className="px-4 py-2 whitespace-nowrap font-medium">{row.account_name}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-right">{row.account_code}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-right">
                        {Number(row.total_debit).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-right">
                        {Number(row.total_credit).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-right">
                        {Number(row.ending_balance.amount).toLocaleString()} ({row.ending_balance.direction === "DEBIT" ? "차" : "대"})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
