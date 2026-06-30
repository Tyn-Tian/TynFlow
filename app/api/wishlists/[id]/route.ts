import { wishlistService } from "@/services/wishlist-service";
import { NextResponse } from "next/server";

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = (await params).id;
        const body = await req.json();
        const wishlist = await wishlistService.update(id, body);
        return NextResponse.json(wishlist);
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = (await params).id;
        const wishlist = await wishlistService.delete(id);
        return NextResponse.json(wishlist);
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
