import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useCallback, useMemo } from "react";

import { DEFAULT_JOURNAL_LINES } from "../../../features/journal/constants";
import type { JournalEntry } from "../../../features/journal/types/domain";
import type { JournalLineState } from "../components/JournalLinesTable";
import { journalFormSchema } from "../../../features/journal/validation";
import { toDateString } from "../../../shared/utils/formatDate";

const getDefaultJournalLines = () =>
  DEFAULT_JOURNAL_LINES.map((line) => ({ ...line }));

type JournalFormValues = z.infer<typeof journalFormSchema>;

export const useJournalForm = () => {
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  const form = useForm<JournalFormValues>({
    resolver: zodResolver(journalFormSchema),
    defaultValues: {
      date: toDateString(new Date()),
      description: "",
      lines: getDefaultJournalLines(),
    },
    mode: "onChange",
  });

  const { setValue, reset, clearErrors } = form;
  const currentLines = useWatch({ control: form.control, name: "lines" }) ?? getDefaultJournalLines();

  const handleLineChange = (
    index: number,
    field: keyof JournalLineState,
    value: string
  ) => {
    const numericValue = Number(value);
    const sanitizedValue =
      field === "accountId"
        ? Number.isNaN(numericValue)
          ? 0
          : Math.max(0, Math.floor(numericValue))
        : Number.isNaN(numericValue)
        ? 0
        : Math.max(numericValue, 0);

    console.log('handleLineChange:', { index, field, value, sanitizedValue });

    setValue(`lines.${index}.${field}`, sanitizedValue, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    // 차변 또는 대변에 값을 입력하면 해당 라인의 반대쪽 필드 에러도 제거
    if ((field === "debit" || field === "credit") && sanitizedValue > 0) {
      const otherField = field === "debit" ? "credit" : "debit";
      clearErrors(`lines.${index}.${otherField}`);
    }
  };

  const addLine = useCallback(() => {
    setValue(
      "lines",
      [...currentLines, { accountId: 0, debit: 0, credit: 0 }],
      {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      }
    );
  }, [currentLines, setValue]);

  const removeLine = useCallback((index: number) => {
    if (currentLines.length <= 2) {
      return;
    }
    const updatedLines = currentLines.filter(
      (_, lineIndex) => lineIndex !== index
    );
    setValue("lines", updatedLines, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  }, [currentLines, setValue]);

  const resetToDefault = useCallback(() => {
    setEditingEntry(null);
    reset({
      date: toDateString(new Date()),
      description: "",
      lines: getDefaultJournalLines(),
    });
  }, [reset]);

  const loadEntryForEdit = useCallback((entry: JournalEntry) => {
    const entryDate = entry.postedAt?.split("T")[0] ?? toDateString(new Date());
    const mappedLines = entry.lines.map((line) => ({
      accountId: line.accountId,
      debit: line.debit,
      credit: line.credit,
    }));
    while (mappedLines.length < 2) {
      mappedLines.push({ accountId: 0, debit: 0, credit: 0 });
    }
    reset({
      date: entryDate,
      description: entry.description ?? "",
      lines: mappedLines,
    });
    setEditingEntry(entry);
  }, [reset]);

  const totals = useMemo(() => {
    const debitTotal = currentLines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const creditTotal = currentLines.reduce((sum, line) => sum + (line.credit || 0), 0);
    console.log('Totals calculated:', { debitTotal, creditTotal, currentLines });
    return {
      debit: debitTotal,
      credit: creditTotal,
    };
  }, [currentLines]);

  return {
    form,
    currentLines,
    totals,
    editingEntry,
    handleLineChange,
    addLine,
    removeLine,
    resetToDefault,
    loadEntryForEdit,
  };
};
