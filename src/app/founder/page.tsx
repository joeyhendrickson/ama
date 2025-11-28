'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

type Project = {
  id: string
  name: string
  description: string
  year: number
  investment: number
  profitability: number
  image?: string
  press?: string[]
}

type PressItem = {
  title: string
  outlet: string
  type: 'article' | 'interview' | 'video' | 'feature'
  url?: string
  year?: number
}

type VideoInterview = {
  id: string
  title: string
  outlet: string
  youtubeId?: string
  description?: string
  year?: number
}

const projects: Project[] = [
  {
    id: 'columbus-songwriters',
    name: 'Columbus Songwriters Association',
    description: 'Founded and led the Columbus Songwriters Association, fostering a vibrant music community and supporting local songwriters in Columbus, Ohio.',
    year: 2015,
    investment: 5000,
    profitability: 15000,
    press: ['Columbus Underground', 'Greater Columbus Arts Council']
  },
  {
    id: 'the-parlor',
    name: 'The Parlor',
    description: 'A creative music venue and community space that became a hub for local artists and musicians.',
    year: 2016,
    investment: 25000,
    profitability: 45000,
    press: ['Columbus Underground', 'Columbus Alive']
  },
  {
    id: 'local-music-shelf',
    name: 'Local Music Shelf',
    description: 'An innovative platform connecting local musicians with audiences, supporting the independent music scene.',
    year: 2017,
    investment: 15000,
    profitability: 30000,
    press: ['Columbus CEO', 'Music Dealers']
  },
  {
    id: 'lamp-amp',
    name: 'Lamp Amp',
    description: 'A music technology venture focused on amplifying local talent and providing resources for independent artists.',
    year: 2018,
    investment: 20000,
    profitability: 35000,
    press: ['Frettie', 'Groove U']
  },
  {
    id: 'hidden-drive-in',
    name: 'The Hidden Drive In',
    description: 'A unique entertainment venue combining drive-in movie experiences with live music performances.',
    year: 2019,
    investment: 30000,
    profitability: 60000,
    press: ['Columbus Underground', 'Billboard']
  },
  {
    id: 'smart-sound',
    name: 'Smart Sound',
    description: 'An AI-powered music technology platform helping artists optimize their sound and reach wider audiences.',
    year: 2020,
    investment: 50000,
    profitability: 120000,
    press: ['Google', 'TechCrunch']
  },
  {
    id: 'columbus-music-commission',
    name: 'Columbus Music Commission',
    description: 'Leadership role in the Columbus Music Commission, driving initiatives to grow the creative economy.',
    year: 2021,
    investment: 0,
    profitability: 0,
    press: ['Greater Columbus Arts Council', 'Columbus Underground']
  }
]

// Videos will be fetched from database

const pressCoverage: PressItem[] = [
  {
    title: 'Joey Hendrickson: Building Columbus Music Scene',
    outlet: 'Columbus Underground',
    type: 'article',
    year: 2016
  },
  {
    title: 'Entrepreneur Spotlight: Joey Hendrickson',
    outlet: 'The Ohio State University',
    type: 'feature',
    year: 2017
  },
  {
    title: 'Music Innovation in Columbus',
    outlet: 'Jamaica Gleaner',
    type: 'article',
    year: 2018
  },
  {
    title: 'UNESCO Poland Interview',
    outlet: 'UNESCO Poland',
    type: 'interview',
    url: 'https://youtube.com',
    year: 2019
  },
  {
    title: 'Google Feature: Local Music Technology',
    outlet: 'Google',
    type: 'feature',
    year: 2020
  },
  {
    title: 'Columbus Songwriters Association Launch',
    outlet: 'Columbus Underground',
    type: 'article',
    year: 2015
  },
  {
    title: 'The Parlor: A New Music Venue',
    outlet: 'Columbus Alive',
    type: 'article',
    year: 2016
  },
  {
    title: 'Smart Sound Technology Innovation',
    outlet: 'TechCrunch',
    type: 'article',
    year: 2020
  }
]

