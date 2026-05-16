export interface Filters {
  type?: "Income" | "Expense" | "Transfer" | "Invest";
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
  type: "Income" | "Expense" | "Transfer" | "Invest";
  budget_id: string;
  wallet_id: string;
  transfer_id: string;
  admin_fee: number;
  portfolio_id: string;
}