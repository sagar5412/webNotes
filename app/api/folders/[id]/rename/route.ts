// app/api/folders/[id]/rename/route.ts

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PATCH /api/folders/[id]/rename - Rename a folder
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { id: folderId } = await params;

  const { newName } = await request.json();
  if (!newName || typeof newName !== "string") {
    return NextResponse.json(
      { error: "Invalid name provided" },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.folder.updateMany({
      where: { id: folderId, userId },
      data: { name: newName },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Folder not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Folder renamed successfully" });
  } catch (error) {
    console.error("Rename folder error:", error);
    return NextResponse.json(
      { error: "Failed to rename folder" },
      { status: 500 }
    );
  }
}
