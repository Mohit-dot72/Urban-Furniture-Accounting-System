import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const entries = await prisma.journalEntry.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        journal: true,
        lines: {
          include: {
            account: true,
          },
        },
      },
    });
    return NextResponse.json(entries);
  } catch (error) {
    console.error("Failed to fetch journal entries:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { journalId, date, reference, narration, lines } = body;

    if (!journalId || !date) {
      return NextResponse.json({ message: "Journal and date are required" }, { status: 400 });
    }

    if (!lines || !Array.isArray(lines) || lines.length < 2) {
      return NextResponse.json({ message: "At least two journal lines are required" }, { status: 400 });
    }

    const totalDebit = lines.reduce((sum: number, l: any) => sum + (Number(l.debit) || 0), 0);
    const totalCredit = lines.reduce((sum: number, l: any) => sum + (Number(l.credit) || 0), 0);

    if (Math.abs(totalDebit - totalCredit) >= 0.01) {
      return NextResponse.json({ message: "Total debits must equal total credits" }, { status: 400 });
    }

    // Auto-generate entryNo
    const count = await prisma.journalEntry.count();
    const entryNo = `JE/${new Date().getFullYear()}/${String(count + 1).padStart(3, "0")}`;

    const entry = await prisma.journalEntry.create({
      data: {
        entryNo,
        journalId,
        date: new Date(date),
        reference: reference || null,
        narration: narration || null,
        totalDebit,
        totalCredit,
        lines: {
          create: lines.map((l: any) => ({
            accountId: l.accountId,
            description: l.description || null,
            debit: Number(l.debit) || 0,
            credit: Number(l.credit) || 0,
          })),
        },
      },
      include: {
        journal: true,
        lines: {
          include: {
            account: true,
          },
        },
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Failed to create journal entry:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
