import { useCallback, useState } from "react";

import type { AccountFormState } from "../components/AccountFormSection";

export const useAccountFormState = (initialState: AccountFormState) => {
  const [formState, setFormState] = useState<AccountFormState>(initialState);
  const [formErrors, setFormErrors] = useState<{
    code?: string;
    name?: string;
  }>({});

  const handleFormChange = useCallback(
    <K extends keyof AccountFormState>(field: K, value: AccountFormState[K]) => {
      setFormState((prev) => ({
        ...prev,
        [field]: value,
      }));
      if (formErrors[field as keyof typeof formErrors]) {
        setFormErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    },
    [formErrors]
  );

  const resetForm = useCallback(() => {
    setFormState(initialState);
    setFormErrors({});
  }, [initialState]);

  return {
    formState,
    formErrors,
    setFormState,
    setFormErrors,
    handleFormChange,
    resetForm,
  };
};
