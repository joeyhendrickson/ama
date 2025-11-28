'use client'

import { useState } from 'react'
import Link from 'next/link'

interface PageRendererProps {
  pageId: string
  data: any
  query?: string
}

// Highlight keywords in text
function highlightKeywords(text: string, query?: string): React.ReactNode {
  if (!query || !text) return text
  
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2)
  if (queryWords.length === 0) return text
  
  const parts: (string | React.ReactNode)[] = []
  let lastIndex = 0
  let textLower = text.toLowerCase()
  
  // Find all matches
  const matches: Array<{ start: number; end: number; word: string }> = []
  queryWords.forEach(word => {
    let index = textLower.indexOf(word, lastIndex)
    while (index !== -1) {
      matches.push({ start: index, end: index + word.length, word })
      index = textLower.indexOf(word, index + 1)
    }
  })
  
  // Sort matches by position
  matches.sort((a, b) => a.start - b.start)
  
  // Remove overlapping matches
  const nonOverlapping: typeof matches = []
  matches.forEach(match => {
    if (nonOverlapping.length === 0 || match.start >= nonOverlapping[nonOverlapping.length - 1].end) {
      nonOverlapping.push(match)
    }
  })
  
  // Build highlighted text
  nonOverlapping.forEach((match, idx) => {
    if (match.start > lastIndex) {
      parts.push(text.substring(lastIndex, match.start))
    }
    parts.push(
      <mark key={idx} className="bg-yellow-200 px-1 rounded">
        {text.substring(match.start, match.end)}
      </mark>
    )
    lastIndex = match.end
  })
  
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }
  
  return parts.length > 0 ? <>{parts}</> : text
}

export default function PageRenderer({ pageId, data, query }: PageRendererProps) {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())

  const toggleProject = (id: string) => {
    const newSet = new Set(expandedProjects)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setExpandedProjects(newSet)
  }

  // Render Projects Page
  if (pageId === 'projects' && data.projects) {
    return (
      <div className="mt-8 space-y-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Projects Portfolio</h2>
          <p className="text-gray-600 mb-6">
            {data.totalProjects} {data.totalProjects === 1 ? 'project' : 'projects'} found
            {data.totalBudget > 0 && ` • Total Value: $${data.totalBudget.toFixed(1)}M`}
          </p>
          
          {data.projects.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No projects match your query.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.projects.map((project: any) => {
                const isExpanded = expandedProjects.has(project.id)
                return (
                  <div
                    key={project.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{project.icon}</span>
                          <h3 className="text-xl font-bold text-gray-900">
                            {highlightKeywords(project.title, query)}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Client:</strong> {highlightKeywords(project.client, query)}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Period:</strong> {project.period}
                        </p>
                        {project.budget && (
                          <p className="text-sm font-semibold text-blue-600 mb-2">
                            {highlightKeywords(project.budget, query)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => toggleProject(project.id)}
                        className="ml-4 text-gray-400 hover:text-gray-600"
                      >
                        <svg
                          className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                    
                    <p className="text-gray-700 mb-3">
                      {highlightKeywords(project.description, query)}
                    </p>
                    
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Technologies:</p>
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech: string, idx: number) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded"
                              >
                                {highlightKeywords(tech, query)}
                              </span>
                            ))}
                          </div>
                        </div>
                        {project.achievements && project.achievements.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Achievements:</p>
                            <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                              {project.achievements.map((achievement: string, idx: number) => (
                                <li key={idx}>{highlightKeywords(achievement, query)}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render Consultant Page
  if (pageId === 'consultant' && data) {
    return (
      <div className="mt-8 space-y-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {highlightKeywords(data.title, query)}
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            {highlightKeywords(data.description, query)}
          </p>
          
          {data.currentFocus && (
            <div className="bg-purple-50 rounded-lg p-6 mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {highlightKeywords(data.currentFocus.title, query)}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {highlightKeywords(data.currentFocus.content, query)}
              </p>
            </div>
          )}
          
          {data.expertise && data.expertise.length > 0 && (
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Areas of Expertise</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.expertise.map((item: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {highlightKeywords(item.title, query)}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {highlightKeywords(item.description, query)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {data.recentEngagements && data.recentEngagements.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Recent Engagements</h3>
              <div className="space-y-3">
                {data.recentEngagements.map((engagement: any, idx: number) => (
                  <Link
                    key={idx}
                    href={engagement.link || '#'}
                    className="block border-l-4 border-blue-500 pl-4 py-2 hover:bg-gray-50 rounded-r transition-colors"
                  >
                    <h4 className="font-semibold text-gray-900">
                      {highlightKeywords(engagement.title, query)}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {highlightKeywords(engagement.description, query)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render Music Page
  if (pageId === 'music' && data.songs) {
    return (
      <div className="mt-8 space-y-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Music</h2>
          <p className="text-gray-600 mb-6">
            {data.songs.length} {data.songs.length === 1 ? 'song' : 'songs'} available
          </p>
          
          {data.songs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No songs available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.songs.map((song: any) => (
                <div
                  key={song.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-bold text-gray-900 mb-1">
                    {highlightKeywords(song.title, query)}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {highlightKeywords(song.artist_name, query)}
                  </p>
                  {song.genre && (
                    <p className="text-xs text-gray-500 mb-2">
                      {highlightKeywords(song.genre, query)}
                    </p>
                  )}
                  <Link
                    href="/music"
                    className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                  >
                    Listen →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render Founder Page
  if (pageId === 'founder' && data.videos) {
    return (
      <div className="mt-8 space-y-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Founder & Entrepreneur</h2>
          
          {data.videos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No videos available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.videos.map((video: any) => (
                <div key={video.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 mb-2">
                    {highlightKeywords(video.title, query)}
                  </h3>
                  {video.outlet && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Outlet:</strong> {highlightKeywords(video.outlet, query)}
                    </p>
                  )}
                  {video.year && (
                    <p className="text-sm text-gray-600 mb-3">Year: {video.year}</p>
                  )}
                  {video.youtube_id && (
                    <div className="aspect-video rounded overflow-hidden">
                      <iframe
                        src={`https://www.youtube.com/embed/${video.youtube_id}`}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render Speaker Page
  if (pageId === 'speaker' && data.videos) {
    return (
      <div className="mt-8 space-y-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Speaker & Presenter</h2>
          
          {data.videos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No speaking engagements available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.videos.map((video: any) => (
                <div key={video.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 mb-2">
                    {highlightKeywords(video.title, query)}
                  </h3>
                  {video.event && (
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Event:</strong> {highlightKeywords(video.event, query)}
                    </p>
                  )}
                  {video.year && (
                    <p className="text-sm text-gray-600 mb-1">Year: {video.year}</p>
                  )}
                  {video.location && (
                    <p className="text-sm text-gray-600 mb-3">
                      <strong>Location:</strong> {highlightKeywords(video.location, query)}
                    </p>
                  )}
                  {video.youtube_id && (
                    <div className="aspect-video rounded overflow-hidden">
                      <iframe
                        src={`https://www.youtube.com/embed/${video.youtube_id}`}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}

