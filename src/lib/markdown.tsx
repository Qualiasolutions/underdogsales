/**
 * Simple Markdown Renderer
 * Converts basic markdown to React elements without external dependencies
 *
 * Supports: **bold**, *italic*, `code`, numbered lists, bullet points
 */

import React from 'react'

interface MarkdownProps {
  content: string
  className?: string
}

/**
 * Parse inline markdown (bold, italic, code)
 */
function parseInline(text: string): React.ReactNode[] {
  const elements: React.ReactNode[] = []
  let remaining = text
  let key = 0

  // Pattern order matters - check bold before italic
  const patterns: Array<{
    regex: RegExp
    render: (match: string) => React.ReactNode
  }> = [
    // Bold: **text** or __text__
    {
      regex: /\*\*(.+?)\*\*|__(.+?)__/,
      render: (match) => <strong key={key++} className="font-semibold">{match}</strong>,
    },
    // Italic: *text* or _text_
    {
      regex: /\*(.+?)\*|_(.+?)_/,
      render: (match) => <em key={key++}>{match}</em>,
    },
    // Code: `text`
    {
      regex: /`(.+?)`/,
      render: (match) => (
        <code key={key++} className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono">
          {match}
        </code>
      ),
    },
  ]

  while (remaining.length > 0) {
    let earliestMatch: { index: number; length: number; content: string; render: (match: string) => React.ReactNode } | null = null

    for (const pattern of patterns) {
      const match = remaining.match(pattern.regex)
      if (match && match.index !== undefined) {
        if (!earliestMatch || match.index < earliestMatch.index) {
          earliestMatch = {
            index: match.index,
            length: match[0].length,
            content: match[1] || match[2], // Capture group
            render: pattern.render,
          }
        }
      }
    }

    if (earliestMatch) {
      // Add text before the match
      if (earliestMatch.index > 0) {
        elements.push(remaining.slice(0, earliestMatch.index))
      }
      // Add the formatted element
      elements.push(earliestMatch.render(earliestMatch.content))
      // Continue with remaining text
      remaining = remaining.slice(earliestMatch.index + earliestMatch.length)
    } else {
      // No more matches, add remaining text
      elements.push(remaining)
      break
    }
  }

  return elements
}

/**
 * Parse a block of text into structured elements
 */
function parseBlock(text: string): React.ReactNode[] {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let listItems: string[] = []
  let listType: 'ordered' | 'unordered' | null = null
  let key = 0

  const flushList = () => {
    if (listItems.length === 0) return

    if (listType === 'ordered') {
      elements.push(
        <ol key={key++} className="list-decimal list-inside space-y-1 my-2">
          {listItems.map((item, i) => (
            <li key={i}>{parseInline(item)}</li>
          ))}
        </ol>
      )
    } else {
      elements.push(
        <ul key={key++} className="list-disc list-inside space-y-1 my-2">
          {listItems.map((item, i) => (
            <li key={i}>{parseInline(item)}</li>
          ))}
        </ul>
      )
    }
    listItems = []
    listType = null
  }

  for (const line of lines) {
    // Check for numbered list: "1. ", "2. ", etc.
    const orderedMatch = line.match(/^\d+\.\s+(.+)/)
    if (orderedMatch) {
      if (listType !== 'ordered') {
        flushList()
        listType = 'ordered'
      }
      listItems.push(orderedMatch[1])
      continue
    }

    // Check for bullet list: "- " or "• " or "* " (at start of line)
    const unorderedMatch = line.match(/^[-•*]\s+(.+)/)
    if (unorderedMatch) {
      if (listType !== 'unordered') {
        flushList()
        listType = 'unordered'
      }
      listItems.push(unorderedMatch[1])
      continue
    }

    // Not a list item - flush any pending list
    flushList()

    // Handle empty lines as paragraph breaks
    if (line.trim() === '') {
      elements.push(<br key={key++} />)
      continue
    }

    // Regular text paragraph
    elements.push(
      <span key={key++} className="block">
        {parseInline(line)}
      </span>
    )
  }

  // Flush any remaining list items
  flushList()

  return elements
}

/**
 * Render markdown content as React elements
 */
export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={className}>
      {parseBlock(content)}
    </div>
  )
}
