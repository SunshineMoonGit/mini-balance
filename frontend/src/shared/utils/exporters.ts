import html2pdf from "html2pdf.js";

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

  // HTML 콘텐츠 생성
  const htmlContent = document.createElement('div');
  htmlContent.style.padding = '20px';
  htmlContent.style.fontFamily = 'sans-serif';

  // 제목
  const title = document.createElement('h1');
  title.textContent = '분개 내역';
  title.style.fontSize = '24px';
  title.style.marginBottom = '20px';
  title.style.borderBottom = '2px solid #333';
  title.style.paddingBottom = '10px';
  htmlContent.appendChild(title);

  // 각 전표 항목
  entries.forEach((entry) => {
    const entryDate = entry.postedAt?.split("T")[0] ?? "-";

    // 전표 헤더
    const entryHeader = document.createElement('div');
    entryHeader.style.marginTop = '15px';
    entryHeader.style.marginBottom = '10px';
    entryHeader.style.fontSize = '14px';
    entryHeader.style.fontWeight = 'bold';
    entryHeader.style.color = '#333';
    entryHeader.textContent = `전표 #${entry.id} · ${entryDate} · ${entry.description ?? "설명 없음"}`;
    htmlContent.appendChild(entryHeader);

    // 전표 라인
    entry.lines.forEach((line: JournalEntry["lines"][number]) => {
      const accountLabel = accountLookup[line.accountId] ?? `계정 #${line.accountId}`;
      const lineDev = document.createElement('div');
      lineDev.style.marginLeft = '20px';
      lineDev.style.fontSize = '12px';
      lineDev.style.marginBottom = '5px';
      lineDev.textContent = `${accountLabel} · 차변 ${formatCurrency(line.debit)} · 대변 ${formatCurrency(line.credit)}`;
      htmlContent.appendChild(lineDev);
    });

    // 구분선
    const separator = document.createElement('hr');
    separator.style.margin = '10px 0';
    separator.style.border = 'none';
    separator.style.borderTop = '1px solid #ddd';
    htmlContent.appendChild(separator);
  });

  // html2pdf 옵션
  const options = {
    margin: 10,
    filename: `journal-entries-${Date.now()}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
  };

  // PDF 생성 및 다운로드
  html2pdf().set(options).from(htmlContent).save();
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

export const downloadTrialBalancePdf = (lines: TrialBalanceLine[]) => {
  if (lines.length === 0) {
    return;
  }

  const TYPE_LABELS: Record<string, string> = {
    ASSET: "자산",
    LIABILITY: "부채",
    EQUITY: "자본",
    REVENUE: "수익",
    EXPENSE: "비용",
  };

  const directionLabel = (direction: string) =>
    direction === "DEBIT" ? "차변" : "대변";

  // HTML 콘텐츠 생성
  const htmlContent = document.createElement('div');
  htmlContent.style.padding = '20px';
  htmlContent.style.fontFamily = 'sans-serif';

  // 제목
  const title = document.createElement('h1');
  title.textContent = '시산표';
  title.style.fontSize = '24px';
  title.style.marginBottom = '20px';
  title.style.borderBottom = '2px solid #333';
  title.style.paddingBottom = '10px';
  htmlContent.appendChild(title);

  // 테이블 생성
  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.fontSize = '11px';

  // 테이블 헤더
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
      <th style="padding: 8px; text-align: left; font-weight: 600;">코드</th>
      <th style="padding: 8px; text-align: left; font-weight: 600;">계정</th>
      <th style="padding: 8px; text-align: left; font-weight: 600;">분류</th>
      <th style="padding: 8px; text-align: right; font-weight: 600;">기초 잔액</th>
      <th style="padding: 8px; text-align: right; font-weight: 600;">차변 합계</th>
      <th style="padding: 8px; text-align: right; font-weight: 600;">대변 합계</th>
      <th style="padding: 8px; text-align: right; font-weight: 600;">기말 잔액</th>
    </tr>
  `;
  table.appendChild(thead);

  // 테이블 바디
  const tbody = document.createElement('tbody');
  lines.forEach((line, index) => {
    const row = document.createElement('tr');
    row.style.borderBottom = '1px solid #e2e8f0';
    if (index % 2 === 1) {
      row.style.backgroundColor = '#f8fafc';
    }

    row.innerHTML = `
      <td style="padding: 8px;">${line.accountCode}</td>
      <td style="padding: 8px; font-weight: 600;">${line.accountName}</td>
      <td style="padding: 8px;">${TYPE_LABELS[line.type] ?? line.type}</td>
      <td style="padding: 8px; text-align: right;">
        ${formatCurrency(line.openingBalance.amount)}<br/>
        <span style="font-size: 9px; color: #94a3b8;">${directionLabel(line.openingBalance.direction)}</span>
      </td>
      <td style="padding: 8px; text-align: right; color: ${line.totalDebit === 0 ? '#64748b' : '#059669'};">
        ${formatCurrency(line.totalDebit)}
      </td>
      <td style="padding: 8px; text-align: right; color: ${line.totalCredit === 0 ? '#64748b' : '#dc2626'};">
        ${formatCurrency(line.totalCredit)}
      </td>
      <td style="padding: 8px; text-align: right; font-weight: 600;">
        ${formatCurrency(line.endingBalance.amount)}<br/>
        <span style="font-size: 9px; color: #94a3b8;">${directionLabel(line.endingBalance.direction)}</span>
      </td>
    `;
    tbody.appendChild(row);
  });
  table.appendChild(tbody);

  htmlContent.appendChild(table);

  // html2pdf 옵션
  const options = {
    margin: 10,
    filename: `trial-balance-${Date.now()}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' as const }
  };

  // PDF 생성 및 다운로드
  html2pdf().set(options).from(htmlContent).save();
};
