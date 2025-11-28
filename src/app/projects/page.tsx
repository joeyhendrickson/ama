'use client'

import { useState } from 'react'
import { allProjects, getStartDate, Project } from '@/data/projects'

// Sort projects chronologically by start date (oldest first)
const projects = allProjects.sort((a, b) => {
  const dateA = getStartDate(a.period)
  const dateB = getStartDate(b.period)
  return dateA - dateB // Ascending order (oldest first)
})

const categoryColors: Record<string, { bg: string; text: string; icon: string }> = {
  'ai-ml': { bg: 'bg-purple-100', text: 'text-purple-700', icon: '🧠' },
  'robotics': { bg: 'bg-blue-100', text: 'text-blue-700', icon: '🤖' },
  'cloud': { bg: 'bg-cyan-100', text: 'text-cyan-700', icon: '☁️' },
  'saas': { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: '💻' },
  'iot': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '📡' },
  'blockchain': { bg: 'bg-gray-100', text: 'text-gray-700', icon: '⛓️' },
  'erp': { bg: 'bg-green-100', text: 'text-green-700', icon: '📊' },
  'civic': { bg: 'bg-orange-100', text: 'text-orange-700', icon: '🏛️' },
  'automation': { bg: 'bg-pink-100', text: 'text-pink-700', icon: '⚙️' }
}

export default function Projects() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  const categories = Array.from(new Set(projects.map(p => p.category)))
  const filteredProjects = selectedCategory 
    ? projects.filter(p => p.category === selectedCategory)
    : projects

  const selectedProjectData = selectedProject ? projects.find(p => p.id === selectedProject) : null

  const totalBudget = projects
    .filter(p => p.budget && p.budget.includes('$'))
    .reduce((sum, p) => {
      if (!p.budget) return sum
      
      // Extract all dollar amounts from the budget string
      // Matches patterns like $1.4M, $500K, $33M, ($6M), etc.
      const dollarMatches = p.budget.match(/\$[\d.]+[KMB]?/gi) || []
      
      if (dollarMatches.length === 0) return sum
      
      // Convert each match to a number and take the largest value
      const values = dollarMatches.map(match => {
        const numStr = match.replace(/[^0-9.]/g, '')
        const num = parseFloat(numStr) || 0
        
        // Determine multiplier based on suffix
        let multiplier = 1
        if (match.toUpperCase().includes('B')) {
          multiplier = 1000000000
        } else if (match.toUpperCase().includes('M')) {
          multiplier = 1000000
        } else if (match.toUpperCase().includes('K')) {
          multiplier = 1000
        }
        
        return num * multiplier
      })
      
      // Use the largest value from the budget string (handles cases like "$250K R&D ($6M Cloud SaaS Platform)")
      const maxValue = Math.max(...values)
      
      return sum + maxValue
    }, 0)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="text-center py-20 sm:py-32 container mx-auto px-4 bg-gradient-to-br from-gray-50 to-white">
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
          Projects
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mt-6 max-w-2xl mx-auto">
          14+ years of cross-functional IT management delivering enterprise solutions
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <div className="bg-white px-6 py-3 rounded-full shadow-lg border border-gray-200">
            <div className="text-sm text-gray-600">Total Project Value</div>
            <div className="text-2xl font-bold text-gray-900">${(totalBudget / 1000000).toFixed(0)}M+</div>
          </div>
          <div className="bg-white px-6 py-3 rounded-full shadow-lg border border-gray-200">
            <div className="text-sm text-gray-600">Projects Delivered</div>
            <div className="text-2xl font-bold text-gray-900">{projects.length}+</div>
          </div>
          <div className="bg-white px-6 py-3 rounded-full shadow-lg border border-gray-200">
            <div className="text-sm text-gray-600">Years Experience</div>
            <div className="text-2xl font-bold text-gray-900">14+</div>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="container mx-auto px-4 md:px-0 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                selectedCategory === null
                  ? 'bg-[#E55A2B] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Projects
            </button>
            {categories.map(category => {
              const catInfo = categoryColors[category]
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-semibold transition-all flex items-center gap-2 ${
                    selectedCategory === category
                      ? `${catInfo.bg} ${catInfo.text} shadow-lg`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{catInfo.icon}</span>
                  <span className="capitalize">{category.replace('-', ' ')}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="container mx-auto px-4 md:px-0 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => {
              const catInfo = categoryColors[project.category]
              return (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project.id)}
                  className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-[#E55A2B] transition-all duration-300 cursor-pointer hover:shadow-2xl transform hover:-translate-y-2 group"
                >
                  {/* Icon and Category */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${project.color} rounded-xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform`}>
                      {project.icon}
                    </div>
                    <span className={`${catInfo.bg} ${catInfo.text} px-3 py-1 rounded-full text-xs font-semibold`}>
                      {project.category.replace('-', ' ')}
                    </span>
                  </div>

                  {/* Title and Client */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#E55A2B] transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 font-semibold mb-3">{project.client}</p>

                  {/* Budget Badge */}
                  {project.budget && (
                    <div className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                      {project.budget}
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{project.description}</p>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.slice(0, 3).map((tech, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="text-xs text-gray-500">+{project.technologies.length - 3}</span>
                    )}
                  </div>

                  {/* Period */}
                  <div className="text-xs text-gray-500">{project.period}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Project Detail Modal */}
      {selectedProjectData && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedProject(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`bg-gradient-to-br ${selectedProjectData.color} p-8 text-white`}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-6xl">{selectedProjectData.icon}</div>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{selectedProjectData.title}</h2>
                    <p className="text-xl opacity-90">{selectedProjectData.client}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {selectedProjectData.budget && (
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
                  <span className="font-semibold">Budget: {selectedProjectData.budget}</span>
                </div>
              )}
            </div>

            <div className="p-8">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{selectedProjectData.description}</p>
              </div>

              {selectedProjectData.achievements && selectedProjectData.achievements.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Achievements</h3>
                  <ul className="space-y-2">
                    {selectedProjectData.achievements.map((achievement, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Technologies & Tools</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProjectData.technologies.map((tech, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Period: {selectedProjectData.period}</span>
                  <span className={`${categoryColors[selectedProjectData.category].bg} ${categoryColors[selectedProjectData.category].text} px-3 py-1 rounded-full font-semibold`}>
                    {selectedProjectData.category.replace('-', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
