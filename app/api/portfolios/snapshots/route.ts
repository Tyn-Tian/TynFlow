import { portfolioService } from "@/services/portfolio-service";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const snapshots = await portfolioService.getSnapshots();
        return NextResponse.json(snapshots);
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
