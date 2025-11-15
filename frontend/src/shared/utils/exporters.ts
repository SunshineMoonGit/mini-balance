import { jsPDF } from "jspdf";

import { formatCurrency } from "./formatNumber";
import type { JournalEntry } from "../../features/journal/types/domain";
import type { TrialBalanceLine } from "../../features/trialBalance/types/domain";

type CsvRow = (string | number)[];

type DownloadOptions = {
  filename: string;
  rows: CsvRow[];
};

const sanitizeCsvCell = (value: string | number): string => {
  const stringValue = String(value ?? "");
  const escaped = stringValue.replace(/"/g, '""');
  return `"${escaped}"`;
};

const downloadCsv = ({ filename, rows }: DownloadOptions) => {
  const csvContent = rows.map((row) => row.map(sanitizeCsvCell).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

const downloadPdf = ({ filename, rows, title }: { filename: string; rows: string[]; title: string }) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  let cursorY = margin;

  doc.setFontSize(14);
  doc.text(title, margin, cursorY);
  cursorY += 28;
  doc.setFontSize(11);

  rows.forEach((line) => {
    const lineText = line.replace(/\t/g, "    ");
    doc.text(lineText, margin, cursorY, { maxWidth: 520 });
    cursorY += 18;
    if (cursorY > doc.internal.pageSize.height - margin) {
      doc.addPage();
      cursorY = margin;
    }
  });

  doc.save(filename);
};

export const downloadJournalEntriesCsv = (
  entries: JournalEntry[],
  accountLookup: Record<number, string>,
) => {
  if (entries.length === 0) {
    return;
  }

  const rows: CsvRow[] = [];
  rows.push(["전표 ID", "거래일", "적요", "계정", "차변", "대변"]);

  entries.forEach((entry) => {
    const entryDate = entry.postedAt?.split("T")[0] ?? "-";
    entry.lines.forEach((line: JournalEntry["lines"][number]) => {
      const accountLabel = accountLookup[line.accountId] ?? `계정 #${line.accountId}`;
      rows.push([
        entry.id,
        entryDate,
        entry.description ?? "",
        accountLabel,
        line.debit,
        line.credit,
      ]);
    });
  });

  downloadCsv({ filename: `journal-entries-${Date.now()}.csv`, rows });
};

export const downloadJournalEntriesPdf = (
  entries: JournalEntry[],
  accountLookup: Record<number, string>,
) => {
  if (entries.length === 0) {
    return;
  }

  const rows: string[] = [];
  entries.forEach((entry) => {
    const entryDate = entry.postedAt?.split("T")[0] ?? "-";
    rows.push(`전표 #${entry.id} · ${entryDate} · ${entry.description ?? "설명 없음"}`);
    entry.lines.forEach((line: JournalEntry["lines"][number]) => {
      const accountLabel = accountLookup[line.accountId] ?? `계정 #${line.accountId}`;
      rows.push(`  ${accountLabel} · 차변 ${formatCurrency(line.debit)} · 대변 ${formatCurrency(line.credit)}`);
    });
    rows.push("-");
  });

  downloadPdf({
    filename: `journal-entries-${Date.now()}.pdf`,
    rows,
    title: "분개 내역",
  });
};

export const downloadTrialBalanceCsv = (lines: TrialBalanceLine[]) => {
  if (lines.length === 0) {
    return;
  }

  const rows: CsvRow[] = [];
  rows.push([
    "계정 ID",
    "계정명",
    "계정 유형",
    "기초 잔액",
    "총 차변",
    "총 대변",
    "기말 잔액",
    "기말 방향",
  ]);
  lines.forEach((line) => {
    rows.push([
      line.accountId,
      line.accountName,
      line.type,
      line.openingBalance.amount,
      line.totalDebit,
      line.totalCredit,
      line.endingBalance.amount,
      line.endingBalance.direction,
    ]);
  });

  downloadCsv({ filename: `trial-balance-${Date.now()}.csv`, rows });
};
