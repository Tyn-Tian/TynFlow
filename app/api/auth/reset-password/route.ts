import { authService } from "@/services/auth-service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { password } = await request.json();
        await authService.resetPassword(password);
        return NextResponse.json({ message: "Password reset successfully" });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 400 });
    }
}
