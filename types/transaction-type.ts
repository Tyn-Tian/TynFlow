export type TransactionType = "Income" | "Expense" | "Transfer" | "Invest";

export interface Filters {
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  walletId?: string;
  budgetId?: string;
  dates?: string[];
}



export interface Transaction {
  id: string;
  name: string;
  date: string;
  amount: number;
  type: TransactionType;
  budget_id: string | null;
  wallet_id: string | null;
  transfer_id: string | null;
  admin_fee: number;
  portfolio_id: string | null;
  budget: { name: string } | null;
  wallet: { name: string } | null;
  transfer: { name: string } | null;
  portfolio: { name: string } | null;
}

export interface TransactionDto {
  name: string;
  date: string;
  amount: number;
  type: TransactionType;
  budget_id?: string | null;
  wallet_id?: string | null;
  transfer_id?: string | null;
  admin_fee?: number | null;
  portfolio_id?: string | null;
}

export interface Params {
  page?: number;
  limit?: number;
  walletId?: string;
  budgetId?: string;
}