export default function Founder() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [gameProgress, setGameProgress] = useState(0)
  const [totalInvestment, setTotalInvestment] = useState(0)
  const [totalProfitability, setTotalProfitability] = useState(0)
  const [unlockedProjects, setUnlockedProjects] = useState<string[]>([])
  const [nbcVideos, setNbcVideos] = useState<VideoInterview[]>([])
  const [loadingVideos, setLoadingVideos] = useState(true)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/admin/founder-videos')
      const data = await response.json()
      if (data.success) {
        setNbcVideos(data.videos.map((v: any) => ({
          id: v.id,
          title: v.title,
          outlet: v.outlet,
          youtubeId: v.youtube_id,
          description: v.description,
          year: v.year
        })))
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
    } finally {
      setLoadingVideos(false)
    }
  }

  const handleProjectClick = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    if (!unlockedProjects.includes(projectId)) {
      setUnlockedProjects([...unlockedProjects, projectId])
      setTotalInvestment(prev => prev + project.investment)
      setTotalProfitability(prev => prev + project.profitability)
      setGameProgress(prev => prev + 1)
    }
    setSelectedProject(projectId)
  }

  const resetGame = () => {
    setGameProgress(0)
    setTotalInvestment(0)
    setTotalProfitability(0)
    setUnlockedProjects([])
    setSelectedProject(null)
  }

  const selectedProjectData = selectedProject ? projects.find(p => p.id === selectedProject) : null

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="text-center py-20 sm:py-32 container mx-auto px-4 bg-gradient-to-br from-gray-50 to-white">
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
          Founder
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mt-6 max-w-2xl mx-auto">
          Entrepreneurial ventures, press coverage, and the journey of building
        </p>
      </section>

      {/* NBC Video Interviews Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20">
        <div className="container mx-auto px-4 md:px-0">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">NBC Interviews</h2>
              <p className="text-lg text-gray-600">Watch interviews and features from NBC</p>
            </div>
            
            {loadingVideos ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading videos...</p>
              </div>
            ) : nbcVideos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {nbcVideos.map((video) => (
                <div key={video.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                  <div className="aspect-video bg-gray-900 relative">
                    {video.youtubeId ? (
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${video.youtubeId}`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white p-8">
                        <svg className="w-16 h-16 mb-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        <p className="text-gray-400 text-center">
                          Add YouTube video ID to display NBC interview
                        </p>
                        <p className="text-gray-500 text-sm mt-2 text-center">
                          Find the video on YouTube and use the video ID from the URL
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                        NBC
                      </span>
                      {video.year && (
                        <span className="text-xs text-gray-500">{video.year}</span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{video.title}</h3>
                    {video.description && (
                      <p className="text-gray-600 text-sm">{video.description}</p>
                    )}
                  </div>
                </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-500">No videos added yet. Add videos through the admin dashboard.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Press Coverage Section */}
      <section className="container mx-auto px-4 md:px-0 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Press Coverage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pressCoverage.map((item, index) => (
              <div 
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                    {item.type}
                  </span>
                  {item.year && (
                    <span className="text-xs text-gray-500">{item.year}</span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{item.outlet}</p>
                {item.url && (
                  <a 
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
                  >
                    View {item.type === 'video' ? 'Video' : 'Article'}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Journey Game */}
      <section className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-20">
        <div className="container mx-auto px-4 md:px-0">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Entrepreneurial Journey</h2>
              <p className="text-lg text-gray-600 mb-6">
                Click on projects to unlock them and see your journey unfold
              </p>
              <button
                onClick={resetGame}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-full text-sm font-semibold transition-colors"
              >
                Reset Journey
              </button>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Projects Unlocked</div>
                <div className="text-3xl font-bold text-gray-900">{gameProgress} / {projects.length}</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Total Investment</div>
                <div className="text-3xl font-bold text-purple-600">${totalInvestment.toLocaleString()}</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Total Profitability</div>
                <div className="text-3xl font-bold text-green-600">${totalProfitability.toLocaleString()}</div>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {projects.map((project) => {
                const isUnlocked = unlockedProjects.includes(project.id)
                const isSelected = selectedProject === project.id
                
                return (
                  <div
                    key={project.id}
                    onClick={() => handleProjectClick(project.id)}
                    className={`
                      relative bg-white rounded-xl p-6 border-2 cursor-pointer transition-all duration-300
                      ${isUnlocked 
                        ? 'border-purple-500 shadow-lg hover:shadow-xl hover:-translate-y-1' 
                        : 'border-gray-200 opacity-60 hover:opacity-80'
                      }
                      ${isSelected ? 'ring-4 ring-purple-300' : ''}
                    `}
                  >
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-xl flex items-center justify-center">
                        <div className="text-center">
                          <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <p className="text-sm text-gray-500 font-medium">Click to Unlock</p>
                        </div>
                      </div>
                    )}
                    
                    {isUnlocked && (
                      <div className="absolute top-4 right-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                    )}

                    <div className="mb-4">
                      {project.image ? (
                        <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 relative overflow-hidden">
                          <Image
                            src={project.image}
                            alt={project.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-gradient-to-br from-purple-200 to-blue-200 rounded-lg mb-3 flex items-center justify-center">
                          <span className="text-4xl">🎵</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                    
                    {isUnlocked && (
                      <div className="space-y-2 pt-4 border-t border-gray-200">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Year:</span>
                          <span className="font-semibold text-gray-900">{project.year}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Investment:</span>
                          <span className="font-semibold text-purple-600">${project.investment.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Profitability:</span>
                          <span className="font-semibold text-green-600">${project.profitability.toLocaleString()}</span>
                        </div>
                        {project.press && project.press.length > 0 && (
                          <div className="pt-2">
                            <div className="text-xs text-gray-500 mb-1">Press:</div>
                            <div className="flex flex-wrap gap-1">
                              {project.press.map((outlet, idx) => (
                                <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                  {outlet}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Selected Project Detail */}
            {selectedProjectData && unlockedProjects.includes(selectedProjectData.id) && (
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{selectedProjectData.name}</h3>
                    <p className="text-gray-600">{selectedProjectData.year}</p>
                  </div>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">{selectedProjectData.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Investment</div>
                    <div className="text-2xl font-bold text-purple-600">${selectedProjectData.investment.toLocaleString()}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Profitability</div>
                    <div className="text-2xl font-bold text-green-600">${selectedProjectData.profitability.toLocaleString()}</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">ROI</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {((selectedProjectData.profitability / selectedProjectData.investment) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  )
}
