import { schedulerService } from "@/services/scheduler-service";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const schedulers = await schedulerService.getAll();
        return NextResponse.json(schedulers);
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        await schedulerService.add(body);
        return NextResponse.json({ message: "Scheduler created successfully" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
