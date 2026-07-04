import { portfolioService } from "@/services/portfolio-service";
import { NextResponse } from "next/server";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        await portfolioService.edit(id, body);
        return NextResponse.json({ message: "Portfolio updated successfully" });
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
        await portfolioService.delete(id);
        return NextResponse.json({ message: "Portfolio deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
