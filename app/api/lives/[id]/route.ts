import { liveService } from "@/services/live-service";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const live = await liveService.getById(id);
        return NextResponse.json(live);
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
        await liveService.edit(id, body);
        return NextResponse.json({ message: "Live updated successfully" });
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
        await liveService.delete(id);
        return NextResponse.json({ message: "Live deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
