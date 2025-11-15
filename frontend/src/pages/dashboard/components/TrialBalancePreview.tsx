import type { ReactNode } from "react";
import type { TrialBalanceLine } from "../../../features/trialBalance/types/domain";
import { Card, SectionHeader } from "../../../shared/components/ui";
import { formatCurrency } from "../../../shared/utils";

type TrialBalanceData = {
  totals: { debit: number; credit: number; isBalanced: boolean };
  period: { from: string; to: string };
  lines: TrialBalanceLine[];
};

type TrialBalancePreviewProps = {
  trialBalance: TrialBalanceData | null;
  isLoading?: boolean;
  onNavigate?: () => void;
};

const formatKrw = (value: number) =>
  formatCurrency(value, "KRW", { zeroDisplay: "-" });

const TrialBalancePreview = ({
  trialBalance,
  isLoading = false,
  onNavigate,
}: TrialBalancePreviewProps) => {
  const diff = trialBalance
    ? trialBalance.totals.debit - trialBalance.totals.credit
    : 0;
  const diffLabel = formatKrw(Math.abs(diff));
  const topLines = trialBalance
    ? [...trialBalance.lines]
        .sort(
          (a, b) =>
            Math.abs(b.endingBalance.amount) - Math.abs(a.endingBalance.amount)
        )
        .slice(0, 3)
    : [];

  let body: ReactNode = null;

  if (isLoading && !trialBalance) {
    body = (
      <div className="mt-6 space-y-3">
        <div className="h-8 w-full animate-pulse rounded-xl bg-slate-100" />
        <div className="h-8 w-full animate-pulse rounded-xl bg-slate-100" />
        <div className="h-8 w-full animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  } else if (!trialBalance) {
    body = (
      <p className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-sm text-slate-500">
        최근 시산표 데이터를 불러올 수 없습니다. 전표를 입력한 뒤 다시
        확인해주세요.
      </p>
    );
  } else {
    body = (
      <>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Card className="p-4">
            <p className="text-xs uppercase tracking-widest text-slate-400">
              총 차변
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {formatKrw(trialBalance.totals.debit)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs uppercase tracking-widest text-slate-400">
              총 대변
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {formatKrw(trialBalance.totals.credit)}
            </p>
          </Card>
          <Card
            className="p-4"
            tone={trialBalance.totals.isBalanced ? "success" : "danger"}
            variant="soft"
          >
            <p className="text-xs uppercase tracking-widest">
              {trialBalance.totals.isBalanced ? "균형" : "불균형"}
            </p>
            <p className="mt-2 text-lg font-semibold">
              {trialBalance.totals.isBalanced ? "정상" : `차이 ${diffLabel}`}
            </p>
          </Card>
        </div>
        <Card className="mt-6 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.3em] text-slate-400">
              <tr>
                <th className="px-4 py-2">계정</th>
                <th className="px-4 py-2 text-right">기초 잔액</th>
                <th className="px-4 py-2 text-right">차변 합계</th>
                <th className="px-4 py-2 text-right">대변 합계</th>
                <th className="px-4 py-2 text-right">기말 잔액</th>
              </tr>
            </thead>
            <tbody>
              {topLines.map((line) => {
                const debitZero = line.totalDebit === 0;
                const creditZero = line.totalCredit === 0;
                const balanceZero = line.endingBalance.amount === 0;
                const openingZero = line.openingBalance.amount === 0;
                return (
                  <tr
                    key={line.accountId}
                    className="border-t border-slate-100"
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">
                        {line.accountName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {line.accountCode}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {openingZero ? (
                        <span className="text-slate-700">-</span>
                      ) : (
                        <>
                          {formatKrw(line.openingBalance.amount)} ·{" "}
                          {line.openingBalance.direction === "DEBIT" ? "차" : "대"}
                        </>
                      )}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-semibold ${
                        debitZero ? "text-slate-700" : "text-emerald-600"
                      }`}
                    >
                      {formatKrw(line.totalDebit)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-semibold ${
                        creditZero ? "text-slate-700" : "text-rose-600"
                      }`}
                    >
                      {formatKrw(line.totalCredit)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {balanceZero ? (
                        <span className="text-slate-700">-</span>
                      ) : (
                        <>
                          {formatKrw(line.endingBalance.amount)} ·{" "}
                          {line.endingBalance.direction === "DEBIT"
                            ? "차"
                            : "대"}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
              {topLines.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-sm text-slate-500"
                  >
                    표시할 계정이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </>
    );
  }

  return (
    <Card as="section" className="p-6">
      <SectionHeader
        label="시산표 요약"
        title={
          trialBalance?.totals.isBalanced === false
            ? "차대변 불일치"
            : "차대변 균형"
        }
        description={
          trialBalance
            ? `${trialBalance.period.from} ~ ${trialBalance.period.to}`
            : undefined
        }
        action={
          onNavigate && (
            <button
              type="button"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-blue-200 hover:text-blue-600"
              onClick={onNavigate}
            >
              시산표 이동
            </button>
          )
        }
      />
      {body}
    </Card>
  );
};

export default TrialBalancePreview;
