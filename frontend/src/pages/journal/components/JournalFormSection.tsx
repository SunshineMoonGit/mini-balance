import type { Ref } from "react";
import { memo } from "react";
import { Controller } from "react-hook-form";
import type { FieldErrors, UseFormReturn } from "react-hook-form";

import type { Account } from "../../../features/accounts/types/domain";
import JournalLinesTable, { type JournalLineState } from "./JournalLinesTable";
import DatePicker from "../../../shared/components/DatePicker";

type JournalFormValues = {
  date: string;
  description: string;
  lines: JournalLineState[];
};

type Props = {
  form: UseFormReturn<JournalFormValues>;
  currentLines: JournalLineState[];
  totals: { debit: number; credit: number };
  accounts: Account[];
  onLineChange: (
    index: number,
    field: keyof JournalLineState,
    value: string
  ) => void;
  onRemoveLine: (index: number) => void;
  onAddLine: () => void;
  onSubmit: (values: JournalFormValues) => Promise<void>;
  isSubmitting: boolean;
  isEditing: boolean;
  formRef?: Ref<HTMLFormElement>;
};

const JournalFormSection = memo(({
  form,
  currentLines,
  totals,
  accounts,
  onLineChange,
  onRemoveLine,
  onAddLine,
  onSubmit,
  isSubmitting,
  isEditing,
  formRef,
}: Props) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  const lineErrors: FieldErrors<JournalLineState>[] = Array.isArray(
    errors.lines
  )
    ? (errors.lines as FieldErrors<JournalLineState>[])
    : [];
  const linesErrorMessage = !Array.isArray(errors.lines)
    ? errors.lines?.message
    : undefined;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onSubmit)}
      className="mt-6 space-y-4"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col text-sm font-medium text-slate-600">
          분개일
          <div className="mt-2">
            <Controller
              control={control}
              name="date"
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="날짜를 선택하세요"
                />
              )}
            />
          </div>
          {errors.date?.message && (
            <p className="mt-1 text-xs text-rose-500">{errors.date.message}</p>
          )}
        </label>
      </div>

      <label className="block text-sm font-medium text-slate-600">
        적요
        <textarea
          className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm"
          placeholder="예: 11월 임차료 지급"
          {...register("description")}
        />
        {errors.description?.message && (
          <p className="mt-1 text-xs text-rose-500">
            {errors.description.message}
          </p>
        )}
      </label>

      <JournalLinesTable
        lines={currentLines}
        onChange={onLineChange}
        onRemoveLine={onRemoveLine}
        onAddLine={onAddLine}
        accounts={accounts}
        totals={totals}
        errors={lineErrors}
      />
      {linesErrorMessage && (
        <p className="mt-2 text-xs text-rose-500">{linesErrorMessage}</p>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
          aria-label={isEditing ? "전표 변경 저장" : "전표 등록"}
        >
          {isSubmitting
            ? isEditing
              ? "수정 중..."
              : "등록 중..."
            : isEditing
            ? "변경 저장"
            : "전표 등록"}
        </button>
      </div>
    </form>
  );
});

JournalFormSection.displayName = "JournalFormSection";

export default JournalFormSection;
