import { authService } from "@/services/auth-service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { email } = await request.json();
        await authService.forgotPassword(email);
        return NextResponse.json({ message: "Password reset email sent" });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 400 });
    }
}
