// app/api/notes/[id]/move/route.ts

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PATCH /api/notes/[id]/move - Move note to a folder
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

  // folderId can be string (move to folder) or null (unfile)
  const { folderId } = await request.json();

  try {
    const result = await prisma.note.updateMany({
      where: {
        id: noteId,
        userId: userId,
      },
      data: {
        folderId: folderId,
        updatedAt: new Date(),
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Note not found or access denied" },
        { status: 404 }
      );
    }

    const updatedNote = await prisma.note.findUnique({
      where: { id: noteId },
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("Move note error:", error);
    return NextResponse.json({ error: "Failed to move note" }, { status: 500 });
  }
}
