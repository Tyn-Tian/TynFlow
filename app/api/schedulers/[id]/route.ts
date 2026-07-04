import { schedulerService } from "@/services/scheduler-service";
import { NextResponse } from "next/server";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        await schedulerService.update(id, body);
        return NextResponse.json({ message: "Scheduler updated successfully" });
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
        await schedulerService.delete(id);
        return NextResponse.json({ message: "Scheduler deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
