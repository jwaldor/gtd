import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Tool for creating a new item
export const createItemTool = tool({
  description: "Create a new GTD item with text and category",
  parameters: z.object({
    text: z
      .string()
      .min(1, "Text is required")
      .describe("The text content of the item"),
    category: z
      .string()
      .min(1, "Category is required")
      .describe("The category for organizing the item"),
  }),
  execute: async ({ text, category }) => {
    try {
      const item = await prisma.item.create({
        data: {
          text,
          category,
        },
      });

      return {
        success: true,
        item: {
          id: item.id,
          text: item.text,
          category: item.category,
          createdAt: item.createdAt,
        },
      };
    } catch (error) {
      console.error("Error creating item:", error);
      throw new Error("Failed to create item");
    }
  },
});

// Tool for updating an existing item
export const updateItemTool = tool({
  description: "Update an existing GTD item by ID",
  parameters: z.object({
    id: z
      .string()
      .min(1, "ID is required")
      .describe("The unique identifier of the item to update"),
    text: z
      .string()
      .min(1, "Text is required")
      .optional()
      .describe("The new text content of the item"),
    category: z
      .string()
      .min(1, "Category is required")
      .optional()
      .describe("The new category for the item"),
  }),
  execute: async ({ id, text, category }) => {
    try {
      const item = await prisma.item.update({
        where: { id },
        data: {
          ...(text && { text }),
          ...(category && { category }),
        },
      });

      return {
        success: true,
        item: {
          id: item.id,
          text: item.text,
          category: item.category,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        },
      };
    } catch (error) {
      console.error("Error updating item:", error);
      throw new Error("Failed to update item");
    }
  },
});

// Tool for deleting an item
export const deleteItemTool = tool({
  description: "Delete a GTD item by ID",
  parameters: z.object({
    id: z
      .string()
      .min(1, "ID is required")
      .describe("The unique identifier of the item to delete"),
  }),
  execute: async ({ id }) => {
    try {
      await prisma.item.delete({
        where: { id },
      });

      return {
        success: true,
        message: "Item deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting item:", error);
      throw new Error("Failed to delete item");
    }
  },
});

// Tool for getting items with filtering and sorting
export const getItemsTool = tool({
  description:
    "Retrieve GTD items with optional filtering, searching, and sorting",
  parameters: z.object({
    search: z
      .string()
      .optional()
      .describe("Search term to filter items by text content"),
    category: z
      .string()
      .optional()
      .describe("Category ID to filter items by category"),
    sortBy: z
      .enum(["date-desc", "date-asc", "category", "text"])
      .optional()
      .default("date-desc")
      .describe("Sort order for the items"),
    limit: z
      .number()
      .int()
      .positive()
      .optional()
      .describe("Maximum number of items to return"),
    offset: z
      .number()
      .int()
      .min(0)
      .optional()
      .default(0)
      .describe("Number of items to skip for pagination"),
  }),
  execute: async ({
    search,
    category,
    sortBy = "date-desc",
    limit,
    offset = 0,
  }) => {
    try {
      // Build where clause for filtering
      const where: any = {};

      if (search) {
        where.text = {
          contains: search,
          mode: "insensitive",
        };
      }

      if (category) {
        where.category = category;
      }

      // Build orderBy clause for sorting
      let orderBy: any;
      switch (sortBy) {
        case "date-desc":
          orderBy = { createdAt: "desc" };
          break;
        case "date-asc":
          orderBy = { createdAt: "asc" };
          break;
        case "category":
          orderBy = { category: "asc" };
          break;
        case "text":
          orderBy = { text: "asc" };
          break;
        default:
          orderBy = { createdAt: "desc" };
      }

      // Get total count for pagination info
      const totalCount = await prisma.item.count({ where });

      // Get filtered and sorted items
      const items = await prisma.item.findMany({
        where,
        orderBy,
        ...(limit && { take: limit }),
        skip: offset,
      });

      return {
        success: true,
        items,
        pagination: {
          total: totalCount,
          offset,
          limit: limit || totalCount,
          hasMore: limit ? offset + limit < totalCount : false,
        },
      };
    } catch (error) {
      console.error("Error fetching items:", error);
      throw new Error("Failed to fetch items");
    }
  },
});

// Export all tools as a collection for easy use
export const itemsTools = {
  createItem: createItemTool,
  updateItem: updateItemTool,
  deleteItem: deleteItemTool,
  getItems: getItemsTool,
};
