import { useEffect, useRef, useState, useCallback, memo, type ChangeEvent } from "react";

import type { JournalEntry } from "../../../features/journal/types/domain";
import EmptyState from "../../../shared/components/Feedback/EmptyState";
import Skeleton from "../../../shared/components/Feedback/Skeleton";
import JournalFiltersBar from "./JournalFiltersBar";
import JournalHistoryList from "./JournalHistoryList";
import JournalPagination from "./JournalPagination";

type PeriodFilters = { from: string; to: string };

type Props = {
  entries: JournalEntry[];
  filteredEntries: JournalEntry[];
  entriesLoading: boolean;
  entriesError: Error | null;
  accountLookup: Record<number, string>;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  pageSizeOptions: readonly number[];
  onPrevPage: () => void;
  onNextPage: () => void;
  onPageSizeChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onEditEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (entry: JournalEntry) => void;
  isDeletingEntry: boolean;
  periodFilters: PeriodFilters;
  searchTerm: string;
  onPeriodChange: (field: "from" | "to", value: string) => void;
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onResetPage: () => void;
  activeFilters: string[];
  onCreateEntry: () => void;
  onDownloadCsv: () => void;
  onDownloadPdf: () => void;
};

const JournalEntriesSection = memo(({
  entries,
  filteredEntries,
  entriesLoading,
  entriesError,
  accountLookup,
  page,
  pageSize,
  hasNextPage,
  pageSizeOptions,
  onPrevPage,
  onNextPage,
  onPageSizeChange,
  onEditEntry,
  onDeleteEntry,
  isDeletingEntry,
  periodFilters,
  searchTerm,
  onPeriodChange,
  onSearchChange,
  onResetPage,
  activeFilters,
  onCreateEntry,
  onDownloadCsv,
  onDownloadPdf,
}: Props) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const toggleMenu = useCallback(() => {
    setShowMenu((prev) => !prev);
  }, []);

  const handleCsvDownload = useCallback(() => {
    onDownloadCsv();
    setShowMenu(false);
  }, [onDownloadCsv]);

  const handlePdfDownload = useCallback(() => {
    onDownloadPdf();
    setShowMenu(false);
  }, [onDownloadPdf]);

  useEffect(() => {
    if (!showMenu) {
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const renderEntries = () => {
    if (entriesLoading) {
      return (
        <div className="rounded-2xl border border-slate-100 bg-white p-6">
          <Skeleton count={3} height={96} className="mb-3" />
        </div>
      );
    }
    if (entriesError) {
      return (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 text-sm text-rose-500">
          {entriesError.message ?? "전표 내역을 불러올 수 없습니다."}
        </div>
      );
    }
    if (filteredEntries.length === 0) {
      return (
        <EmptyState
          icon="📝"
          title="등록된 전표가 없습니다"
          description="첫 전표를 작성해보세요"
          action="전표 작성하기"
          onActionClick={onCreateEntry}
          className="border-transparent bg-slate-50/80 shadow-none"
        />
      );
    }
    return (
      <>
        <JournalHistoryList
          entries={filteredEntries}
          accountLookup={accountLookup}
          onEditEntry={onEditEntry}
          onDeleteEntry={onDeleteEntry}
          isDeletingEntry={isDeletingEntry}
          currentPage={page}
        />
        <JournalPagination
          currentPage={page}
          pageSize={pageSize}
          hasNextPage={hasNextPage}
          pageSizeOptions={pageSizeOptions}
          onPrevPage={onPrevPage}
          onNextPage={onNextPage}
          onPageSizeChange={onPageSizeChange}
        />
      </>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">전표 내역</p>
          <h2 className="text-xl font-semibold text-slate-900">조회 및 필터</h2>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            onClick={toggleMenu}
            aria-label="다운로드 메뉴"
            aria-expanded={showMenu}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                onClick={handleCsvDownload}
                disabled={entries.length === 0}
                aria-label="CSV 파일로 다운로드"
              >
                CSV 다운로드
              </button>
              <button
                type="button"
                className="w-full px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-white"
                onClick={handlePdfDownload}
                disabled={entries.length === 0}
                aria-label="PDF 파일로 다운로드"
              >
                PDF 다운로드
              </button>
            </div>
          )}
        </div>
      </div>

      <JournalFiltersBar
        periodFilters={periodFilters}
        searchTerm={searchTerm}
        onPeriodChange={onPeriodChange}
        onSearchChange={onSearchChange}
        onResetPage={onResetPage}
      />

      {activeFilters.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <span
              key={filter}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600"
            >
              {filter}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6">{renderEntries()}</div>
    </div>
  );
});

JournalEntriesSection.displayName = "JournalEntriesSection";

export default JournalEntriesSection;
