import { useCallback, useEffect, useRef, useState } from "react";

import { useTrialBalance } from "../../features/trialBalance/hooks/useTrialBalance";
import Skeleton from "../../shared/components/Feedback/Skeleton";
import { toastService } from "../../shared/components/toast/toastService";
import { formatCurrency } from "../../shared/utils";
import { downloadTrialBalanceCsv } from "../../shared/utils/exporters";
import { loadHtml2Pdf } from "../../shared/utils/loadHtml2Pdf";
import TrialBalanceDetailRow from "./components/TrialBalanceDetailRow";
import TrialBalanceFilters from "./components/TrialBalanceFilters";
import TrialBalanceTable from "./components/TrialBalanceTable";
import TrialSummaryCards from "./components/TrialSummaryCards";
import { useTrialBalanceFilters } from "./hooks/useTrialBalanceFilters";

const TrialBalancePage = () => {
  const [selectedLineId, setSelectedLineId] = useState<number | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement | null>(null);

  const {
    formFilters,
    setFormFilters,
    filters,
    params,
    applyFilters,
    resetFilters,
    accountTypeFilter,
    directionFilter,
    onlyMovements,
    showZeroBalance,
    searchTerm,
    sortKey,
    activeFilters,
    filterLines,
    handleAccountTypeChange,
    handleDirectionChange,
    toggleZeroBalance,
    toggleOnlyMovements,
    handleSearchChange,
    handleSortChange,
  } = useTrialBalanceFilters({
    onSelectionReset: () => setSelectedLineId(null),
  });

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const {
    data: lines = [],
    totals,
    period,
    loading,
    error,
  } = useTrialBalance(params);
  const displayPeriod = period ?? filters;
  const filteredLines = filterLines(lines);

  const handleDownloadCsv = useCallback(() => {
    if (filteredLines.length === 0) {
      toastService.notify({
        message: "다운로드할 시산표 데이터가 없습니다.",
        variant: "error",
      });
      return;
    }
    downloadTrialBalanceCsv(filteredLines);
    toastService.notify({
      message: "시산표 데이터를 CSV로 저장했습니다.",
      variant: "success",
    });
  }, [filteredLines]);

  const handleDownloadPdf = useCallback(async () => {
    if (filteredLines.length === 0) {
      toastService.notify({
        message: "다운로드할 시산표 데이터가 없습니다.",
        variant: "error",
      });
      return;
    }
    if (!exportRef.current) {
      toastService.notify({
        message: "시산표 영역을 찾을 수 없습니다.",
        variant: "error",
      });
      return;
    }
    const html2pdf = await loadHtml2Pdf();
    if (!html2pdf) {
      toastService.notify({
        message: "PDF 도구를 불러오지 못했습니다.",
        variant: "error",
      });
      return;
    }
    const filename = `trial-balance-${Date.now()}.pdf`;
    await html2pdf()
      .set({
        margin: 10,
        filename,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(exportRef.current)
      .save();
    toastService.notify({
      message: "시산표를 PDF로 저장했습니다.",
      variant: "success",
    });
  }, [filteredLines]);

  return (
    <section className="space-y-6" ref={exportRef}>
      {/* 요약 박스 */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-widest text-slate-400">
            시산표 현황
          </p>
          <h2 className="text-xl font-semibold text-slate-900">요약</h2>
        </div>

        <TrialSummaryCards totals={totals} />
      </div>

      <TrialBalanceFilters
        formFilters={formFilters}
        onDateChange={(field, value) =>
          setFormFilters((prev) => ({ ...prev, [field]: value }))
        }
        activeFilters={activeFilters}
        accountTypeFilter={accountTypeFilter}
        directionFilter={directionFilter}
        onlyMovements={onlyMovements}
        showZeroBalance={showZeroBalance}
        searchTerm={searchTerm}
        sortKey={sortKey}
        onApplyFilters={applyFilters}
        onResetFilters={resetFilters}
        onAccountTypeChange={handleAccountTypeChange}
        onDirectionChange={handleDirectionChange}
        onToggleZeroBalance={toggleZeroBalance}
        onToggleOnlyMovements={toggleOnlyMovements}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
      />

      <div className="rounded-2xl border border-slate-100 bg-white p-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">
              시산표
            </p>
            <h2 className="text-xl font-semibold text-slate-900">
              {displayPeriod.from} ~ {displayPeriod.to}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-slate-200 px-6 py-3 text-sm text-slate-600">
              총 차변:{" "}
              {formatCurrency(totals.debit, "KRW", { zeroDisplay: "-" })} / 총
              대변: {formatCurrency(totals.credit, "KRW", { zeroDisplay: "-" })}
            </div>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                onClick={() => setShowMenu(!showMenu)}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
              {showMenu && (
                <div className="absolute right-0 top-12 z-10 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                  <button
                    type="button"
                    className="w-full border-b border-slate-100 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-white"
                    onClick={() => {
                      handleDownloadCsv();
                      setShowMenu(false);
                    }}
                    disabled={filteredLines.length === 0}
                  >
                    엑셀 다운로드
                  </button>
                  <button
                    type="button"
                    className="w-full px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-white"
                    onClick={() => {
                      handleDownloadPdf();
                      setShowMenu(false);
                    }}
                    disabled={filteredLines.length === 0}
                  >
                    PDF 다운로드
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-6">
          {loading ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-6">
              <Skeleton count={3} height={60} />
            </div>
          ) : (
            <TrialBalanceTable
              lines={filteredLines}
              selectedLineId={selectedLineId}
              onRowClick={(line) =>
                setSelectedLineId((prev) =>
                  prev === line.accountId ? null : line.accountId
                )
              }
              renderDetail={(line) => <TrialBalanceDetailRow line={line} />}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default TrialBalancePage;
