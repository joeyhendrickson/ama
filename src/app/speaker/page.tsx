'use client'

import { useState } from 'react'

type SpeakingEvent = {
  id: string
  title: string
  event: string
  year: number
  role: 'speaker' | 'moderator' | 'panelist' | 'keynote'
  description?: string
  eventPageUrl?: string
  youtubeId?: string
  articleUrl?: string
  location?: string
  topics?: string[]
}

const speakingEvents: SpeakingEvent[] = [
  // NBC Events
  {
    id: 'nbc-1',
    title: 'NBC Interview - Technology & Innovation',
    event: 'NBC',
    year: 2018,
    role: 'speaker',
    description: 'Featured interview discussing technology innovation and entrepreneurship in the music industry',
    location: 'Columbus, OH',
    topics: ['Technology Innovation', 'Entrepreneurship', 'Music Industry']
  },
  {
    id: 'nbc-2',
    title: 'NBC Feature - Columbus Music Scene',
    event: 'NBC',
    year: 2019,
    role: 'speaker',
    description: 'NBC feature on building the Columbus music scene and creative economy',
    location: 'Columbus, OH',
    topics: ['Music Industry', 'Creative Economy', 'Community Building']
  },
  // SXSW Events
  {
    id: 'sxsw-2016',
    title: 'Music Technology Innovation Panel',
    event: 'SXSW',
    year: 2016,
    role: 'panelist',
    description: 'Panel discussion on the future of music technology and innovation in the industry',
    eventPageUrl: 'https://schedule.sxsw.com',
    location: 'Austin, TX',
    topics: ['Music Technology', 'Innovation', 'Industry Trends']
  },
  {
    id: 'sxsw-2017',
    title: 'Building Music Communities',
    event: 'SXSW',
    year: 2017,
    role: 'moderator',
    description: 'Moderated panel on creating and sustaining vibrant music communities',
    eventPageUrl: 'https://schedule.sxsw.com',
    location: 'Austin, TX',
    topics: ['Community Building', 'Music Industry', 'Creative Economy']
  },
  {
    id: 'sxsw-2018',
    title: 'Entrepreneurship in the Music Industry',
    event: 'SXSW',
    year: 2018,
    role: 'keynote',
    description: 'Keynote on entrepreneurship and innovation in the modern music industry',
    eventPageUrl: 'https://schedule.sxsw.com',
    location: 'Austin, TX',
    topics: ['Entrepreneurship', 'Music Industry', 'Innovation']
  },
  {
    id: 'sxsw-2019',
    title: 'AI and Music: The Future of Creation',
    event: 'SXSW',
    year: 2019,
    role: 'panelist',
    description: 'Panel discussion on artificial intelligence and its impact on music creation',
    eventPageUrl: 'https://schedule.sxsw.com',
    location: 'Austin, TX',
    topics: ['AI/ML', 'Music Technology', 'Future of Music']
  },
  {
    id: 'sxsw-2020',
    title: 'Digital Transformation in Music',
    event: 'SXSW',
    year: 2020,
    role: 'moderator',
    description: 'Moderated discussion on digital transformation and its effects on the music industry',
    eventPageUrl: 'https://schedule.sxsw.com',
    location: 'Austin, TX',
    topics: ['Digital Transformation', 'Music Industry', 'Technology']
  },
  {
    id: 'sxsw-2021',
    title: 'Post-Pandemic Music Industry',
    event: 'SXSW',
    year: 2021,
    role: 'speaker',
    description: 'Insights on navigating the music industry in a post-pandemic world',
    eventPageUrl: 'https://schedule.sxsw.com',
    location: 'Austin, TX',
    topics: ['Music Industry', 'Post-Pandemic', 'Strategy']
  },
  {
    id: 'sxsw-2022',
    title: 'Innovation in Music Technology',
    event: 'SXSW',
    year: 2022,
    role: 'panelist',
    description: 'Panel on cutting-edge music technology and its applications',
    eventPageUrl: 'https://schedule.sxsw.com',
    location: 'Austin, TX',
    topics: ['Music Technology', 'Innovation', 'Technology Trends']
  },
  // Techstars Events
  {
    id: 'techstars-2017',
    title: 'Startup Ecosystem Development',
    event: 'Techstars',
    year: 2017,
    role: 'speaker',
    description: 'Building and nurturing startup ecosystems in music and technology',
    eventPageUrl: 'https://www.techstars.com',
    location: 'Various',
    topics: ['Startup Ecosystem', 'Entrepreneurship', 'Innovation']
  },
  {
    id: 'techstars-2018',
    title: 'Music Tech Accelerator Panel',
    event: 'Techstars',
    year: 2018,
    role: 'moderator',
    description: 'Moderated panel on music technology accelerators and startup success',
    eventPageUrl: 'https://www.techstars.com',
    location: 'Various',
    topics: ['Music Technology', 'Accelerators', 'Startups']
  },
  {
    id: 'techstars-2019',
    title: 'Entrepreneurial Journey in Music',
    event: 'Techstars',
    year: 2019,
    role: 'speaker',
    description: 'Sharing experiences and lessons from building music technology companies',
    eventPageUrl: 'https://www.techstars.com',
    location: 'Various',
    topics: ['Entrepreneurship', 'Music Technology', 'Lessons Learned']
  },
  {
    id: 'techstars-2020',
    title: 'Innovation in Music Startups',
    event: 'Techstars',
    year: 2020,
    role: 'panelist',
    description: 'Panel discussion on innovation and trends in music technology startups',
    eventPageUrl: 'https://www.techstars.com',
    location: 'Various',
    topics: ['Music Startups', 'Innovation', 'Technology Trends']
  },
  {
    id: 'techstars-2021',
    title: 'Building Music Tech Companies',
    event: 'Techstars',
    year: 2021,
    role: 'speaker',
    description: 'Keynote on building successful music technology companies',
    eventPageUrl: 'https://www.techstars.com',
    location: 'Various',
    topics: ['Music Technology', 'Company Building', 'Entrepreneurship']
  },
  {
    id: 'techstars-2022',
    title: 'Future of Music Entrepreneurship',
    event: 'Techstars',
    year: 2022,
    role: 'moderator',
    description: 'Moderated discussion on the future landscape of music entrepreneurship',
    eventPageUrl: 'https://www.techstars.com',
    location: 'Various',
    topics: ['Music Entrepreneurship', 'Future Trends', 'Innovation']
  },
  // WOMEX Events
  {
    id: 'womex-2017',
    title: 'World Music Industry Panel',
    event: 'WOMEX',
    year: 2017,
    role: 'speaker',
    description: 'Speaking on global music industry trends and opportunities',
    eventPageUrl: 'https://www.womex.com',
    location: 'Various',
    topics: ['World Music', 'Global Industry', 'Music Trends']
  },
  {
    id: 'womex-2018',
    title: 'Music Technology on Global Stage',
    event: 'WOMEX',
    year: 2018,
    role: 'panelist',
    description: 'Panel discussion on music technology and its global impact',
    eventPageUrl: 'https://www.womex.com',
    location: 'Various',
    topics: ['Music Technology', 'Global Impact', 'Industry Innovation']
  },
  {
    id: 'womex-2019',
    title: 'Digital Innovation in World Music',
    event: 'WOMEX',
    year: 2019,
    role: 'moderator',
    description: 'Moderated panel on digital innovation and world music',
    eventPageUrl: 'https://www.womex.com',
    location: 'Various',
    topics: ['Digital Innovation', 'World Music', 'Technology']
  },
  {
    id: 'womex-2020',
    title: 'Global Music Community Building',
    event: 'WOMEX',
    year: 2020,
    role: 'speaker',
    description: 'Keynote on building global music communities and networks',
    eventPageUrl: 'https://www.womex.com',
    location: 'Various',
    topics: ['Community Building', 'Global Networks', 'Music Industry']
  },
  {
    id: 'womex-2021',
    title: 'Music Industry Resilience',
    event: 'WOMEX',
    year: 2021,
    role: 'panelist',
    description: 'Panel on resilience and adaptation in the global music industry',
    eventPageUrl: 'https://www.womex.com',
    location: 'Various',
    topics: ['Industry Resilience', 'Adaptation', 'Global Music']
  },
  {
    id: 'womex-2022',
    title: 'Future of World Music',
    event: 'WOMEX',
    year: 2022,
    role: 'speaker',
    description: 'Speaking on the future of world music and cultural exchange',
    eventPageUrl: 'https://www.womex.com',
    location: 'Various',
    topics: ['World Music', 'Cultural Exchange', 'Future Trends']
  },
  // Music Canada / Canadian Music Week
  {
    id: 'cmw-2018',
    title: 'Canadian Music Industry Innovation',
    event: 'Canadian Music Week',
    year: 2018,
    role: 'speaker',
    description: 'Speaking on innovation and technology in the Canadian music industry',
    eventPageUrl: 'https://cmw.net',
    location: 'Toronto, Canada',
    topics: ['Music Industry', 'Innovation', 'Canadian Music']
  },
  {
    id: 'cmw-2019',
    title: 'Digital Music Distribution',
    event: 'Canadian Music Week',
    year: 2019,
    role: 'panelist',
    description: 'Panel on digital distribution and streaming in the modern music industry',
    eventPageUrl: 'https://cmw.net',
    location: 'Toronto, Canada',
    topics: ['Digital Distribution', 'Streaming', 'Music Industry']
  },
  {
    id: 'cmw-2020',
    title: 'Music Technology Trends',
    event: 'Canadian Music Week',
    year: 2020,
    role: 'speaker',
    description: 'Keynote on emerging trends in music technology and their impact',
    eventPageUrl: 'https://cmw.net',
    location: 'Toronto, Canada',
    topics: ['Music Technology', 'Trends', 'Industry Impact']
  },
  {
    id: 'cmw-2021',
    title: 'Post-Pandemic Music Industry',
    event: 'Canadian Music Week',
    year: 2021,
    role: 'moderator',
    description: 'Moderated discussion on the music industry recovery and adaptation',
    eventPageUrl: 'https://cmw.net',
    location: 'Toronto, Canada',
    topics: ['Post-Pandemic', 'Industry Recovery', 'Adaptation']
  },
  {
    id: 'cmw-2022',
    title: 'Innovation in Music Business',
    event: 'Canadian Music Week',
    year: 2022,
    role: 'panelist',
    description: 'Panel on innovative business models in the music industry',
    eventPageUrl: 'https://cmw.net',
    location: 'Toronto, Canada',
    topics: ['Business Models', 'Innovation', 'Music Industry']
  },
  // UNESCO Poland
  {
    id: 'unesco-poland-2019',
    title: 'Creative Technology and Innovation',
    event: 'UNESCO Poland',
    year: 2019,
    role: 'speaker',
    description: 'Presented on creative technology labs and innovation at UNESCO conference in Poland',
    location: 'Poland',
    topics: ['Creative Technology', 'Innovation', 'AR/VR', 'Civic Programs']
  },
  // Jamaica Events
  {
    id: 'jamaica-2018',
    title: 'Music Innovation in Jamaica',
    event: 'Jamaica Gleaner / Music Industry',
    year: 2018,
    role: 'speaker',
    description: 'Featured speaker on music innovation and technology in Jamaica',
    articleUrl: 'https://jamaica-gleaner.com',
    location: 'Jamaica',
    topics: ['Music Innovation', 'Technology', 'Caribbean Music']
  },
  // Power of Music Festival
  {
    id: 'power-music-2019',
    title: 'Power of Music Festival',
    event: 'Power of Music Festival',
    year: 2019,
    role: 'speaker',
    description: 'Featured speaker at Power of Music Festival on music industry innovation',
    location: 'Various',
    topics: ['Music Industry', 'Innovation', 'Festival']
  },
  {
    id: 'power-music-2020',
    title: 'Music Technology and Community',
    event: 'Power of Music Festival',
    year: 2020,
    role: 'moderator',
    description: 'Moderated panel on music technology and community building',
    location: 'Various',
    topics: ['Music Technology', 'Community', 'Innovation']
  },
  // Ohio State University
  {
    id: 'osu-2017',
    title: 'Entrepreneurship in Music Technology',
    event: 'The Ohio State University',
    year: 2017,
    role: 'speaker',
    description: 'Guest lecture on entrepreneurship and innovation in music technology',
    location: 'Columbus, OH',
    topics: ['Entrepreneurship', 'Music Technology', 'Innovation']
  },
  {
    id: 'osu-2018',
    title: 'Building Music Communities',
    event: 'The Ohio State University',
    year: 2018,
    role: 'speaker',
    description: 'Workshop on building and sustaining music communities',
    location: 'Columbus, OH',
    topics: ['Community Building', 'Music Industry', 'Leadership']
  },
  {
    id: 'osu-2019',
    title: 'Creative Economy Development',
    event: 'The Ohio State University',
    year: 2019,
    role: 'speaker',
    description: 'Keynote on creative economy development and civic innovation',
    location: 'Columbus, OH',
    topics: ['Creative Economy', 'Civic Innovation', 'Economic Development']
  },
  {
    id: 'osu-2020',
    title: 'AI and Music Industry',
    event: 'The Ohio State University',
    year: 2020,
    role: 'speaker',
    description: 'Guest lecture on artificial intelligence applications in the music industry',
    location: 'Columbus, OH',
    topics: ['AI/ML', 'Music Industry', 'Technology']
  },
  {
    id: 'osu-2021',
    title: 'Digital Transformation in Music',
    event: 'The Ohio State University',
    year: 2021,
    role: 'speaker',
    description: 'Speaking on digital transformation and its impact on music businesses',
    location: 'Columbus, OH',
    topics: ['Digital Transformation', 'Music Business', 'Technology']
  },
  {
    id: 'osu-2022',
    title: 'Future of Music Entrepreneurship',
    event: 'The Ohio State University',
    year: 2022,
    role: 'speaker',
    description: 'Keynote on the future of music entrepreneurship and innovation',
    location: 'Columbus, OH',
    topics: ['Music Entrepreneurship', 'Future Trends', 'Innovation']
  },
  // Capital University
  {
    id: 'capital-2017',
    title: 'Entrepreneurship and Innovation',
    event: 'Capital University',
    year: 2017,
    role: 'speaker',
    description: 'Entrepreneurship and innovation talks for business students',
    location: 'Columbus, OH',
    topics: ['Entrepreneurship', 'Innovation', 'Business Strategy']
  },
  {
    id: 'capital-2018',
    title: 'Music Industry Business Models',
    event: 'Capital University',
    year: 2018,
    role: 'speaker',
    description: 'Guest lecture on modern music industry business models and strategies',
    location: 'Columbus, OH',
    topics: ['Business Models', 'Music Industry', 'Strategy']
  },
  {
    id: 'capital-2019',
    title: 'Technology in Creative Industries',
    event: 'Capital University',
    year: 2019,
    role: 'speaker',
    description: 'Speaking on technology integration in creative industries',
    location: 'Columbus, OH',
    topics: ['Creative Industries', 'Technology', 'Innovation']
  },
  {
    id: 'capital-2020',
    title: 'Building Creative Communities',
    event: 'Capital University',
    year: 2020,
    role: 'speaker',
    description: 'Workshop on building and sustaining creative communities',
    location: 'Columbus, OH',
    topics: ['Community Building', 'Creative Economy', 'Leadership']
  },
  // Columbus Events
  {
    id: 'columbus-2016',
    title: 'Columbus Music Week',
    event: 'CMWs - Columbus Music Week',
    year: 2016,
    role: 'moderator',
    description: 'Moderated panels and discussions at Columbus Music Week',
    location: 'Columbus, OH',
    topics: ['Music Industry', 'Local Music', 'Community']
  },
  {
    id: 'columbus-2017',
    title: 'Creative Economy Summit',
    event: 'Columbus Creative Economy',
    year: 2017,
    role: 'speaker',
    description: 'Featured speaker at Creative Economy Summit in Columbus',
    location: 'Columbus, OH',
    topics: ['Creative Economy', 'Economic Development', 'Innovation']
  },
  {
    id: 'columbus-2018',
    title: 'Music Technology Innovation',
    event: 'Columbus Tech Events',
    year: 2018,
    role: 'speaker',
    description: 'Speaking on music technology innovation and startups',
    location: 'Columbus, OH',
    topics: ['Music Technology', 'Innovation', 'Startups']
  }
]

