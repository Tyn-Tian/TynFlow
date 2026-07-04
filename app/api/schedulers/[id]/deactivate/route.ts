import { schedulerService } from "@/services/scheduler-service";
import { NextResponse } from "next/server";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await schedulerService.deactivate(id);
        return NextResponse.json({ message: "Scheduler deactivated successfully" });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
