import { authService } from "@/services/auth-service";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        await authService.logout();
        return NextResponse.json({ message: "Logout successful" });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 400 });
    }
}
