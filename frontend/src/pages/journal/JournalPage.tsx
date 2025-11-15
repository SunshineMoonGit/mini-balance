import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAccounts } from "../../features/accounts/hooks/useAccounts";
import { useJournalEntries } from "../../features/journal/hooks/useJournal";
import { SCROLL_HEADER_OFFSET } from "../../shared/constants/ui";
import JournalEntriesSection from "./components/JournalEntriesSection";
import JournalFormSection from "./components/JournalFormSection";
import JournalSummarySection from "./components/JournalSummarySection";
import { useJournalDownload } from "./hooks/useJournalDownload";
import { useJournalFilters } from "./hooks/useJournalFilters";
import { useJournalForm } from "./hooks/useJournalForm";
import { useJournalOperations } from "./hooks/useJournalOperations";
import { useJournalPagination } from "./hooks/useJournalPagination";

const JournalPage = () => {
  const [showJournalForm, setShowJournalForm] = useState(false);

  const {
    form,
    currentLines,
    totals,
    editingEntry,
    handleLineChange,
    addLine,
    removeLine,
    resetToDefault,
    loadEntryForEdit,
  } = useJournalForm();

  const {
    periodFilters,
    searchTerm,
    activeFilters,
    handlePeriodChange,
    handleSearchChange,
  } = useJournalFilters();

  const {
    page,
    pageSize,
    PAGE_SIZE_OPTIONS,
    handlePageSizeChange,
    goToNextPage,
    goToPrevPage,
    resetPage,
  } = useJournalPagination();

  const journalFilters = useMemo(
    () => ({
      from: periodFilters.from,
      to: periodFilters.to,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    }),
    [periodFilters, page, pageSize]
  );

  const {
    data: entries = [],
    isLoading: entriesLoading,
    error: entriesError,
  } = useJournalEntries(journalFilters);

  const { data: accounts } = useAccounts();

  const accountLookup = useMemo(() => {
    const lookup: Record<number, string> = {};
    accounts.forEach((account) => {
      lookup[account.id] = `${account.code} · ${account.name}`;
    });
    return lookup;
  }, [accounts]);

  const { handleDownloadCsv, handleDownloadPdf } = useJournalDownload(
    entries,
    accountLookup
  );

  const { handleSubmit, handleDelete, isFormSubmitting, isDeletingEntry } =
    useJournalOperations(editingEntry, resetToDefault);

  const filteredEntries = useMemo(
    () =>
      entries.filter((entry) => {
        const date = entry.postedAt?.split("T")[0];
        if (periodFilters.from && date < periodFilters.from) {
          return false;
        }
        if (periodFilters.to && date > periodFilters.to) {
          return false;
        }
        if (searchTerm && !entry.description?.includes(searchTerm)) {
          return false;
        }
        return true;
      }),
    [entries, periodFilters, searchTerm]
  );

  const hasNextPage = entries.length === pageSize;
  const formRef = useRef<HTMLFormElement | null>(null);

  const scrollFormIntoView = useCallback(() => {
    if (!formRef.current) {
      return;
    }
    const rect = formRef.current.getBoundingClientRect();
    const target = Math.max(
      rect.top + window.scrollY - SCROLL_HEADER_OFFSET,
      0
    );
    window.scrollTo({ top: target, behavior: "smooth" });
  }, []);

  const scrollToForm = useCallback(() => {
    if (!showJournalForm) {
      setShowJournalForm(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(scrollFormIntoView);
      });
      return;
    }
    scrollFormIntoView();
  }, [showJournalForm, scrollFormIntoView]);

  const handleFormClose = useCallback(() => {
    resetToDefault();
    setShowJournalForm(false);
  }, [resetToDefault]);

  const handleFormOpen = useCallback(() => {
    setShowJournalForm(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(scrollFormIntoView);
    });
  }, [scrollFormIntoView]);

  useEffect(() => {
    if (editingEntry) {
      setShowJournalForm(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(scrollFormIntoView);
      });
    }
  }, [editingEntry, scrollFormIntoView]);

  return (
    <section className="space-y-6">
      {/* 요약 박스 */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-widest text-slate-400">
            전표 관리
          </p>
          <h2 className="text-xl font-semibold text-slate-900">요약</h2>
        </div>

        <JournalSummarySection entries={entries} />
      </div>

      {/* 분개 입력 폼 박스 */}
      {showJournalForm ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">
                전표 작성
              </p>
              <h2 className="text-xl font-semibold text-slate-900">
                새 분개 입력
              </h2>
            </div>
            <button
              type="button"
              className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              onClick={handleFormClose}
              disabled={isFormSubmitting}
              aria-label="전표 작성 폼 닫기"
            >
              닫기
            </button>
          </div>

          {editingEntry && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-700">
              <p>
                전표 #{editingEntry.id}을(를) 수정 중입니다. 변경을 취소하려면{" "}
                <button
                  type="button"
                  className="underline-offset-4 text-amber-700 underline"
                  onClick={resetToDefault}
                >
                  취소
                </button>
                를 눌러주세요.
              </p>
            </div>
          )}

          <JournalFormSection
            form={form}
            currentLines={currentLines}
            totals={totals}
            accounts={accounts}
            onLineChange={handleLineChange}
            onRemoveLine={removeLine}
            onAddLine={addLine}
            onSubmit={handleSubmit}
            isSubmitting={isFormSubmitting}
            isEditing={!!editingEntry}
            formRef={formRef}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-6 text-center">
          <p className="text-sm text-slate-500">
            새 분개를 입력하려면 아래 버튼을 눌러주세요.
          </p>
          <button
            type="button"
            className="mt-4 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            onClick={handleFormOpen}
            aria-label="새 전표 작성하기"
          >
            전표 작성
          </button>
        </div>
      )}

      <JournalEntriesSection
        entries={entries}
        filteredEntries={filteredEntries}
        entriesLoading={entriesLoading}
        entriesError={entriesError ?? null}
        accountLookup={accountLookup}
        page={page}
        pageSize={pageSize}
        hasNextPage={hasNextPage}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        onPrevPage={goToPrevPage}
        onNextPage={goToNextPage}
        onPageSizeChange={handlePageSizeChange}
        onEditEntry={loadEntryForEdit}
        onDeleteEntry={handleDelete}
        isDeletingEntry={isDeletingEntry}
        periodFilters={periodFilters}
        searchTerm={searchTerm}
        onPeriodChange={handlePeriodChange}
        onSearchChange={handleSearchChange}
        onResetPage={resetPage}
        activeFilters={activeFilters}
        onCreateEntry={scrollToForm}
        onDownloadCsv={handleDownloadCsv}
        onDownloadPdf={handleDownloadPdf}
      />
    </section>
  );
};

export default JournalPage;
