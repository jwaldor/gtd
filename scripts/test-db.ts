import { prisma } from '../lib/prisma'

async function testDatabase() {
  try {
    console.log('Testing database connection...')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Test creating an item
    const testItem = await prisma.item.create({
      data: {
        text: 'Test item from script',
        category: 'actionable-now',
      },
    })
    console.log('✅ Test item created:', testItem)
    
    // Test fetching items
    const items = await prisma.item.findMany()
    console.log('✅ Items in database:', items.length)
    
    // Clean up test item
    await prisma.item.delete({
      where: { id: testItem.id },
    })
    console.log('✅ Test item cleaned up')
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
  } finally {
    await prisma.$disconnect()
    console.log('Database disconnected')
  }
}

testDatabase()
