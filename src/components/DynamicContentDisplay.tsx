'use client'

import { useState } from 'react'
import Link from 'next/link'

interface ContentItem {
  type: 'page' | 'personal'
  pageId?: string
  category?: string
  title: string
  description: string
  route?: string
  content?: string[]
}

interface DynamicContentDisplayProps {
  content: ContentItem[]
  query: string
}

export default function DynamicContentDisplay({ content, query }: DynamicContentDisplayProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expanded)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpanded(newExpanded)
  }

  if (content.length === 0) {
    return null
  }

  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Relevant Content
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {content.map((item, idx) => {
          const id = item.pageId || item.category || idx.toString()
          const isExpanded = expanded.has(id)

          return (
            <div
              key={id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Header */}
              <div
                className="p-6 cursor-pointer"
                onClick={() => toggleExpand(id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        item.type === 'page'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {item.type === 'page' ? 'Page' : 'Personal'}
                      </span>
                      {item.route && (
                        <span className="text-xs text-gray-500">{item.route}</span>
                      )}
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      {item.title}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {item.description}
                    </p>
                  </div>
                  <button className="ml-4 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg
                      className={`w-6 h-6 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-6 pb-6 border-t border-gray-200 pt-4">
                  {item.content && item.content.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Content includes:</p>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {item.content.map((c, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {item.route && (
                    <Link
                      href={item.route}
                      className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                    >
                      View {item.title}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  )}
                  {item.type === 'personal' && (
                    <div className="mt-4 space-y-4">
                      {(item as any).hasContent && (item as any).actualContent ? (
                        <div className="space-y-3">
                          {(item as any).actualContent.map((contentItem: any, idx: number) => (
                            <div key={contentItem.id || idx} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                              <h5 className="font-semibold text-purple-900 mb-2">{contentItem.title}</h5>
                              <div className="text-sm text-purple-800 whitespace-pre-wrap">
                                {contentItem.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <p className="text-sm text-purple-700">
                            💡 Personal content is coming soon! This section will include stories and experiences about {item.title.toLowerCase()}.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

