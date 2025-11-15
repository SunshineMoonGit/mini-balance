import { useState, type ChangeEvent } from "react";

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export const useJournalPagination = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);

  const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(event.target.value));
    setPage(1);
  };

  const goToNextPage = () => setPage((prev) => prev + 1);
  const goToPrevPage = () => setPage((prev) => Math.max(prev - 1, 1));
  const resetPage = () => setPage(1);

  return {
    page,
    pageSize,
    PAGE_SIZE_OPTIONS,
    handlePageSizeChange,
    goToNextPage,
    goToPrevPage,
    resetPage,
    setPage,
  };
};
