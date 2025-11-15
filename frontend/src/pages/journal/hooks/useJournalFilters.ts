import { useState, useMemo, type ChangeEvent } from "react";

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDefaultPeriod = () => {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return { from: formatDate(start), to: formatDate(end) };
};

export const useJournalFilters = () => {
  const [periodFilters, setPeriodFilters] = useState(getDefaultPeriod);
  const [searchTerm, setSearchTerm] = useState("");

  const handlePeriodChange = (field: "from" | "to", value: string) => {
    setPeriodFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const activeFilters = useMemo(
    () =>
      [
        searchTerm ? `키워드: ${searchTerm}` : null,
      ].filter(Boolean) as string[],
    [searchTerm]
  );

  return {
    periodFilters,
    searchTerm,
    activeFilters,
    handlePeriodChange,
    handleSearchChange,
  };
};
