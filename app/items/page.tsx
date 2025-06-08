"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Trash2, Calendar, ArrowUpDown, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ItemType, categories, getCategoryById } from "@/lib/types"

type SortOption = "date-desc" | "date-asc" | "category" | "text"

export default function ItemsPage() {
  const [items, setItems] = useState<ItemType[]>([])
  const [filteredItems, setFilteredItems] = useState<ItemType[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<SortOption>("date-desc")
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const { toast } = useToast()

  // Load items from database
  useEffect(() => {
    const loadItems = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/items')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.items) {
            setItems(result.items)
          }
        } else {
          throw new Error('Failed to fetch items')
        }
      } catch (error) {
        console.error('Error loading items:', error)
        toast({
          title: "Error",
          description: "Failed to load items. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadItems()
  }, [toast])

  // Filter and sort items
  useEffect(() => {
    let filtered = items

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        case "date-asc":
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
        case "category":
          const catA = a.category || "zzz"
          const catB = b.category || "zzz"
          return catA.localeCompare(catB)
        case "text":
          return a.text.localeCompare(b.text)
        default:
          return 0
      }
    })

    setFilteredItems(filtered)
  }, [items, searchQuery, selectedCategory, sortBy])

  // Update item category
  const updateItemCategory = async (itemId: string, newCategory: string) => {
    try {
      setIsUpdating(itemId)
      const response = await fetch('/api/items', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: itemId,
          category: newCategory,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update item')
      }

      const result = await response.json()
      
      if (result.success) {
        // Update local state
        setItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, category: newCategory } : item
        ))
        
        toast({
          title: "Category updated",
          description: "Item category has been successfully updated.",
        })
      } else {
        throw new Error(result.error || 'Failed to update item')
      }
    } catch (error) {
      console.error('Error updating item category:', error)
      toast({
        title: "Error",
        description: "Failed to update item category. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(null)
    }
  }

  // Delete item
  const deleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return
    }

    try {
      const response = await fetch(`/api/items?id=${itemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete item')
      }

      const result = await response.json()
      
      if (result.success) {
        // Update local state
        setItems(prev => prev.filter(item => item.id !== itemId))
        
        toast({
          title: "Item deleted",
          description: "Item has been successfully deleted.",
        })
      } else {
        throw new Error(result.error || 'Failed to delete item')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Get category badge
  const getCategoryBadge = (categoryId?: string) => {
    if (!categoryId) return <Badge variant="outline">Uncategorized</Badge>

    const category = getCategoryById(categoryId)
    if (!category) return <Badge variant="outline">{categoryId}</Badge>

    return <Badge className={category.color}>{category.name}</Badge>
  }

  // Format date
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "Unknown"
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-6xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading items...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Items Management</h1>
        <div className="text-sm text-muted-foreground">
          {filteredItems.length} of {items.length} items
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="text">Text (A-Z)</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
                setSortBy("date-desc")
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Text</TableHead>
                <TableHead className="w-[200px]">Category</TableHead>
                <TableHead className="w-[180px]">Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    {items.length === 0 ? "No items found. Start by capturing some items!" : "No items match your filters."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-md">
                      <div className="truncate" title={item.text}>
                        {item.text}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getCategoryBadge(item.category)}
                        <Select
                          value={item.category || ""}
                          onValueChange={(value) => updateItemCategory(item.id, value)}
                          disabled={isUpdating === item.id}
                        >
                          <SelectTrigger className="w-[140px] h-8">
                            <SelectValue placeholder="Change" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isUpdating === item.id && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteItem(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
