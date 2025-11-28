'use client'

import { useState, useRef, useEffect } from 'react'
import GenerativeDisplay from '@/components/GenerativeDisplay'

interface SearchResult {
  success: boolean
  query: string
  aiResponse: string
  relevantContent: any[]
  suggestions?: string[]
  isAdminAccess?: boolean
  redirectTo?: string
}

interface SearchHistoryItem {
  query: string
  response: string
  timestamp: number
}

export default function Home() {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load search history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('searchHistory')
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading search history:', e)
      }
    }
  }, [])

  // Clear history when page is refreshed or exited
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem('searchHistory')
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      // Also clear on component unmount
      localStorage.removeItem('searchHistory')
    }
  }, [])

  useEffect(() => {
    // Focus search input on mount
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    // Scroll to results when they appear
    if (searchResults) {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [searchResults])

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!query.trim() || isSearching) return

    const userQuery = query.trim()
    setQuery('')
    setIsSearching(true)

    try {
      const response = await fetch('/api/ai-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: userQuery })
      })

      const data: SearchResult = await response.json()

      // Check if this is admin access first
      if ((data as any).isAdminAccess && (data as any).redirectTo) {
        // Redirect to admin login
        window.location.href = (data as any).redirectTo
        return
      }

      // Handle error responses
      if (!response.ok || (data as any).error) {
        const errorMsg = (data as any).error || `Request failed with status ${response.status}. Please try again.`
        setSearchResults({
          success: false,
          query: userQuery,
          aiResponse: errorMsg,
          relevantContent: []
        })
        return
      }

      // Handle successful responses - REPLACE the previous response
      if (data.success) {
        // Replace the search results (not append)
        setSearchResults(data)
        
        // Add to search history
        const historyItem: SearchHistoryItem = {
          query: userQuery,
          response: data.aiResponse,
          timestamp: Date.now()
        }
        const updatedHistory = [historyItem, ...searchHistory].slice(0, 50) // Keep last 50
        setSearchHistory(updatedHistory)
        localStorage.setItem('searchHistory', JSON.stringify(updatedHistory))
      } else {
        // If not successful but no error field, show generic message
        const errorMsg = 'Search failed. Please try again.'
        setSearchResults({
          success: false,
          query: userQuery,
          aiResponse: errorMsg,
          relevantContent: []
        })
      }
    } catch (error) {
      console.error('Search error:', error)
      const errorMessage = error instanceof Error 
        ? `I'm having trouble processing that right now: ${error.message}. Please try again!`
        : "I'm having trouble processing that right now. Please try again!"
      setSearchResults({
        success: false,
        query: userQuery,
        aiResponse: errorMessage,
        relevantContent: []
      })
    } finally {
      setIsSearching(false)
      inputRef.current?.focus()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setTimeout(() => handleSearch(), 100)
  }

  const handleHistoryClick = (historyItem: SearchHistoryItem) => {
    setQuery(historyItem.query)
    setSearchResults({
      success: true,
      query: historyItem.query,
      aiResponse: historyItem.response,
      relevantContent: []
    })
    setShowHistory(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Search History Icon - Top Right */}
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
          title="Search History"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        
        {/* History Dropdown */}
        {showHistory && (
          <div className="absolute top-14 right-0 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Search History</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {searchHistory.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No search history yet
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {searchHistory.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleHistoryClick(item)}
                    className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">
                      {item.query}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Joey Hendrickson
            </h1>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ask me anything"
                  className="w-full px-6 py-4 pr-14 text-lg border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-lg"
                  disabled={isSearching}
                />
                <button
                  type="submit"
                  disabled={isSearching || !query.trim()}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isSearching ? (
                    <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Suggestions */}
            {!searchResults && (
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {[
                  'What projects have you worked on?',
                  'Tell me about your music',
                  'What are your values?',
                  'Tell me about your travels'
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-full hover:bg-gray-50 hover:border-blue-300 transition-colors text-gray-700"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Generative AI Response Display - This is the main content */}
          {searchResults && searchResults.aiResponse && (
            <>
              <GenerativeDisplay
                content={searchResults.aiResponse}
                query={searchResults.query}
              />
              <div ref={chatEndRef} />
            </>
          )}

          {/* Suggestions from AI */}
          {searchResults && searchResults.suggestions && searchResults.suggestions.length > 0 && (
            <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Try asking:</h3>
              <div className="flex flex-wrap gap-2">
                {searchResults.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 text-sm bg-white border border-blue-300 rounded-full hover:bg-blue-100 transition-colors text-blue-700"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© {new Date().getFullYear()} Joey Hendrickson. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
