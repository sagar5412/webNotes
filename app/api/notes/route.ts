// app/api/notes/route.ts

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/notes - List all notes for current user
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json([]);
  }
  const userId = session.user.id;

  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get("folderId");

  try {
    const notes = await prisma.note.findMany({
      where: {
        userId: userId,
        // Filter by folder if specified
        ...(folderId && { folderId: folderId === "null" ? null : folderId }),
      },
      orderBy: [
        { isPinned: "desc" },
        { pinnedAt: "desc" },
        { updatedAt: "desc" },
      ],
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error in GET /api/notes:", error);
    return NextResponse.json(
      { message: "Error fetching notes", error },
      { status: 500 }
    );
  }
}

// POST /api/notes - Create a new note
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await request.json().catch(() => ({}));
  const folderId = body.folderId || null;
  const title = body.title || "New Note";
  const content = body.content || "";

  try {
    const newNote = await prisma.note.create({
      data: {
        title: title,
        content: content,
        userId: userId,
        folderId: folderId,
        isPinned: false,
      },
    });
    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/notes:", error);
    return NextResponse.json(
      { message: "Error creating note", error },
      { status: 500 }
    );
  }
}
