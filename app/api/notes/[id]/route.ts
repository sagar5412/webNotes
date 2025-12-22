// app/api/notes/[id]/route.ts

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/notes/[id] - Get a single note
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { id } = await params;

  try {
    const note = await prisma.note.findFirst({
      where: { id, userId },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error in GET /api/notes/[id]:", error);
    return NextResponse.json(
      { error: "Failed to fetch note" },
      { status: 500 }
    );
  }
}

// PUT /api/notes/[id] - Update a note
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { id } = await params;

  const body = await request.json();
  const { title, content, htmlContent, textContent } = body;

  // Support both direct title/content and htmlContent/textContent formats
  const finalTitle =
    title ?? (textContent?.split("\n")[0]?.trim() || "New Note").slice(0, 200);
  const finalContent = content ?? htmlContent ?? "";

  try {
    const result = await prisma.note.updateMany({
      where: { id, userId }, // Ensures ownership
      data: {
        title: finalTitle,
        content: finalContent,
        updatedAt: new Date(),
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Note not found or access denied" },
        { status: 404 }
      );
    }

    const note = await prisma.note.findUnique({ where: { id } });
    return NextResponse.json(note);
  } catch (error) {
    console.error("Error in PUT /api/notes/[id]:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}

// DELETE /api/notes/[id] - Delete a note
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { id } = await params;

  try {
    const result = await prisma.note.deleteMany({
      where: { id, userId }, // Ensures user owns the note
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Note not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/notes/[id]:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
