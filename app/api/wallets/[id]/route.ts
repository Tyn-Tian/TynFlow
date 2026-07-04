import { walletService } from "@/services/wallet-service";
import { NextResponse } from "next/server";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        await walletService.edit(id, body);
        return NextResponse.json({ message: "Wallet updated successfully" });
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
        await walletService.delete(id);
        return NextResponse.json({ message: "Wallet deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
