import { authService } from "@/services/auth-service";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const range = await authService.getRangeDate();
        return NextResponse.json(range);
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 400 });
    }
}
