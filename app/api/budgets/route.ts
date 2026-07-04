import { budgetService } from "@/services/budget-service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const includeDeleted = searchParams.get("includeDeleted") === "true";
        const budgets = await budgetService.getAll(includeDeleted);
        return NextResponse.json(budgets);
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        await budgetService.add(body);
        return NextResponse.json({ message: "Budget created successfully" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
