import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema for the request body
const createItemSchema = z.object({
  text: z.string().min(1, "Text is required"),
  category: z.string().min(1, "Category is required"),
});

const updateItemSchema = z.object({
  id: z.string().min(1, "ID is required"),
  text: z.string().min(1, "Text is required").optional(),
  category: z.string().min(1, "Category is required").optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validatedData = createItemSchema.parse(body);

    // Save the item to the database
    const item = await prisma.item.create({
      data: {
        text: validatedData.text,
        category: validatedData.category,
      },
    });

    return NextResponse.json(
      {
        success: true,
        item: {
          id: item.id,
          text: item.text,
          category: item.category,
          createdAt: item.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving item:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to save item",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validatedData = updateItemSchema.parse(body);

    // Update the item in the database
    const item = await prisma.item.update({
      where: { id: validatedData.id },
      data: {
        ...(validatedData.text && { text: validatedData.text }),
        ...(validatedData.category && { category: validatedData.category }),
      },
    });

    return NextResponse.json(
      {
        success: true,
        item: {
          id: item.id,
          text: item.text,
          category: item.category,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating item:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update item",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Item ID is required",
        },
        { status: 400 }
      );
    }

    // Delete the item from the database
    await prisma.item.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Item deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting item:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete item",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const items = await prisma.item.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (error) {
    console.error("Error fetching items:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch items",
      },
      { status: 500 }
    );
  }
}
