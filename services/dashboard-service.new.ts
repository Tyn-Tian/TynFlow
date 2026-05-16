import { ChartConfig } from "@/components/ui/chart";
import { Budget } from "@/types/budget-type";
import { MonthData } from "@/types/dashboard-type";
import { Transaction } from "@/types/transaction-type";

export const dashboardService2 = {
  getSummaries: ({
    incomeTxs = [],
    expenseTxs = [],
    prevIncomeTxs = [],
    prevExpenseTxs = [],
  }: {
    incomeTxs?: Transaction[];
    expenseTxs?: Transaction[];
    prevIncomeTxs?: Transaction[];
    prevExpenseTxs?: Transaction[];
  }) => {
    const sumAmounts = (txs: Transaction[]) =>
      txs.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

    const incomeTotal = sumAmounts(incomeTxs);
    const expenseTotal = sumAmounts(expenseTxs);

    const incomePrevTotal = sumAmounts(prevIncomeTxs);
    const expensePrevTotal = sumAmounts(prevExpenseTxs);

    const calcChange = (current: number, previous: number) => {
      if (previous === 0) return current === 0 ? 0 : 100;
      return ((current - previous) / Math.abs(previous)) * 100;
    };

    return {
      incomeTotal,
      expenseTotal,
      incomeChange: calcChange(incomeTotal, incomePrevTotal),
      expenseChange: calcChange(expenseTotal, expensePrevTotal),
      cashFlow: incomeTotal - expenseTotal,
    };
  },
  getIncomeChartData: ({
    transactions = [],
  }: {
    transactions?: Transaction[];
  }) => {
    const grouped = transactions.reduce<Record<string, number>>((acc, t) => {
      const name = t.name ?? "Unnamed";
      acc[name] = (acc[name] ?? 0) + (Number(t.amount) || 0);
      return acc;
    }, {});

    const paletteSize = 5;
    const entries = Object.entries(grouped);

    const chartData = entries.map(([name, value], idx) => {
      const key = `i_${idx}`;
      return {
        name,
        value,
        fill: `var(--color-${key})`,
        [key]: name,
        __key: key,
      };
    });

    const chartConfig: ChartConfig = { value: { label: "Amount" } };
    chartData.forEach((d, idx) => {
      const key = d.__key;
      chartConfig[key] = {
        label: `${d.name}`,
        color: `var(--chart-${(idx % paletteSize) + 1})`,
      };
    });

    return {
      chartData,
      chartConfig,
    };
  },
  getExpenseChartData: ({
    transactions = [],
    budgets = [],
  }: {
    transactions?: Transaction[];
    budgets?: Budget[];
  }) => {
    const budgetIds = Array.from(
      new Set(transactions.map((t) => t.budget_id).filter(Boolean) as string[]),
    );
    const budgetsMap = new Map<string, string>();

    if (budgetIds.length) {
      budgets
        .filter((b: Budget) => budgetIds.includes(b.id))
        .forEach((b: Budget) => budgetsMap.set(b.id, b.name));
    }

    const grouped = transactions.reduce<Record<string, number>>((acc, t) => {
      const bid = t.budget_id ?? "__uncategorized__";
      const name =
        budgetsMap.get(bid) ??
        (bid === "__uncategorized__" ? "Uncategorized" : "Unknown");
      acc[name] = (acc[name] ?? 0) + (Number(t.amount) || 0);
      return acc;
    }, {});

    const paletteSize = 5;
    const entries = Object.entries(grouped);

    const chartData = entries.map(([name, value], idx) => {
      const key = `b_${idx}`;
      return {
        name,
        value,
        fill: `var(--color-${key})`,
        [key]: name,
        __key: key,
      };
    });

    const chartConfig: ChartConfig = { value: { label: "Amount" } };
    chartData.forEach((d, idx) => {
      const key = d.__key;
      chartConfig[key] = {
        label: d.name,
        color: `var(--chart-${(idx % paletteSize) + 1})`,
      };
    });

    return {
      chartData,
      chartConfig,
    };
  },
  getBarChartData: ({
    transactions = [],
    months = [],
  }: {
    transactions?: Transaction[];
    months: MonthData[];
  }) => {
    transactions.forEach((t) => {
      const d = new Date(t.date);
      const year = d.getFullYear();
      const month = d.getMonth();
      const found = months.find((m) => m.year === year && m.month === month);
      if (found) {
        if (t.type === "Income") found.income += Number(t.amount) || 0;
        if (t.type === "Expense") found.expense += Number(t.amount) || 0;
      }
    });

    const chartData = months.map((m) => ({
      month: m.label,
      income: m.income,
      expense: m.expense,
    }));

    const chartConfig: ChartConfig = {
      income: {
        label: "Income",
        color: "var(--chart-2)",
      },
      expense: {
        label: "Expense",
        color: "var(--chart-5)",
      },
    };

    return { chartData, chartConfig };
  },
};
