import { wishlistService } from "@/services/wishlist-service";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const wishlists = await wishlistService.getAll();
        return NextResponse.json(wishlists);
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