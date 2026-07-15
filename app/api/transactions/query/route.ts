import { transactionService } from "@/services/transaction-service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, ...payload } = body;

        switch (action) {
            case "findTransactions":
                const txs = await transactionService.findTransactions(payload.filters);
                return NextResponse.json(txs);
            case "exportExcel":
                const excelData = await transactionService.exportExcel(payload);
                return NextResponse.json(excelData);
            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
