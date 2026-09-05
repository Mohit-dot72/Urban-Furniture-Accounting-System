import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.budget.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Failed to delete budget:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, accountName, analyticAccount, startDate, endDate, plannedAmount } = await req.json();
    const budget = await prisma.budget.update({
      where: { id },
      data: {
        name,
        accountName,
        analyticAccount: analyticAccount || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        plannedAmount: Number(plannedAmount),
      },
    });
    return NextResponse.json(budget);
  } catch (error) {
    console.error("Failed to update budget:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
