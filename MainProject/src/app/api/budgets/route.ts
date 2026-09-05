import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const budgets = await prisma.budget.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(budgets);
  } catch (error) {
    console.error("Failed to fetch budgets:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, accountName, analyticAccount, startDate, endDate, plannedAmount } = await req.json();

    if (!name || !accountName || !startDate || !endDate || plannedAmount === undefined) {
      return NextResponse.json({ message: "Required fields missing" }, { status: 400 });
    }

    const budget = await prisma.budget.create({
      data: {
        name,
        accountName,
        analyticAccount: analyticAccount || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        plannedAmount: Number(plannedAmount),
      },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error("Failed to create budget:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
