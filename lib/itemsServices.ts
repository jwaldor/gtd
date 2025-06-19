import { tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Tool for creating a new item
export const createItemTool = tool({
  description: 'Create a new GTD item with text and category',
  parameters: z.object({
    text: z.string().min(1, "Text is required").describe("The text content of the item"),
    category: z.string().min(1, "Category is required").describe("The category for organizing the item"),
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
  description: 'Update an existing GTD item by ID',
  parameters: z.object({
    id: z.string().min(1, "ID is required").describe("The unique identifier of the item to update"),
    text: z.string().min(1, "Text is required").optional().describe("The new text content of the item"),
    category: z.string().min(1, "Category is required").optional().describe("The new category for the item"),
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
  description: 'Delete a GTD item by ID',
  parameters: z.object({
    id: z.string().min(1, "ID is required").describe("The unique identifier of the item to delete"),
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

// Tool for getting all items
export const getItemsTool = tool({
  description: 'Retrieve all GTD items ordered by creation date (newest first)',
  parameters: z.object({}), // No parameters needed for getting all items
  execute: async () => {
    try {
      const items = await prisma.item.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

      return {
        success: true,
        items,
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
