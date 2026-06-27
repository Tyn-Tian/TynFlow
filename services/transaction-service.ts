import { Wallet } from "@/types/wallet-type";
import { transactionRepository } from "../repository/transaction-repository";
import { Filters, Params, TransactionDto } from "@/types/transaction-type";
import { Budget } from "@/types/budget-type";
import { Portfolio } from "@/types/portfolio-type";
import { budgetService } from "./budget-service";
import { walletService } from "./wallet-service";
import { portfolioService } from "./portfolio-service";

export const transactionService = {
  findTransactions: async (filter: Filters) => {
    return await transactionRepository.findTransactions(filter);
  },
  getPaginatedTransactions: async ({
    wallets,
    budgets,
    portfolios,
    params,
  }: {
    wallets: Wallet[];
    budgets: Budget[];
    portfolios: Portfolio[];
    params: Params;
  }) => {
    const { page, walletId, budgetId } = params;

    const { data } = await transactionRepository.findTransactionDates({
      walletId,
      budgetId,
    });

    const uniqueDates = Array.from(new Set((data ?? []).map((d) => d.date)));
    const pageDates = uniqueDates.slice((page - 1) * 10, page * 10);
    if (pageDates.length === 0) return [];

    const rows = await transactionRepository.findTransactions({
      walletId,
      budgetId,
      dates: pageDates,
    });

    const walletIds = Array.from(
      new Set(
        rows.flatMap(
          (r) => [r.wallet_id, r.transfer_id].filter(Boolean) as string[],
        ),
      ),
    );
    let walletMap: Record<string, string> = {};
    if (walletIds.length) {
      if (wallets) {
        walletMap = Object.fromEntries(
          wallets.map((w) => [w.id, w.name ?? ""]),
        );
      }
    }

    const budgetIds = Array.from(
      new Set(rows.map((r) => r.budget_id).filter(Boolean) as string[]),
    );
    let budgetMap: Record<string, string> = {};
    if (budgetIds.length) {
      if (budgets)
        budgetMap = Object.fromEntries(
          budgets.map((b) => [b.id, b.name ?? ""]),
        );
    }

    const portfolioIds = Array.from(
      new Set(rows.map((r) => r.portfolio_id).filter(Boolean) as string[]),
    );
    let portfolioMap: Record<string, string> = {};
    if (portfolioIds.length) {
      if (portfolios) {
        portfolioMap = Object.fromEntries(
          portfolios.map((p) => [p.id, p.name ?? ""]),
        );
      }
    }

    return rows.map((t) => ({
      ...t,
      budgetName: t.budget_id ? budgetMap[t.budget_id] : undefined,
      walletName: t.wallet_id ? walletMap[t.wallet_id] : undefined,
      transferName: t.transfer_id ? walletMap[t.transfer_id] : undefined,
      portfolioName: t.portfolio_id ? portfolioMap[t.portfolio_id] : undefined,
    }));
  },
  getTransactionPaginationMetadata: async (params: Params) => {
    const { data, error } =
      await transactionRepository.findTransactionDates(params);
    if (error || !data) return { totalPages: 1 };

    const uniqueDates = Array.from(new Set((data ?? []).map((d) => d.date)));
    const totalPages = Math.ceil(uniqueDates.length / 10);

    return { totalPages: Math.max(totalPages, 1) };
  },
  getById: async (id: string) => {
    const { data } = await transactionRepository.getById(id);
    return data;
  },
  add: async (dto: TransactionDto) => {
    await transactionRepository.create(dto);

    if (dto.type === "Expense" && dto.wallet_id && dto.budget_id) {
      await budgetService.updateLeftover(dto.budget_id, -Number(dto.amount));
      await walletService.updateBalance(dto.wallet_id, -Number(dto.amount));
    }

    if (dto.type === "Income" && dto.wallet_id) {
      await walletService.updateBalance(dto.wallet_id, Number(dto.amount));
    }

    if (dto.type === "Transfer" && dto.wallet_id && dto.transfer_id) {
      await walletService.updateBalance(
        dto.wallet_id,
        -(Number(dto.amount) + Number(dto.admin_fee ?? 0)),
      );
      await walletService.updateBalance(dto.transfer_id, Number(dto.amount));
    }

    if (dto.type === "Invest" && dto.wallet_id && dto.portfolio_id) {
      await walletService.updateBalance(
        dto.wallet_id,
        -(Number(dto.amount) + Number(dto.admin_fee ?? 0)),
      );
      await portfolioService.updateValue(dto.portfolio_id, Number(dto.amount));
    }
  },
  addMany: async (dtos: TransactionDto[]) => {
    for (const dto of dtos) {
      await transactionService.add(dto);
    }
  },
  edit: async (id: string, dto: TransactionDto) => {
    const { data: tx } = await transactionRepository.getById(id);

    if (tx?.type === "Expense" && tx?.wallet_id && tx?.budget_id) {
      await budgetService.updateLeftover(tx.budget_id, Number(tx.amount));
      await walletService.updateBalance(tx.wallet_id, Number(tx.amount));
    }

    if (tx?.type === "Income" && tx?.wallet_id) {
      await walletService.updateBalance(tx.wallet_id, -Number(tx.amount));
    }

    if (tx?.type === "Transfer" && tx?.wallet_id && tx?.transfer_id) {
      await walletService.updateBalance(
        tx.wallet_id,
        Number(tx.amount) + Number(tx.admin_fee ?? 0),
      );
      await walletService.updateBalance(tx.transfer_id, -Number(tx.amount));
    }

    if (tx?.type === "Invest" && tx?.wallet_id && tx?.portfolio_id) {
      await walletService.updateBalance(
        tx.wallet_id,
        Number(tx.amount) + Number(tx.admin_fee ?? 0),
      );
      await portfolioService.updateValue(tx.portfolio_id, -Number(tx.amount));
    }

    await transactionRepository.update(id, dto);

    if (dto.type === "Expense" && dto.wallet_id && dto.budget_id) {
      await budgetService.updateLeftover(dto.budget_id, -Number(dto.amount));
      await walletService.updateBalance(dto.wallet_id, -Number(dto.amount));
    }

    if (dto.type === "Income" && dto.wallet_id) {
      await walletService.updateBalance(dto.wallet_id, Number(dto.amount));
    }

    if (dto.type === "Transfer" && dto.wallet_id && dto.transfer_id) {
      await walletService.updateBalance(
        dto.wallet_id,
        -(Number(dto.amount) + Number(dto.admin_fee ?? 0)),
      );
      await walletService.updateBalance(dto.transfer_id, Number(dto.amount));
    }

    if (dto.type === "Invest" && dto.wallet_id && dto.portfolio_id) {
      await walletService.updateBalance(
        dto.wallet_id,
        -(Number(dto.amount) + Number(dto.admin_fee ?? 0)),
      );
      await portfolioService.updateValue(dto.portfolio_id, Number(dto.amount));
    }
  },
  delete: async (id: string) => {
    const { data: tx } = await transactionRepository.getById(id);

    if (tx?.type === "Expense" && tx?.wallet_id && tx?.budget_id) {
      await budgetService.updateLeftover(tx.budget_id, Number(tx.amount));
      await walletService.updateBalance(tx.wallet_id, Number(tx.amount));
    }

    if (tx?.type === "Income" && tx?.wallet_id) {
      await walletService.updateBalance(tx.wallet_id, -Number(tx.amount));
    }

    if (tx?.type === "Transfer" && tx?.wallet_id && tx?.transfer_id) {
      await walletService.updateBalance(
        tx.wallet_id,
        Number(tx.amount) + Number(tx.admin_fee ?? 0),
      );
      await walletService.updateBalance(tx.transfer_id, -Number(tx.amount));
    }

    if (tx?.type == "Invest" && tx?.wallet_id && tx?.portfolio_id) {
      await walletService.updateBalance(
        tx.wallet_id,
        Number(tx.amount) + Number(tx.admin_fee ?? 0),
      );
      await portfolioService.updateValue(tx.portfolio_id, -Number(tx.amount));
    }

    await transactionRepository.delete(id);
  },
  exportExcel: async ({
    wallets,
    budgets,
    portfolios,
    filters,
  }: {
    wallets: Wallet[];
    budgets: Budget[];
    portfolios: Portfolio[];
    filters: { startDate?: string; endDate?: string };
  }) => {
    const data = await transactionRepository.findTransactions(filters);

    const walletIds = Array.from(
      new Set(
        data.flatMap(
          (r) => [r.wallet_id, r.transfer_id].filter(Boolean) as string[],
        ),
      ),
    );
    let walletMap: Record<string, string> = {};
    if (walletIds.length) {
      if (wallets)
        walletMap = Object.fromEntries(
          wallets.map((w) => [w.id, w.name ?? ""]),
        );
    }

    const budgetIds = Array.from(
      new Set(data.map((r) => r.budget_id).filter(Boolean) as string[]),
    );
    let budgetMap: Record<string, string> = {};
    if (budgetIds.length) {
      if (budgets)
        budgetMap = Object.fromEntries(
          budgets.map((b) => [b.id, b.name ?? ""]),
        );
    }

    const portfolioIds = Array.from(
      new Set(data.map((r) => r.portfolio_id).filter(Boolean) as string[]),
    );
    let portfolioMap: Record<string, string> = {};
    if (portfolioIds.length) {
      if (portfolios)
        portfolioMap = Object.fromEntries(
          portfolios.map((p) => [p.id, p.name ?? ""]),
        );
    }

    return data.map((t) => ({
      ...t,
      budgetName: t.budget_id ? budgetMap[t.budget_id] : undefined,
      walletName: t.wallet_id ? walletMap[t.wallet_id] : undefined,
      transferName: t.transfer_id ? walletMap[t.transfer_id] : undefined,
      portfolioName: t.portfolio_id ? portfolioMap[t.portfolio_id] : undefined,
    }));
  },
};
