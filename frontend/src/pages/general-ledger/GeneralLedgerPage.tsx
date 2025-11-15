import { useEffect, useRef, useState } from "react";

import { useAccounts } from "../../features/accounts/hooks/useAccounts";
import { useGeneralLedger } from "../../features/generalLedger/hooks/useGeneralLedger";
import DatePicker from "../../shared/components/DatePicker";
import { Card, SectionHeader } from "../../shared/components/ui";
import { formatCurrency } from "../../shared/utils";
import { getCurrentMonthPeriod } from "../../shared/utils/formatDate";
import type { GeneralLedgerEntry } from "../../types/api";

const GeneralLedgerPage = () => {
  const { data: accounts = [] } = useAccounts();
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null
  );
  const [period, setPeriod] = useState(getCurrentMonthPeriod());
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    accountId: 0,
    from: period.from,
    to: period.to,
    searchTerm: "",
  });
  const initialAppliedRef = useRef(false);

  useEffect(() => {
    if (!accounts.length) {
      setSelectedAccountId(null);
      return;
    }
    if (
      selectedAccountId === null ||
      !accounts.some((account) => account.id === selectedAccountId)
    ) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  useEffect(() => {
    if (
      !initialAppliedRef.current &&
      accounts.length > 0 &&
      selectedAccountId !== null
    ) {
      setAppliedFilters({
        accountId: selectedAccountId,
        from: period.from,
        to: period.to,
        searchTerm: searchTerm.trim(),
      });
      initialAppliedRef.current = true;
    }
  }, [
    accounts.length,
    selectedAccountId,
    period.from,
    period.to,
    searchTerm,
  ]);

  const { data, isLoading, error } = useGeneralLedger({
    account_id: appliedFilters.accountId,
    from: appliedFilters.from,
    to: appliedFilters.to,
    search: appliedFilters.searchTerm ? appliedFilters.searchTerm : undefined,
  });

  const entries = data?.entries ?? [];
  const openingBalance = data?.opening_balance ?? null;
  const closingBalance = data?.closing_balance ?? null;
  const selectedAccountLabel = data?.account_name ?? "-";

  const totalDebit = entries.reduce(
    (sum, entry) => sum + Number(entry.debit),
    0
  );
  const totalCredit = entries.reduce(
    (sum, entry) => sum + Number(entry.credit),
    0
  );
  const initialBalance = Number(openingBalance?.amount ?? 0);
  const entriesWithBalance = entries.reduce<
    (GeneralLedgerEntry & { runningBalance: number })[]
  >((acc, entry) => {
    const previousBalance =
      acc.length > 0 ? acc[acc.length - 1].runningBalance : initialBalance;
    const debitAmount = Number(entry.debit);
    const creditAmount = Number(entry.credit);
    const runningBalance = previousBalance + debitAmount - creditAmount;
    acc.push({ ...entry, runningBalance });
    return acc;
  }, []);
  const lastRunningBalance =
    entriesWithBalance.length > 0
      ? entriesWithBalance[entriesWithBalance.length - 1].runningBalance
      : initialBalance;

  const formatEntryDate = (value: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleDateString("ko-KR");
  };

  const formatShortDate = (value: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${date.getFullYear()}.${month}.${day}`;
  };

  const applyFilters = () => {
    setAppliedFilters({
      accountId: selectedAccountId ?? 0,
      from: period.from,
      to: period.to,
      searchTerm: searchTerm.trim(),
    });
  };

  const handleAccountChange = (value: string) => {
    const parsed = Number(value);
    setSelectedAccountId(Number.isNaN(parsed) ? null : parsed);
    setSearchTerm("");
  };

  const handleDateChange = (field: "from" | "to", value: string) => {
    setPeriod((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <section className="space-y-6">
      <Card className="p-6">
        <SectionHeader label="조건 설정" title="총계정원장 필터" />
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <label className="flex flex-col text-sm font-medium text-slate-600">
            계정 선택
            <select
              className="mt-2 h-12 rounded-xl border border-slate-200 px-3 text-sm"
              value={selectedAccountId ?? ""}
              onChange={(event) => handleAccountChange(event.target.value)}
            >
              <option value="">전체</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.code} · {account.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-sm font-medium text-slate-600">
            시작일
            <DatePicker
              value={period.from}
              onChange={(value) => handleDateChange("from", value)}
              className="h-12 mt-2"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-slate-600">
            종료일
            <DatePicker
              value={period.to}
              onChange={(value) => handleDateChange("to", value)}
              className="h-12 mt-2"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-slate-600">
            검색
            <input
              type="text"
              className="mt-2 h-12 rounded-xl border border-slate-200 px-3 text-sm"
              placeholder="전표 또는 적요 검색"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            onClick={applyFilters}
          >
            조회
          </button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">
                계정
              </p>
              <h2 className="text-xl font-semibold text-slate-900">
                {selectedAccountLabel}
              </h2>
            </div>
            {period.from && period.to && (
              <p className="text-sm text-slate-500">
                {`${formatShortDate(period.from)} ~ ${formatShortDate(
                  period.to
                )}`}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-600">
              기초 잔액:{" "}
              {openingBalance
                ? formatCurrency(Number(openingBalance.amount), "KRW", {
                    zeroDisplay: "-",
                  })
                : "-"}
            </div>

            <div className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-600">
              기말 잔액:{" "}
              {closingBalance
                ? formatCurrency(Number(closingBalance.amount), "KRW", {
                    zeroDisplay: "-",
                  })
                : "-"}
            </div>
          </div>
        </div>
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-4 py-3">거래일</th>
                <th className="px-4 py-3">전표 ID</th>
                <th className="px-4 py-3">적요</th>
                <th className="px-4 py-3">차변</th>
                <th className="px-4 py-3">대변</th>
                <th className="px-4 py-3">잔액</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm text-slate-500"
                  >
                    조회 중입니다...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm text-slate-500"
                  >
                    해당 계정에 일치하는 기록이 없습니다.
                  </td>
                </tr>
              ) : (
                entriesWithBalance.map((entry) => (
                  <tr
                    key={`${entry.entry_id}-${entry.date}`}
                    className="border-t border-slate-100"
                  >
                    <td className="px-4 py-3 text-slate-700">
                      {formatEntryDate(entry.date)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {entry.entry_id}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {entry.description}
                    </td>
                    <td className="px-4 py-3 text-emerald-600 font-semibold">
                      {formatCurrency(Number(entry.debit), "KRW", {
                        zeroDisplay: "-",
                      })}
                    </td>
                    <td className="px-4 py-3 text-rose-600 font-semibold">
                      {formatCurrency(Number(entry.credit), "KRW", {
                        zeroDisplay: "-",
                      })}
                    </td>
                    <td className="px-4 py-3 text-slate-900 font-semibold">
                      {formatCurrency(entry.runningBalance, "KRW", {
                        zeroDisplay: "-",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {entriesWithBalance.length > 0 && (
              <tfoot>
                <tr className="border-t border-slate-100 text-xs uppercase tracking-widest text-slate-400">
                  <td
                    colSpan={3}
                    className="px-4 py-3 text-slate-700 font-semibold"
                  >
                    합계
                  </td>
                  <td className="px-4 py-3 text-emerald-600 font-semibold">
                    {formatCurrency(totalDebit, "KRW", { zeroDisplay: "-" })}
                  </td>
                  <td className="px-4 py-3 text-rose-600 font-semibold">
                    {formatCurrency(totalCredit, "KRW", { zeroDisplay: "-" })}
                  </td>
                  <td className="px-4 py-3 text-slate-900 font-semibold">
                    {formatCurrency(lastRunningBalance, "KRW", {
                      zeroDisplay: "-",
                    })}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        {error && (
          <p className="mt-4 text-sm text-rose-600">
            원장 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
          </p>
        )}
      </Card>
    </section>
  );
};

export default GeneralLedgerPage;
