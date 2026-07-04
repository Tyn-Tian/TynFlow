import { authService } from "@/services/auth-service";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const data = await authService.googleLogin();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 400 });
    }
}
