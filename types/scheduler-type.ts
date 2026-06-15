export interface Scheduler {
    id: string;
    name: string;
    type: "Expense" | "Income" | "Transfer" | "Invest";
    amount: number;
    frequency: "Daily" | "Weekly" | "Monthly" | "Yearly";
    next_run_date: string;
    status: string;
    budget_id?: string | null;
    wallet_id?: string | null;
    transfer_id?: string | null;
    portfolio_id?: string | null;
    admin_fee?: number | null;
}

export type SchedulerDto = {
    name: string;
    type: "Expense" | "Income" | "Transfer" | "Invest";
    amount: number;
    budget_id?: string | null;
    wallet_id?: string | null;
    transfer_id?: string | null;
    portfolio_id?: string | null;
    admin_fee?: number | null;
    frequency: "Daily" | "Weekly" | "Monthly" | "Yearly";
    next_run_date: string;
    status?: string;
};
