import { transactionRepository2 } from "./../repository/transaction-repository.new";
import { Filters } from "@/types/transaction-type";

export const transactionService2 = {
  findTransactions: async (filter: Filters) => {
    return await transactionRepository2.findTransactions(filter);
  },
};
