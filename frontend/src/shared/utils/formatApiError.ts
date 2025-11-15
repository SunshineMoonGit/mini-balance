import { ApiError } from "../api/client";

type FriendlyError = {
  message: string;
  description?: string;
};

const formatDetails = (details: unknown): string | undefined => {
  if (!details) {
    return undefined;
  }
  if (Array.isArray(details)) {
    return details.map((item) => typeof item === "object" ? JSON.stringify(item) : String(item)).join("; ");
  }
  if (typeof details === "object") {
    return Object.entries(details)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join(" · ");
  }
  return String(details);
};

export const describeApiError = (error: unknown): FriendlyError => {
  if (error instanceof ApiError) {
    const description = formatDetails(error.details);
    return {
      message: error.message,
      description,
    };
  }
  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }
  return {
    message: "예기치 않은 오류가 발생했습니다.",
  };
};
