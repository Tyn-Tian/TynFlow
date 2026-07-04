import { authService } from "@/services/auth-service";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const profile = await authService.getProfile();
        return NextResponse.json(profile);
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 400 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        await authService.updateProfile(body);
        return NextResponse.json({ message: "Profile updated successfully" });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 400 });
    }
}
