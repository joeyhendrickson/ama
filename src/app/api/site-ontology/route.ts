import { NextRequest, NextResponse } from 'next/server'

// Site ontology - structure of all pages and content
export const siteOntology = {
  pages: [
    {
      id: 'home',
      title: 'Home',
      route: '/',
      description: 'Main landing page with AI search interface. Users can ask questions about Joey and get personalized content.',
      content: [
        'AI-powered search interface',
        'Personal introduction (2-3 sentences)',
        'Dynamic content display based on queries',
        'Access to all site content through search'
      ]
    },
    {
      id: 'consultant',
      title: 'Consultant',
      route: '/consultant',
      description: 'Digital consulting services, web and platform development, and AI solutions. Current focus on integrating AI into small business and enterprise functions.',
      content: [
        'Digital Consulting services',
        'Web & Platform Development',
        'AI Solutions',
        'Current focus: AI integration for business growth',
        'Links to projects page for context'
      ]
    },
    {
      id: 'projects',
      title: 'Projects',
      route: '/projects',
      description: 'Portfolio of 14+ years of cross-functional IT management. Shows total project value, project categories, and detailed project information.',
      content: [
        'Total Project Value (in millions)',
        'Project categories: AI/ML, Robotics, Cloud, SaaS, IoT, Blockchain, ERP, Civic, Automation',
        'Chronologically organized projects',
        'Project details: client, period, budget, technologies, achievements',
        'Interactive project cards with filtering'
      ],
      keyProjects: [
        'Path Robotics - Multi-Arm Robotics ($1.4M)',
        'InnateIQ - AI SaaS Product Vision ($500K+)',
        'Advanced Drainage Systems - Global Supply Chain ($33M)',
        'COTA - Digital Portfolio Management ($80M)',
        'Bergen Logistics - CloudX Systems ($6M Cloud SaaS Platform)',
        'Mayo Clinic - GCP Cloud Transformation ($120M+)',
        'AEP - IoT Workforce Mobility ($4M)',
        'JobsOhio - ERP & ML Inventory ($20M Impact)',
        'And many more...'
      ]
    },
    {
      id: 'founder',
      title: 'Founder',
      route: '/founder',
      description: 'Entrepreneurial ventures, press coverage, and interactive journey game. Video interviews managed through admin dashboard.',
      content: [
        'NBC Video Interviews (admin-managed)',
        'Press Coverage',
        'Interactive Entrepreneurial Journey Game',
        'Founder projects with investment and profitability tracking'
      ]
    },
    {
      id: 'speaker',
      title: 'Speaker',
      route: '/speaker',
      description: 'Speaking engagements, panels, and keynotes. Videos managed through admin dashboard.',
      content: [
        'Speaking events: SXSW, Techstars, Music Canada, WOMEX (2016-2022)',
        'YouTube video embeds',
        'Event pages and speaker information',
        'Videos managed through admin dashboard'
      ]
    },
    {
      id: 'music',
      title: 'Music',
      route: '/music',
      description: 'Music streaming page with flip cards for listening and commentary. Songs managed through admin dashboard. Download functionality with PayPal checkout.',
      content: [
        'Song streaming with flip cards',
        'Voice comment functionality',
        'Song downloads ($3 per song)',
        'Custom album creation (10 songs for $15)',
        'PayPal checkout integration',
        'Streams/views tracking (admin dashboard)'
      ]
    },
    {
      id: 'travel-santa-marta',
      title: 'Travel Santa Marta',
      route: '/travel-santa-marta',
      description: 'Travel packages to Santa Marta, Colombia. Booking system with email notifications.',
      content: [
        '1 Week Package - $2,500 (for 1-2 people)',
        '2 Week Package - $3,000 (for 1-2 people)',
        '1 Week Family Package - $3,000 (for 3-5 people)',
        '2 Week Family Package - $3,500 (for 3-5 people)',
        'Premium 2 Week Package - $4,000 (private chef, food club)',
        'Luxury 1 Week Jungle Package - $4,000 (tree house, private boating)',
        'Booking form with excursion selection',
        'Email notifications to joeyhendrickson@me.com'
      ]
    },
    {
      id: 'personal-ai-os',
      title: 'Personal AI OS',
      route: '/personal-ai-os',
      description: 'Promotion for lifestacks.ai - modern, interactive promotion of personal AI operating system.',
      content: [
        'Links to lifestacks.ai',
        'Logo and branding',
        'Interactive promotion'
      ]
    },
    {
      id: 'author',
      title: 'Author',
      route: '/author',
      description: 'Digital book sales with AI-generated personalized messaging. Books managed through admin dashboard.',
      content: [
        'Digital book catalog',
        'Book purchase with PayPal',
        'AI-generated personalized messages (admin-controlled)',
        'Book delivery after admin confirmation'
      ]
    }
  ],
  personalContent: {
    categories: [
      {
        id: 'childhood',
        title: 'Childhood',
        description: 'Stories and experiences from childhood'
      },
      {
        id: 'high-school',
        title: 'High School',
        description: 'High school experiences and memories'
      },
      {
        id: 'college',
        title: 'College',
        description: 'College experiences and education'
      },
      {
        id: 'invention-process',
        title: 'Invention Process',
        description: 'How ideas are developed and brought to life'
      },
      {
        id: 'travels',
        title: 'Travels',
        description: 'Travel experiences and adventures'
      },
      {
        id: 'dating',
        title: 'Dating & Relationships',
        description: 'Viewpoints on dating and relationships'
      },
      {
        id: 'faith',
        title: 'Faith',
        description: 'Faith and spiritual perspectives'
      },
      {
        id: 'marriage',
        title: 'Marriage',
        description: 'Viewpoints on marriage'
      },
      {
        id: 'values',
        title: 'Values',
        description: 'Core values and principles'
      },
      {
        id: 'hobbies',
        title: 'Hobbies',
        description: 'Personal hobbies and interests'
      },
      {
        id: 'gym-routine',
        title: 'Gym Routine',
        description: 'Fitness and workout routines'
      },
      {
        id: 'personal-stories',
        title: 'Personal Stories',
        description: 'Personal stories and life experiences'
      }
    ]
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    ontology: siteOntology
  })
}

