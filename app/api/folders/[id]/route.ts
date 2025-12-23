// app/api/folders/[id]/route.ts

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/folders/[id] - Get a single folder with its notes
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { id: folderId } = await params;

  try {
    const folder = await prisma.folder.findFirst({
      where: { id: folderId, userId },
      include: { notes: true },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json({ folder });
  } catch (error) {
    console.error("Get folder error:", error);
    return NextResponse.json(
      { error: "Failed to fetch folder" },
      { status: 500 }
    );
  }
}

// PUT /api/folders/[id] - Update a folder
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { id: folderId } = await params;

  const body = await request.json();
  const { name } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json(
      { error: "Folder name is required" },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.folder.updateMany({
      where: { id: folderId, userId },
      data: { name },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Folder not found or access denied" },
        { status: 404 }
      );
    }

    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
    });

    return NextResponse.json({ folder });
  } catch (error) {
    console.error("Update folder error:", error);
    return NextResponse.json(
      { error: "Failed to update folder" },
      { status: 500 }
    );
  }
}

// DELETE /api/folders/[id] - Delete a folder
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { id: folderId } = await params;

  try {
    const result = await prisma.folder.deleteMany({
      where: { id: folderId, userId },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Folder not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Folder deleted successfully" });
  } catch (error) {
    console.error("Delete folder error:", error);
    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 }
    );
  }
}
