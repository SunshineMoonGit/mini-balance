import type { Account } from "../../../types";

export type AccountDto = Pick<Account, "id" | "code" | "name" | "type">;
