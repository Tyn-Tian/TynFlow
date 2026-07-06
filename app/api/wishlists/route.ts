import { wishlistService } from "@/services/wishlist-service";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const result = await wishlistService.getAll(page, limit);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const wishlist = await wishlistService.add(body);
        return NextResponse.json(wishlist);
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}