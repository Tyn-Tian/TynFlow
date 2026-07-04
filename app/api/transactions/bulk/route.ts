import { transactionService } from "@/services/transaction-service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        await transactionService.addMany(body);
        return NextResponse.json({ message: "Transactions created successfully" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
