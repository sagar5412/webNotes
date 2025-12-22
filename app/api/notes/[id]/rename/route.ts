// app/api/notes/[id]/rename/route.ts

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PATCH /api/notes/[id]/rename - Rename a note
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { id: noteId } = await params;

  const { newName } = await request.json();
  if (!newName || typeof newName !== "string") {
    return NextResponse.json(
      { error: "Invalid name provided" },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.note.updateMany({
      where: { id: noteId, userId },
      data: { title: newName },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Note not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Note renamed successfully" });
  } catch (error) {
    console.error("Rename note error:", error);
    return NextResponse.json(
      { error: "Failed to rename note" },
      { status: 500 }
    );
  }
}
