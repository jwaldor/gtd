import { prisma } from '../lib/prisma'

const sampleItems = [
  {
    text: "Review quarterly budget and prepare financial report for board meeting",
    category: "essential-actionable-now"
  },
  {
    text: "Call dentist to schedule annual cleaning appointment",
    category: "actionable-now"
  },
  {
    text: "Research vacation destinations for summer trip",
    category: "future"
  },
  {
    text: "Update LinkedIn profile with recent accomplishments",
    category: "not-actionable-now"
  },
  {
    text: "Prepare presentation slides for client meeting next week",
    category: "essential-actionable-now"
  },
  {
    text: "Read the new project management book that arrived",
    category: "essential-not-actionable-now"
  },
  {
    text: "Organize digital photos from last year",
    category: "future"
  },
  {
    text: "Submit expense report for last month's business trip",
    category: "actionable-now"
  },
  {
    text: "Clean out garage and donate unused items",
    category: "future"
  },
  {
    text: "Completed tax filing for this year",
    category: "already-done"
  }
]

async function seedData() {
  try {
    console.log('🌱 Seeding sample data...')
    
    // Clear existing items (optional)
    // await prisma.item.deleteMany()
    // console.log('Cleared existing items')
    
    // Add sample items
    for (const item of sampleItems) {
      await prisma.item.create({
        data: item
      })
      console.log(`✅ Added: ${item.text.substring(0, 50)}...`)
    }
    
    console.log(`🎉 Successfully seeded ${sampleItems.length} items!`)
    
  } catch (error) {
    console.error('❌ Error seeding data:', error)
  } finally {
    await prisma.$disconnect()
    console.log('Database disconnected')
  }
}

seedData()
