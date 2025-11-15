import { useCallback, useState } from "react";

import type { AccountType } from "../../../features/accounts/types/domain";

export const useAccountFilters = () => {
  const [showInactiveAccounts, setShowInactiveAccounts] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<AccountType[]>([]);

  const toggleTypeSelection = useCallback((type: AccountType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]
    );
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedTypes([]);
    setSearchTerm("");
  }, []);

  const handleToggleInactive = useCallback((value: boolean) => {
    setShowInactiveAccounts(value);
  }, []);

  return {
    showInactiveAccounts,
    searchTerm,
    selectedTypes,
    toggleTypeSelection,
    resetFilters,
    handleToggleInactive,
    setSearchTerm,
  };
};
