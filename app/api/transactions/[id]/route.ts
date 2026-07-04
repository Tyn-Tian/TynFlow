import { transactionService } from "@/services/transaction-service";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const tx = await transactionService.getById(id);
        return NextResponse.json(tx);
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        await transactionService.edit(id, body);
        return NextResponse.json({ message: "Transaction updated successfully" });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await transactionService.delete(id);
        return NextResponse.json({ message: "Transaction deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
