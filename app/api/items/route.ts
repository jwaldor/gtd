import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createItemTool,
  updateItemTool,
  deleteItemTool,
  getItemsTool,
} from "@/lib/itemsServices";

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

    // Use the createItemTool to save the item
    const result = await createItemTool.execute(
      {
        text: validatedData.text,
        category: validatedData.category,
      },
      {
        toolCallId: "manual-call",
        messages: [],
      }
    );

    return NextResponse.json(result, { status: 201 });
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

    // Use the updateItemTool to update the item
    const result = await updateItemTool.execute(
      {
        id: validatedData.id,
        text: validatedData.text,
        category: validatedData.category,
      },
      {
        toolCallId: "manual-call",
        messages: [],
      }
    );

    return NextResponse.json(result, { status: 200 });
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

    // Use the deleteItemTool to delete the item
    const result = await deleteItemTool.execute(
      { id },
      {
        toolCallId: "manual-call",
        messages: [],
      }
    );

    return NextResponse.json(result, { status: 200 });
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
    // Use the getItemsTool to fetch all items
    const result = await getItemsTool.execute(
      {},
      {
        toolCallId: "manual-call",
        messages: [],
      }
    );

    return NextResponse.json(result);
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
