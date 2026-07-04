import { authService } from "@/services/auth-service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = await authService.login(body);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 400 });
    }
}
