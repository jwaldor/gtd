export type ItemType = {
  id: string
  text: string
  category?: string
  createdAt?: Date | string
  updatedAt?: Date | string
}

export type CategoryConfig = {
  id: string
  name: string
  color: string
}

export const categories: CategoryConfig[] = [
  { id: "essential-actionable-now", name: "Essential Actionable Now", color: "bg-red-500 hover:bg-red-600" },
  { id: "actionable-now", name: "Actionable Now", color: "bg-green-500 hover:bg-green-600" },
  {
    id: "essential-not-actionable-now",
    name: "Essential Not Actionable Now",
    color: "bg-orange-500 hover:bg-orange-600",
  },
  { id: "not-actionable-now", name: "Not Actionable Now", color: "bg-yellow-500 hover:bg-yellow-600" },
  { id: "future", name: "Future", color: "bg-blue-500 hover:bg-blue-600" },
  { id: "already-done", name: "Already Done", color: "bg-gray-500 hover:bg-gray-600" },
]

export const getCategoryById = (categoryId: string): CategoryConfig | undefined => {
  return categories.find(cat => cat.id === categoryId)
}

export const getCategoryBadge = (categoryId?: string) => {
  if (!categoryId) return null
  const category = getCategoryById(categoryId)
  return category || { id: categoryId, name: categoryId, color: "bg-gray-400" }
}