export default function Speaker() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [filterRole, setFilterRole] = useState<string | null>(null)
  const [filterEvent, setFilterEvent] = useState<string | null>(null)

  const events = Array.from(new Set(speakingEvents.map(e => e.event)))
  const roles = Array.from(new Set(speakingEvents.map(e => e.role)))

  const filteredEvents = speakingEvents.filter(e => {
    if (filterRole && e.role !== filterRole) return false
    if (filterEvent && e.event !== filterEvent) return false
    return true
  })

  const selectedEventData = selectedEvent ? speakingEvents.find(e => e.id === selectedEvent) : null

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'moderator':
        return 'bg-purple-100 text-purple-700'
      case 'speaker':
        return 'bg-blue-100 text-blue-700'
      case 'keynote':
        return 'bg-orange-100 text-orange-700'
      case 'panelist':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'moderator':
        return '🎤'
      case 'speaker':
        return '📢'
      case 'keynote':
        return '⭐'
      case 'panelist':
        return '👥'
      default:
        return '🎯'
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="text-center py-20 sm:py-32 container mx-auto px-4 bg-gradient-to-br from-gray-50 to-white">
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
          Speaking
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mt-6 max-w-2xl mx-auto">
          Thought Leader, Speaker, and Panel Moderator at Major Global Events
        </p>
        <p className="text-base md:text-lg text-gray-500 mt-4 max-w-xl mx-auto">
          Sharing insights on technology, entrepreneurship, innovation, and the music industry
        </p>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-12">
        <div className="container mx-auto px-4 md:px-0">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{speakingEvents.length}+</div>
                <div className="text-sm text-gray-600 mt-1">Speaking Engagements</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{events.length}</div>
                <div className="text-sm text-gray-600 mt-1">Major Events</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{new Set(speakingEvents.map(e => e.year)).size}</div>
                <div className="text-sm text-gray-600 mt-1">Years Active</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">Global</div>
                <div className="text-sm text-gray-600 mt-1">Reach</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Availability Notice */}
      <section className="container mx-auto px-4 md:px-0 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
            <p className="text-gray-800 text-lg">
              <strong>Availability:</strong> Currently unavailable for speaking engagements until late 2025.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-4 md:px-0 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-4 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Role</label>
              <select
                value={filterRole || ''}
                onChange={(e) => setFilterRole(e.target.value || null)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E55A2B] focus:border-[#E55A2B]"
              >
                <option value="">All Roles</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Event</label>
              <select
                value={filterEvent || ''}
                onChange={(e) => setFilterEvent(e.target.value || null)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E55A2B] focus:border-[#E55A2B]"
              >
                <option value="">All Events</option>
                {events.map(event => (
                  <option key={event} value={event}>{event}</option>
                ))}
              </select>
            </div>
            {(filterRole || filterEvent) && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilterRole(null)
                    setFilterEvent(null)
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Events by Category */}
      <section className="container mx-auto px-4 md:px-0 py-20">
        <div className="max-w-6xl mx-auto">
          {/* Group by Event Type */}
          {['NBC', 'SXSW', 'Techstars', 'WOMEX', 'Canadian Music Week', 'UNESCO Poland', 'Jamaica Gleaner', 'Power of Music Festival', 'The Ohio State University', 'Capital University', 'CMWs - Columbus Music Week'].map(eventType => {
            const eventTypeEvents = filteredEvents.filter(e => e.event.includes(eventType) || (eventType === 'NBC' && e.event === 'NBC'))
            if (eventTypeEvents.length === 0) return null

            return (
              <div key={eventType} className="mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-8">{eventType}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {eventTypeEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event.id)}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-[#E55A2B] group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getRoleIcon(event.role)}</span>
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getRoleBadgeColor(event.role)}`}>
                            {event.role}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">{event.year}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#E55A2B] transition-colors">
                        {event.title}
                      </h3>
                      {event.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                      )}
                      {event.location && (
                        <p className="text-xs text-gray-500 mb-3">📍 {event.location}</p>
                      )}
                      {event.topics && event.topics.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {event.topics.slice(0, 3).map((topic, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-4 flex items-center gap-4 text-sm">
                        {event.youtubeId && (
                          <span className="text-red-600 font-medium">📹 Video Available</span>
                        )}
                        {event.articleUrl && (
                          <span className="text-blue-600 font-medium">📰 Article Available</span>
                        )}
                        {event.eventPageUrl && (
                          <span className="text-purple-600 font-medium">🔗 Event Page</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Event Detail Modal */}
      {selectedEventData && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-8 text-white">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">{getRoleIcon(selectedEventData.role)}</span>
                    <span className="bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
                      {selectedEventData.role}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold mb-2">{selectedEventData.title}</h2>
                  <p className="text-xl opacity-90">{selectedEventData.event}</p>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span>{selectedEventData.year}</span>
                {selectedEventData.location && (
                  <>
                    <span>•</span>
                    <span>📍 {selectedEventData.location}</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-8">
              {selectedEventData.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedEventData.description}</p>
                </div>
              )}

              {selectedEventData.topics && selectedEventData.topics.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Topics Covered</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEventData.topics.map((topic, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Embed */}
              {selectedEventData.youtubeId && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Video Recording</h3>
                  <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${selectedEventData.youtubeId}`}
                      title={selectedEventData.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="flex flex-wrap gap-4">
                {selectedEventData.eventPageUrl && (
                  <a
                    href={selectedEventData.eventPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                  >
                    View Event Page
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                )}
                {selectedEventData.articleUrl && (
                  <a
                    href={selectedEventData.articleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Read Article
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <section className="container mx-auto px-4 md:px-0 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">How to Add Video Recordings:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Find the video recording on YouTube</li>
              <li>Copy the video ID from the URL (e.g., from <code className="bg-gray-200 px-1 rounded">youtube.com/watch?v=VIDEO_ID</code>)</li>
              <li>Update the <code className="bg-gray-200 px-1 rounded">youtubeId</code> field in the <code className="bg-gray-200 px-1 rounded">speakingEvents</code> array</li>
              <li>The video will automatically embed and display</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  )
}

