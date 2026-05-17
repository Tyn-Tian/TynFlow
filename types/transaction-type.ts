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
  budget_id: string;
  wallet_id: string;
  transfer_id: string;
  admin_fee: number;
  portfolio_id: string;
}