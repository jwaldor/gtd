"use client"

import { useState, useEffect, useRef, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, ArrowUpDown, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ItemType, categories, getCategoryById } from "@/lib/types"

export default function GTDCaptureApp() {

  const [inputText, setInputText] = useState("")
  const [items, setItems] = useState<ItemType[]>([])
  const [processedItems, setProcessedItems] = useState<ItemType[]>([])
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null)
  const [sortByCategory, setSortByCategory] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const tableRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Load existing processed items from database
  useEffect(() => {
    const loadProcessedItems = async () => {
      try {
        const response = await fetch('/api/items')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.items) {
            // Convert database items to our ItemType format
            const dbItems = result.items.map((item: any) => ({
              id: item.id,
              text: item.text,
              category: item.category,
            }))
            setProcessedItems(dbItems)
          }
        }
      } catch (error) {
        console.error('Error loading processed items:', error)
      }
    }

    loadProcessedItems()
  }, [])

  // Store items from the textarea
  const handleStore = () => {
    if (!inputText.trim()) return

    const newItems: ItemType[] = []

    // Extract chunks between CHUNKSTART and CHUNKEND as single items
    const chunkRegex = /CHUNKSTART([\s\S]*?)CHUNKEND/g
    let match
    let processedText = inputText

    while ((match = chunkRegex.exec(inputText)) !== null) {
      const chunkContent = match[1].trim()

      // Add the entire chunk content as a single item
      if (chunkContent) {
        newItems.push({
          id: crypto.randomUUID(),
          text: chunkContent,
        })
      }

      // Remove the processed chunk from the text
      processedText = processedText.replace(match[0], "")
    }

    // Process remaining text by newlines
    processedText
      .split("\n")
      .filter((text) => text.trim())
      .forEach((text) => {
        newItems.push({
          id: crypto.randomUUID(),
          text: text.trim(),
        })
      })

    setItems((prev) => [...prev, ...newItems])
    setInputText("")

    // Select the first item if nothing is selected
    if (selectedItemIndex === null && (items.length > 0 || newItems.length > 0)) {
      setSelectedItemIndex(0)
    }
  }

  // Process an item based on the category
  const processItem = async (categoryId: string) => {
    if (selectedItemIndex === null || items.length === 0 || isProcessing) return

    const itemToProcess = items[selectedItemIndex]
    setIsProcessing(true)

    try {
      // Save to database
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: itemToProcess.text,
          category: categoryId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save item')
      }

      const result = await response.json()

      if (result.success) {
        const processedItem = { ...itemToProcess, category: categoryId }

        // Remove from items and add to processed items
        const newItems = items.filter((_, index) => index !== selectedItemIndex)
        setItems(newItems)
        setProcessedItems((prev) => [processedItem, ...prev])

        // Update selected index
        if (newItems.length > 0) {
          setSelectedItemIndex(Math.min(selectedItemIndex, newItems.length - 1))
        } else {
          setSelectedItemIndex(null)
        }

        toast({
          title: "Item saved",
          description: "Item has been successfully classified and saved to the database.",
        })
      } else {
        throw new Error(result.error || 'Failed to save item')
      }
    } catch (error) {
      console.error('Error saving item:', error)
      toast({
        title: "Error",
        description: "Failed to save item to database. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Change category of a processed item
  const changeItemCategory = async (itemId: string, newCategoryId: string) => {
    const item = processedItems.find(item => item.id === itemId)
    if (!item) return

    try {
      // Update in database
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: item.text,
          category: newCategoryId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update item')
      }

      const result = await response.json()

      if (result.success) {
        // Update local state
        setProcessedItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, category: newCategoryId } : item)))

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
    }
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent) => {
    if (selectedItemIndex === null) return

    // Check if the key is a number between 1 and the number of categories
    const keyNum = Number.parseInt(e.key)
    if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= categories.length) {
      // Prevent the global handler from also processing this event
      e.preventDefault()
      e.stopPropagation()

      // Process the item with the category at index keyNum - 1
      processItem(categories[keyNum - 1].id)
    }
  }

  // Set up keyboard event listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      // Only process keyboard shortcuts if not typing in the textarea
      // AND only if the event hasn't been handled by the table's own handler
      if (document.activeElement?.tagName !== "TEXTAREA" && !e.defaultPrevented) {
        const keyNum = Number.parseInt(e.key)
        if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= categories.length) {
          e.preventDefault()

          // Use a setTimeout to ensure we're not processing the same keypress twice
          setTimeout(() => {
            if (selectedItemIndex !== null && items.length > 0) {
              processItem(categories[keyNum - 1].id)
            }
          }, 0)
        }
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown)
    return () => window.removeEventListener("keydown", handleGlobalKeyDown)
  }, [selectedItemIndex, items, categories])

  // Get category badge
  const getCategoryBadge = (categoryId?: string) => {
    if (!categoryId) return null

    const category = getCategoryById(categoryId)
    if (!category) return <Badge>{categoryId}</Badge>

    return <Badge className={category.color}>{category.name}</Badge>
  }

  // Get sorted processed items
  const getSortedProcessedItems = () => {
    if (!sortByCategory) return processedItems

    // Create a copy to avoid mutating the original array
    return [...processedItems].sort((a, b) => {
      const catA = a.category || "uncategorized"
      const catB = b.category || "uncategorized"

      // Find the indices of the categories in the categories array
      const indexA = categories.findIndex((cat) => cat.id === catA)
      const indexB = categories.findIndex((cat) => cat.id === catB)

      // If both categories are found in the array, sort by their position
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB
      }

      // If only one category is found, prioritize it
      if (indexA !== -1) return -1
      if (indexB !== -1) return 1

      // If neither is found, sort alphabetically
      return catA.localeCompare(catB)
    })
  }

  // Download processed items as a text file organized by category
  const downloadProcessedItems = () => {
    if (processedItems.length === 0) return

    // Organize items by category
    const categorizedItems: Record<string, string[]> = {}

    // Initialize categories
    categories.forEach((cat) => {
      categorizedItems[cat.id] = []
    })
    categorizedItems["uncategorized"] = []

    processedItems.forEach((item) => {
      const category = item.category || "uncategorized"
      if (!categorizedItems[category]) {
        categorizedItems[category] = []
      }
      categorizedItems[category].push(item.text)
    })

    // Create text content
    let textContent = "GTD Processed Items\n\n"

    Object.entries(categorizedItems).forEach(([categoryId, items]) => {
      if (items.length > 0) {
        const category = categories.find((cat) => cat.id === categoryId)
        const categoryName = category
          ? category.name
          : categoryId
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")

        textContent += `== ${categoryName} ==\n`
        items.forEach((item) => {
          textContent += `- ${item}\n`
        })
        textContent += "\n"
      }
    })

    // Create and download the file
    const blob = new Blob([textContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "gtd-processed-items.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">GTD Capture Processing</h1>

      <div className="grid gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Capture Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Textarea
                placeholder="Enter items separated by new lines..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={5}
                className="resize-none"
              />
              <Button onClick={handleStore}>Store Items</Button>
            </div>
          </CardContent>
        </Card>

        {/* Processing Section */}
        <Card>
          <CardHeader>
            <CardTitle>Process Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex flex-wrap gap-2 mb-2">
                {categories.map((category, index) => (
                  <Badge key={category.id} variant="outline" className="text-sm">
                    Press {index + 1}: {category.name}
                  </Badge>
                ))}
                {isProcessing && (
                  <Badge variant="outline" className="text-sm bg-blue-50">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Saving...
                  </Badge>
                )}
              </div>

              <div ref={tableRef} className="border rounded-md" onKeyDown={handleKeyDown} tabIndex={0}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Items to Process ({items.length})</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell className="text-center text-muted-foreground py-4">No items to process</TableCell>
                      </TableRow>
                    ) : (
                      items.map((item, index) => (
                        <TableRow
                          key={item.id}
                          className={selectedItemIndex === index ? "bg-muted" : ""}
                          onClick={() => setSelectedItemIndex(index)}
                        >
                          <TableCell className="py-3">
                            {selectedItemIndex === index && (
                              <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2"></span>
                            )}
                            {item.text}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Processed Items Section */}
        {processedItems.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Processed Items</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortByCategory(!sortByCategory)}
                  className="flex items-center gap-1"
                >
                  <ArrowUpDown size={16} />
                  {sortByCategory ? "Unsort" : "Sort by Category"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadProcessedItems}
                  className="flex items-center gap-1"
                >
                  <Download size={16} />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="w-[250px]">Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getSortedProcessedItems().map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.text}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getCategoryBadge(item.category)}
                          <Select
                            value={item.category || ""}
                            onValueChange={(value) => changeItemCategory(item.id, value)}
                          >
                            <SelectTrigger className="w-[180px] h-8">
                              <SelectValue placeholder="Change category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
