import { portfolioService } from "@/services/portfolio-service";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const portfolios = await portfolioService.getAll();
        return NextResponse.json(portfolios);
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        await portfolioService.add(body);
        return NextResponse.json({ message: "Portfolio created successfully" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
