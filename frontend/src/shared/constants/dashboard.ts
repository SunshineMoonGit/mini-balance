export const KPI_CARDS = [
  { label: "당월 자산 증가액", value: "₩ 1,540,000", badge: "+12.4%" },
  { label: "현금 잔액", value: "₩ 8,450,000", badge: "+2.3%" },
  { label: "전표 처리", value: "18건", badge: "+3건" },
  { label: "미결 전표", value: "2건", badge: "확인 필요" },
];

export const LEDGER_ACTIVITY = [
  {
    id: 1,
    title: "임차료 지급",
    memo: "11월 사무실",
    amount: "₩ 1,200,000",
    type: "expense",
    date: "11-21",
  },
  {
    id: 2,
    title: "카드 매출",
    memo: "온·오프라인 묶음",
    amount: "₩ 980,000",
    type: "income",
    date: "11-20",
  },
  {
    id: 3,
    title: "급여 지급",
    memo: "11월 정기 급여",
    amount: "₩ 4,200,000",
    type: "expense",
    date: "11-18",
  },
];

export const PENDING_JOURNALS = [
  {
    id: 301,
    title: "법인카드 비용 정산",
    requester: "박회계",
    amount: "₩ 580,000",
    status: "검토 중",
  },
  {
    id: 302,
    title: "재고 조정",
    requester: "김운영",
    amount: "₩ 910,000",
    status: "증빙 대기",
  },
];

export const BALANCE_ALERTS = [
  { category: "자산", debit: 6200000, credit: 0, balance: "차변 +₩ 6,200,000" },
  { category: "부채", debit: 0, credit: 3950000, balance: "대변 +₩ 3,950,000" },
  { category: "자본", debit: 0, credit: 3500000, balance: "대변 +₩ 3,500,000" },
];
