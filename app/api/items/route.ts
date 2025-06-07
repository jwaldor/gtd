import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for the request body
const createItemSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  category: z.string().min(1, 'Category is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = createItemSchema.parse(body)
    
    // Save the item to the database
    const item = await prisma.item.create({
      data: {
        text: validatedData.text,
        category: validatedData.category,
      },
    })
    
    return NextResponse.json(
      { 
        success: true, 
        item: {
          id: item.id,
          text: item.text,
          category: item.category,
          createdAt: item.createdAt,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error saving item:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation error', 
          details: error.errors 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save item' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const items = await prisma.item.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    return NextResponse.json({
      success: true,
      items,
    })
  } catch (error) {
    console.error('Error fetching items:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch items' 
      },
      { status: 500 }
    )
  }
}
