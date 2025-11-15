export const palette = {
  background: "#f8fafc",
  surface: "#ffffff",
  border: "#e2e8f0",
  borderSoft: "#eff4fb",
  textPrimary: "#0f172a",
  textSecondary: "#64748b",
  brand: "#2563eb",
  brandSoft: "#e0edff",
  success: "#0ea5e9",
  danger: "#f43f5e",
  warning: "#f97316",
};

export const radii = {
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.25rem",
  full: "9999px",
};

export const shadows = {
  card: "0 20px 45px rgba(15,23,42,0.08)",
  hover: "0 25px 55px rgba(15,23,42,0.12)",
};

export const gradients = {
  brand: "linear-gradient(135deg, #dbeafe, #fce7f3)",
};

export const tokens = {
  palette,
  radii,
  shadows,
  gradients,
} as const;

export type ThemeTokens = typeof tokens;
