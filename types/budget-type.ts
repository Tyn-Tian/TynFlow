export interface Budget {
  id: string;
  name: string;
  total: number;
  leftover: number;
  deleted_at?: string | null;
}

export interface BudgetDto {
  name: string;
  total: number;
  leftover: number;
}

