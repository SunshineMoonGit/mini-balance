export type BalanceDisplay = {
  amount: number;
  directionLabel?: "차변" | "대변";
};

export const getBalanceDisplay = (balance: number): BalanceDisplay => {
  if (balance > 0) {
    return { amount: Math.abs(balance), directionLabel: "차변" };
  }
  if (balance < 0) {
    return { amount: Math.abs(balance), directionLabel: "대변" };
  }
  return { amount: 0 };
};
