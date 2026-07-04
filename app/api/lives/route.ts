import { liveService } from "@/services/live-service";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const lives = await liveService.getAll();
        return NextResponse.json(lives);
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        await liveService.add(body);
        return NextResponse.json({ message: "Live created successfully" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
