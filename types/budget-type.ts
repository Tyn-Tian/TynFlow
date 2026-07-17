export interface Option {
  id: string;
  name: string;
  deleted_at?: string | null;
}

export interface Budget {
  id: string;
  name: string;
  total: number;
  leftover: number;
  deleted_at?: string | null;
  daily_spending: number;
  total_spending: number;
}

export interface BudgetDto {
  name: string;
  total: number;
  leftover: number;
}

