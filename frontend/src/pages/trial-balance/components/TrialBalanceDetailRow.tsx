import type { TrialBalanceLine } from "../../../features/trialBalance/types/domain";
import { formatCurrency } from "../../../shared/utils";

type Props = {
  line: TrialBalanceLine;
};

const directionLabel = (direction: TrialBalanceLine["endingBalance"]["direction"]) =>
  direction === "DEBIT" ? "차변" : "대변";

const TYPE_LABELS: Record<string, string> = {
  ASSET: "자산",
  LIABILITY: "부채",
  EQUITY: "자본",
  REVENUE: "수익",
  EXPENSE: "비용",
};

const NORMAL_DIRECTION: Record<string, "DEBIT" | "CREDIT"> = {
  ASSET: "DEBIT",
  EXPENSE: "DEBIT",
  LIABILITY: "CREDIT",
  EQUITY: "CREDIT",
  REVENUE: "CREDIT",
};

const TrialBalanceDetailRow = ({ line }: Props) => {
  const isImbalanced = line.totalDebit !== line.totalCredit;
  const normalDirection = NORMAL_DIRECTION[line.type];
  const isAbnormalBalance = normalDirection && line.endingBalance.direction !== normalDirection;

  return (
    <tr>
      <td colSpan={7} className="border-t border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100/50 px-6 py-6">
        <div className="space-y-4">
          {/* 헤더 */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-700">{line.accountCode}</span>
                  <span className="text-base font-semibold text-slate-900">{line.accountName}</span>
                </div>
                <span className="inline-block mt-1 rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {TYPE_LABELS[line.type] ?? line.type}
                </span>
              </div>
            </div>
            <div className="rounded-xl bg-white border border-slate-200 shadow-sm px-4 py-2">
              <p className="text-xs text-slate-500 font-medium">잔액</p>
              <p className="text-lg font-bold text-slate-900">
                {formatCurrency(line.endingBalance.amount, "KRW", { zeroDisplay: "-" })}
              </p>
              <p className="text-xs text-slate-500">{directionLabel(line.endingBalance.direction)}</p>
            </div>
          </div>

          {/* 경고 */}
          {(isImbalanced || isAbnormalBalance) && (
            <div className="flex flex-wrap gap-2">
              {isImbalanced && (
                <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  차변/대변 불일치
                </div>
              )}
              {isAbnormalBalance && (
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm font-medium text-amber-700">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  비정상 잔액 방향
                </div>
              )}
            </div>
          )}

          {/* 합계 정보 */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-white border border-emerald-200 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">차변 합계</p>
              <p className="text-2xl font-bold text-emerald-700">
                {formatCurrency(line.totalDebit, "KRW", { zeroDisplay: "-" })}
              </p>
            </div>
            <div className="rounded-xl bg-white border border-rose-200 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-600 mb-1">대변 합계</p>
              <p className="text-2xl font-bold text-rose-700">
                {formatCurrency(line.totalCredit, "KRW", { zeroDisplay: "-" })}
              </p>
            </div>
            <div className="rounded-xl bg-white border border-blue-200 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">거래 건수</p>
              <p className="text-2xl font-bold text-blue-700">
                {line.transactionCount}건
              </p>
            </div>
          </div>

          {/* 최근 거래 내역 */}
          {line.recentEntries.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3">최근 거래 내역</h4>
              <div className="space-y-2">
                {line.recentEntries.map((entry, index) => (
                  <div
                    key={index}
                    className="rounded-lg bg-white border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="text-xs font-medium text-slate-500">{entry.date}</span>
                      <span className="text-sm font-medium text-slate-900 flex-1 text-right">{entry.description}</span>
                    </div>
                    <div className="flex items-center justify-end gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-emerald-600 font-medium">차변</span>
                        <span className="font-semibold text-emerald-700">
                          {formatCurrency(entry.debit, "KRW", { zeroDisplay: "-" })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-rose-600 font-medium">대변</span>
                        <span className="font-semibold text-rose-700">
                          {formatCurrency(entry.credit, "KRW", { zeroDisplay: "-" })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default TrialBalanceDetailRow;
