"use client"

import { useState, useEffect, useRef, useCallback, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ItemType, categories } from "@/lib/types"

export default function GTDCaptureApp() {

  const [inputText, setInputText] = useState("")
  const [items, setItems] = useState<ItemType[]>([])
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const tableRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Note: Processed items are now managed on the /items page
  // This page focuses only on capturing and processing new items

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
  const processItem = useCallback(async (categoryId: string) => {
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
        // Remove from items (no longer tracking processed items locally)
        const newItems = items.filter((_, index) => index !== selectedItemIndex)
        setItems(newItems)

        // Update selected index
        if (newItems.length > 0) {
          setSelectedItemIndex(Math.min(selectedItemIndex, newItems.length - 1))
        } else {
          setSelectedItemIndex(null)
        }

        toast({
          title: "Item saved",
          description: "Item has been successfully classified and saved. View all items on the Items page.",
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
  }, [selectedItemIndex, items, isProcessing, toast])

  // Category changes are now handled on the /items page

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
  }, [selectedItemIndex, items, processItem])

  // Processed items functionality moved to /items page

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

        {/* Processed items are now managed on the /items page */}
      </div>
    </div>
  )
}
