
import { walletService } from "@/services/wallet-service";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const wallets = await walletService.getAll();
        return NextResponse.json(wallets);
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        await walletService.add(body);
        return NextResponse.json({ message: "Wallet created successfully" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}