'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

interface GenerativeDisplayProps {
  content: string
  query: string
}

export default function GenerativeDisplay({ content, query }: GenerativeDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  // Custom markdown components for better styling
  const markdownComponents = {
    h1: ({ node, ...props }: any) => (
      <h1 className="text-4xl font-bold text-gray-900 mt-8 mb-4" {...props} />
    ),
    h2: ({ node, ...props }: any) => (
      <h2 className="text-3xl font-bold text-gray-900 mt-6 mb-3" {...props} />
    ),
    h3: ({ node, ...props }: any) => (
      <h3 className="text-2xl font-semibold text-gray-900 mt-4 mb-2" {...props} />
    ),
    h4: ({ node, ...props }: any) => (
      <h4 className="text-xl font-semibold text-gray-900 mt-3 mb-2" {...props} />
    ),
    p: ({ node, ...props }: any) => (
      <p className="text-gray-700 leading-relaxed mb-4" {...props} />
    ),
    ul: ({ node, ...props }: any) => (
      <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700" {...props} />
    ),
    ol: ({ node, ...props }: any) => (
      <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700" {...props} />
    ),
    li: ({ node, ...props }: any) => (
      <li className="ml-4" {...props} />
    ),
    strong: ({ node, ...props }: any) => (
      <strong className="font-bold text-gray-900" {...props} />
    ),
    em: ({ node, ...props }: any) => (
      <em className="italic text-gray-800" {...props} />
    ),
    code: ({ node, inline, ...props }: any) => {
      if (inline) {
        return (
          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-blue-600" {...props} />
        )
      }
      return (
        <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 font-mono text-sm" {...props} />
      )
    },
    blockquote: ({ node, ...props }: any) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4" {...props} />
    ),
    table: ({ node, ...props }: any) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border-collapse border border-gray-300" {...props} />
      </div>
    ),
    thead: ({ node, ...props }: any) => (
      <thead className="bg-gray-100" {...props} />
    ),
    th: ({ node, ...props }: any) => (
      <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900" {...props} />
    ),
    td: ({ node, ...props }: any) => (
      <td className="border border-gray-300 px-4 py-2 text-gray-700" {...props} />
    ),
    a: ({ node, ...props }: any) => (
      <a className="text-blue-600 hover:text-blue-800 underline" {...props} />
    ),
    hr: ({ node, ...props }: any) => (
      <hr className="my-6 border-gray-300" {...props} />
    )
  }

  return (
    <div className="mt-8">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div
          className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">AI-Generated Response</h3>
                <p className="text-sm text-gray-600">Based on your question about "{query}"</p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
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

        {/* Content */}
        {isExpanded && (
          <div className="p-8">
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown components={markdownComponents}>
                {content}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
