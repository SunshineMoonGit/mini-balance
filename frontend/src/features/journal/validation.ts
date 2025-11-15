import { z } from "zod";

const MAX_JOURNAL_AMOUNT = 1_000_000_000;
const DESCRIPTION_INVALID_CHARS = /[<>]/;

export const journalLineSchema = z
  .object({
    accountId: z.number().int().min(1, "계정을 선택해주세요."),
    debit: z
      .number()
      .int("원화는 정수만 입력 가능합니다.")
      .min(0, "차변 금액은 0 이상이어야 합니다.")
      .max(
        MAX_JOURNAL_AMOUNT,
        "금액은 최대 1,000,000,000원까지 입력할 수 있습니다."
      ),
    credit: z
      .number()
      .int("원화는 정수만 입력 가능합니다.")
      .min(0, "대변 금액은 0 이상이어야 합니다.")
      .max(
        MAX_JOURNAL_AMOUNT,
        "금액은 최대 1,000,000,000원까지 입력할 수 있습니다."
      ),
  })
  .superRefine((line, ctx) => {
    const hasDebit = line.debit > 0;
    const hasCredit = line.credit > 0;
    if (!hasDebit && !hasCredit) {
      ctx.addIssue({
        code: "custom",
        message: "차변 또는 대변 중 하나는 입력해주세요.",
        path: ["debit"],
      });
      ctx.addIssue({
        code: "custom",
        message: "차변 또는 대변 중 하나는 입력해주세요.",
        path: ["credit"],
      });
    }
    if (hasDebit && hasCredit) {
      ctx.addIssue({
        code: "custom",
        message: "차변 또는 대변 중 하나만 입력해주세요.",
        path: ["debit"],
      });
      ctx.addIssue({
        code: "custom",
        message: "차변 또는 대변 중 하나만 입력해주세요.",
        path: ["credit"],
      });
    }
  });

export const journalFormSchema = z
  .object({
    date: z
      .string()
      .min(1, "날짜를 선택해주세요.")
      .refine(
        (value) => !Number.isNaN(Date.parse(value)),
        "유효한 날짜를 입력해주세요."
      ),
    description: z
      .string()
      .trim()
      .min(1, "적요를 입력해주세요.")
      .max(500, "적요는 500자 이하여야 합니다.")
      .refine(
        (value) => !DESCRIPTION_INVALID_CHARS.test(value),
        "적요에 '<' 또는 '>' 문자는 사용할 수 없습니다."
      ),
    lines: z
      .array(journalLineSchema)
      .min(2, "분개는 최소 2줄 이상이어야 합니다."),
  })
  .superRefine((form, ctx) => {
    const totalDebit = form.lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredit = form.lines.reduce((sum, line) => sum + line.credit, 0);
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      ctx.addIssue({
        code: "custom",
        message: "차변과 대변의 합계가 일치해야 합니다.",
        path: ["lines"],
      });
    }
  });
