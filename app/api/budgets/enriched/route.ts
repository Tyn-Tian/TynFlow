import { budgetService } from "@/services/budget-service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        
        if (!startDate || !endDate) {
            return NextResponse.json({ error: "Missing startDate or endDate" }, { status: 400 });
        }

        const budgets = await budgetService.getBudgets(startDate, endDate);
        return NextResponse.json(budgets);
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
