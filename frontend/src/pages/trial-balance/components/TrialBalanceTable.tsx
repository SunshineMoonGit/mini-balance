import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import type { TrialBalanceLine } from "../../../features/trialBalance/types/domain";
import EmptyState from "../../../shared/components/Feedback/EmptyState";
import { formatCurrency } from "../../../shared/utils";

const TYPE_LABELS: Record<string, string> = {
  ASSET: "자산",
  LIABILITY: "부채",
  EQUITY: "자본",
  REVENUE: "수익",
  EXPENSE: "비용",
};

type Props = {
  lines: TrialBalanceLine[];
  selectedLineId?: number | null;
  onRowClick?: (line: TrialBalanceLine) => void;
  renderDetail?: (line: TrialBalanceLine) => React.ReactNode;
};

const directionLabel = (direction: TrialBalanceLine["endingBalance"]["direction"]) =>
  direction === "DEBIT" ? "차변" : "대변";

const formatAmount = (value: number) => formatCurrency(value, "KRW", { zeroDisplay: "-" });

const TrialBalanceTable = ({ lines, selectedLineId, onRowClick, renderDetail }: Props) => {
  const navigate = useNavigate();

  if (lines.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-6 text-sm">
        <EmptyState
          icon="📊"
          title="시산표 데이터가 없습니다"
          description="먼저 전표를 입력하거나 기간을 조정해보세요"
          action="전표 입력하러 가기"
          onActionClick={() => navigate("/journal")}
          className="border-transparent bg-slate-50/90 shadow-none"
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-widest text-slate-400">
        <tr>
          <th className="px-4 py-3">코드</th>
          <th className="px-4 py-3">계정</th>
          <th className="px-4 py-3">분류</th>
          <th className="px-4 py-3">기초 잔액</th>
          <th className="px-4 py-3">차변 합계</th>
          <th className="px-4 py-3">대변 합계</th>
          <th className="px-4 py-3">기말 잔액</th>
        </tr>
        </thead>
        <tbody>
          {lines.map((line) => {
            const isSelected = line.accountId === selectedLineId;
            const debitIsZero = line.totalDebit === 0;
            const creditIsZero = line.totalCredit === 0;
            const endingIsZero = line.endingBalance.amount === 0;
            const openingIsZero = line.openingBalance.amount === 0;
            return (
              <Fragment key={line.accountId}>
                <tr
                  className={`border-t transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-blue-50 border-l-4 border-l-blue-500 border-t-blue-100 shadow-sm"
                      : "border-slate-100 border-l-4 border-l-transparent hover:bg-slate-50/50 hover:border-l-slate-200"
                        } ${
                          line.endingBalance.amount === 0 ? "opacity-60" : ""
                  }`}
                  onClick={() => onRowClick?.(line)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <svg
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isSelected ? "rotate-90 text-blue-600" : "text-slate-400"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <p className={`text-xs font-medium ${isSelected ? "text-blue-600" : "text-slate-400"}`}>
                        {line.accountCode}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className={`font-semibold ${isSelected ? "text-blue-900" : "text-slate-900"}`}>
                      {line.accountName}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{TYPE_LABELS[line.type] ?? line.type}</td>
                  <td className="px-4 py-3">
                    <p
                      className={`font-semibold ${
                        openingIsZero ? "text-slate-700" : "text-slate-900"
                      }`}
                    >
                      {formatAmount(line.openingBalance.amount)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {directionLabel(line.openingBalance.direction)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p
                      className={`font-semibold ${
                        debitIsZero ? "text-slate-700" : "text-emerald-700"
                      }`}
                    >
                      {formatAmount(line.totalDebit)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p
                      className={`font-semibold ${creditIsZero ? "text-slate-700" : "text-rose-700"}`}
                    >
                      {formatAmount(line.totalCredit)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p
                      className={`font-semibold ${endingIsZero ? "text-slate-700" : "text-slate-900"}`}
                    >
                      {formatAmount(line.endingBalance.amount)}
                    </p>
                    <p className="text-xs text-slate-400">{directionLabel(line.endingBalance.direction)}</p>
                  </td>
                </tr>
                {isSelected && renderDetail?.(line)}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TrialBalanceTable;
