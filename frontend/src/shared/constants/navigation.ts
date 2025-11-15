export type MenuItem = {
  label: string;
  path: string;
  icon?: string;
};

export const MAIN_MENU: MenuItem[] = [
  { label: "대시보드", path: "/" },
  { label: "전표 관리", path: "/journal" },
  { label: "총계정원장", path: "/general-ledger" },
  { label: "계정과목", path: "/accounts" },
  { label: "시산표", path: "/trial-balance" },
];

export const STARRED_ACCOUNTS = [
  {
    label: "현금및현금성자산",
    subLabel: "1000 · 사용 중",
  },
  {
    label: "외상매입금",
    subLabel: "2000 · 사용 중",
  },
];

export const BREADCRUMBS = ["장부", "대시보드"];

export const PAGE_META: Record<
  string,
  {
    breadcrumbs: string[];
    title: string;
    subtitle: string;
    primaryAction: string;
    secondaryAction?: string;
  }
> = {
  "/": {
    breadcrumbs: ["장부", "대시보드"],
    title: "현금 회계",
    subtitle: "총괄 계정",
    primaryAction: "전표 관리",
  },
  "/journal": {
    breadcrumbs: ["장부", "전표 관리"],
    title: "전표 관리",
    subtitle: "분개와 증빙 기록",
    primaryAction: "새 전표",
    secondaryAction: "템플릿",
  },
  "/trial-balance": {
    breadcrumbs: ["장부", "시산표"],
    title: "시산표",
    subtitle: "차대변 균형 확인",
    primaryAction: "엑셀 다운로드",
    secondaryAction: "기간 설정",
  },
  "/general-ledger": {
    breadcrumbs: ["장부", "총계정원장"],
    title: "총계정원장",
    subtitle: "계정별 거래 내역 집계",
    primaryAction: "계정 검색",
    secondaryAction: "기간 설정",
  },
  "/accounts": {
    breadcrumbs: ["장부", "계정과목"],
    title: "계정과목",
    subtitle: "계정 체계 관리",
    primaryAction: "새 계정 추가",
    secondaryAction: "정렬/필터",
  },
};
