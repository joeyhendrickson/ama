// Shared projects data that can be used by both the page and API routes

export type Project = {
  id: string
  title: string
  client: string
  period: string
  budget?: string
  description: string
  technologies: string[]
  category: 'ai-ml' | 'robotics' | 'cloud' | 'saas' | 'iot' | 'blockchain' | 'erp' | 'civic' | 'automation'
  achievements?: string[]
  icon: string
  color: string
}

// Helper function to parse period and get start date for sorting
export const getStartDate = (period: string): number => {
  const parts = period.split('–').map(p => p.trim())
  const startPart = parts[0]
  
  const yearMatch = startPart.match(/\d{4}/)
  if (yearMatch) {
    const year = parseInt(yearMatch[0])
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthMatch = startPart.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i)
    if (monthMatch) {
      const month = monthNames.findIndex(m => m.toLowerCase() === monthMatch[0].toLowerCase())
      return year * 100 + (month + 1)
    }
    
    return year * 100
  }
  
  return 0
}

export const allProjects: Project[] = [
  {
    id: 'path-robotics',
    title: 'Multi-Arm Robotics Development',
    client: 'Path Robotics',
    period: 'Dec 2024 – May 2025',
    budget: '$1.4M',
    description: 'Assessed troubled multi-arm welding project, redefined scope and critical path, and managed alignment of client, lead engineers, hardware engineers, and vendors to ensure improved timeline and quality delivery.',
    technologies: ['Robotics', 'Agile', 'Scrum', 'Vertex AI', 'AI/ML'],
    category: 'robotics',
    achievements: ['Fast-tracked 6 month delivery from 9 month schedule', 'Fixed major project delay', 'Led AI-driven predictive app dev with Vertex AI for real-time defect detection'],
    icon: '🤖',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'innateiq',
    title: 'AI SaaS Product Vision',
    client: 'InnateIQ',
    period: 'Jun 2024 – Dec 2024',
    budget: '$500K+',
    description: 'Defined and executed roadmap for AI SaaS platform, aligning C-level stakeholders and technical teams. Designed and developed $500K product opportunity with Ford Motors for innovative 3D printing via AI.',
    technologies: ['Vertex AI', 'BigQuery', 'Looker', 'GCP', 'AI/ML', 'Conversational AI'],
    category: 'ai-ml',
    achievements: ['$500K Ford Motors 3D printing opportunity', 'Initiated conversational AI partnerships', 'Created white-labeled product opportunities'],
    icon: '🧠',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'advanced-drainage',
    title: 'Global Supply Chain Initiative',
    client: 'Advanced Drainage Systems',
    period: 'Dec 2023 – Feb 2024',
    budget: '$33M',
    description: 'Developed multi-phase product roadmap for $33M global supply chain initiative (Oracle EBS) achieving CTO approval. Managed strategic releases alongside PwC consulting partners. Conducted risk workshops and led PMO budget compliance.',
    technologies: ['Oracle EBS', 'Supply Chain', 'PMO', 'Agile', 'Risk Management'],
    category: 'erp',
    achievements: ['$33M global initiative', 'CTO approval', 'PwC partnership', 'PMO compliance'],
    icon: '📦',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'cota',
    title: 'Digital Portfolio Management',
    client: 'Central Ohio Transit Authority',
    period: 'Feb 2024 – Jun 2024',
    budget: '$80M',
    description: 'Sold advanced digital projects with multi-phased project plans, roadmap development, and go-to-market strategies. Served as primary lead for digital portfolio of 33 projects, managing vendors and reporting to executives. Assessed and recovered failing vendor engagement, restructured project plans, and maintained transparent executive-level reporting.',
    technologies: ['Digital Transformation', 'Telephony', 'Security', 'Vendor Management', 'Portfolio Management', 'Roadmap Development', 'Go-to-Market Strategy'],
    category: 'civic',
    achievements: ['33 project portfolio', 'Multi-phased project plans', 'Recovered failing vendor engagement', 'Restored portfolio value and timelines'],
    icon: '🚌',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'bergen-logistics',
    title: 'CloudX Systems Omni-Channel Suite',
    client: 'Bergen Logistics',
    period: 'Aug 2022 – Dec 2023',
    budget: '$250K R&D ($6M Cloud SaaS Platform)',
    description: 'Hired by Bergen Logistics to manage a $250K digital, omni-channel supply chain platform research and development project, supporting a $6M Cloud SaaS platform build initiative. Developed business cases and supported AWS cloud and product feature planning as a member of the Product Council. Teamed up with the CTO to support roadmap development, implementation, and G2M launch of Cloud X Systems. Detailed buyer personas through campaign testing, tested multiple channels to determine effective communications planning, owned web messaging, SEO keywords, and positioning of solutions aligned to buyer personas and market value. Presented status reports to the CEO of Cloud X Systems. Supported executive communications, planning, and reports to drive adoption and continued funding. Engaged an internal stakeholder group for feedback on product and platform feature prioritization. Coordinated daily and weekly backlog grooming. As a result of stakeholder feedback and buyer persona research, aligned known WMS market value and messaging with Cloud X solutions to reduce market adoption barriers.',
    technologies: ['SaaS', 'AWS Cloud', 'Product Management', 'Logistics', 'Stakeholder Management', 'Go-to-Market Strategy', 'Roadmap Development', 'Buyer Personas', 'SEO', 'Backlog Management', 'Product Council'],
    category: 'saas',
    achievements: ['$250K R&D project', '$6M Cloud SaaS platform support', 'Buyer persona research and testing', 'G2M launch support', 'Market adoption barrier reduction', 'Executive communications and reporting'],
    icon: '☁️',
    color: 'from-indigo-500 to-blue-500'
  },
  {
    id: 'mayo-clinic',
    title: 'GCP Cloud Transformation',
    client: 'Mayo Clinic',
    period: 'Aug 2021 – Aug 2022',
    budget: '$120M+',
    description: 'Managed large-scale SaaS and $120M+ GCP cloud transformation in UX, software factory, and AI teams. Coached agile, led ceremonies, served in SoS to build stakeholder alignment. Partnered with Deloitte to socialize and coach scaled agile across 300+ team members.',
    technologies: ['GCP', 'Cloud', 'AI/ML', 'SAFe', 'ADO', 'Scrum of Scrums'],
    category: 'cloud',
    achievements: ['$120M+ transformation', '300+ team members', 'SAFe implementation', 'Deloitte partnership'],
    icon: '🏥',
    color: 'from-teal-500 to-cyan-500'
  },
  {
    id: 'aep',
    title: 'IoT Workforce Mobility - Senior PM & Scrum Master',
    client: 'American Electric Power',
    period: 'Apr 2020 – Apr 2021',
    budget: '$4M',
    description: 'Consulted innovation into the workforce mobility program. Owned the project vision and developed the user and technical requirements of an IoT solution through field service end users, feasibility, and stakeholder feedback. Led MVP testing to plan risks against field service work and regulation requirements; tested MVP with end users, refined user stories and technical requirements; managed vendor selection, owned backlog and delivery. Coached scrum and agile throughout delivery; directed rapid product development with frameworks to deliver product feature increments and version updates ahead of project timeline.',
    technologies: ['IoT', 'Scrum Master', 'Agile', 'Product Management', 'MVP Testing', 'Vendor Management', 'Backlog Management'],
    category: 'iot',
    achievements: ['$4M project budget', 'MVP testing and validation', 'Ahead of timeline delivery', 'Scrum and agile coaching', 'Vendor selection and management'],
    icon: '⚡',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'jobsohio',
    title: 'ERP & ML Inventory System',
    client: 'JobsOhio',
    period: 'Feb 2020 – Jul 2020',
    budget: '$20M Impact',
    description: 'Supported Modern ERP and Logistics System development through Microsoft AX to Dynamics 365 enhancements of $1B+ OHLQ inventory delivery, insights, and reporting system with machine learning-based product recommendations.',
    technologies: ['Dynamics 365', 'Microsoft AX', 'Machine Learning', 'ERP', 'Business Intelligence'],
    category: 'erp',
    achievements: ['$20M business impact', 'ML-based recommendations', 'ERP modernization', 'Predictive insights'],
    icon: '🏭',
    color: 'from-blue-600 to-indigo-600'
  },
  {
    id: 'medtronic',
    title: 'Hugo Surgical Robot IoT',
    client: 'Medtronic',
    period: 'Dec 2017 – Dec 2019',
    budget: '$4M',
    description: 'Consulted roadmap for Hugo Surgical Robot remote IoT solutions. Mapped customer personas (surgeons/admins/field engineers) and prioritized critical access control features for dashboard/app release.',
    technologies: ['IoT', 'Surgical Robotics', 'Machine Learning', 'UX', 'Persona Mapping'],
    category: 'iot',
    achievements: ['$4M roadmap', 'Dashboard/app release', 'Role-based access controls', 'Customer persona mapping'],
    icon: '⚕️',
    color: 'from-red-500 to-pink-500'
  },
  {
    id: 'pepsico',
    title: 'Blockchain Supply Chain',
    client: 'PepsiCo',
    period: 'Aug 2017 – Dec 2017',
    budget: '$500K',
    description: 'Designed real-time supply chain enhancement leveraging ERC20 blockchain, enhancing product visibility and traceability. Solution was adopted by PepsiCo and road showed by partners to P&G and J&J.',
    technologies: ['Blockchain', 'ERC20', 'Supply Chain', 'Traceability', 'Real-time Systems'],
    category: 'blockchain',
    achievements: ['$500K project', 'Firm-wide adoption', 'P&G and J&J roadshow', 'Real-time traceability'],
    icon: '⛓️',
    color: 'from-gray-700 to-gray-900'
  },
  {
    id: 'johnson-johnson',
    title: 'Salesforce & DAM System Integration',
    client: 'Johnson & Johnson',
    period: '2017 – 2019',
    budget: 'Enterprise Integration',
    description: 'Consulted data integrations of the Salesforce and Digital Asset Management System that interacted with PowerBI and Oracle PLM. Under direction of SME, supported team development of automation capabilities to intelligently search, advise, and monitor digital reports and advertising in e-commerce channels.',
    technologies: ['Salesforce', 'Digital Asset Management', 'PowerBI', 'Oracle PLM', 'Data Integration', 'Automation', 'E-commerce'],
    category: 'erp',
    achievements: ['Salesforce and DAM integration', 'PowerBI and Oracle PLM integration', 'Automation capabilities', 'E-commerce channel monitoring'],
    icon: '💊',
    color: 'from-red-600 to-pink-600'
  },
  {
    id: 'unesco',
    title: 'AR/VR Innovation Platform',
    client: 'UNESCO / Katowice Institute',
    period: 'Sep 2016 – Jan 2017',
    budget: '$14M',
    description: 'Launched AR/VR platform, securing $14M in government funding for product innovation and civic programs.',
    technologies: ['AR/VR', 'Creative Technology', 'Civic Programs', 'Platform Development'],
    category: 'civic',
    achievements: ['$14M funding secured', 'AR/VR platform', 'Product innovation', 'Civic programs'],
    icon: '🌍',
    color: 'from-green-600 to-teal-600'
  },
  {
    id: 'columbus-music',
    title: 'Columbus Music Commission',
    client: 'Executive Director / Founder',
    period: 'Mar 2013 – Sep 2016',
    budget: '$3.2M Impact',
    description: 'Led $3.2M public-private economic innovation program; built and scaled innovative solutions; presented globally at UNESCO conferences; achieved funding for city commission by City of Columbus and partners.',
    technologies: ['Human-Centered Design', 'Civic Engagement', 'Community Programs', 'Economic Innovation'],
    category: 'civic',
    achievements: ['$3.2M economic impact', 'UNESCO presentations', 'City commission funding', 'Public-private partnership'],
    icon: '🎵',
    color: 'from-purple-600 to-indigo-600'
  },
  {
    id: 'merrill-lynch',
    title: 'Retail Marketing Systems',
    client: 'Merrill Lynch',
    period: 'May 2015 – Sep 2016',
    budget: '$3.8M',
    description: 'Launched and managed website, social automation and marketing platforms for $3.8M retail project combining restaurant, events, and digital marketing. Retail growth led to $1.2M+ in additional investment.',
    technologies: ['Digital Marketing', 'Retail Systems', 'Web Development', 'Social Automation', 'Integration'],
    category: 'automation',
    achievements: ['$3.8M project', '$1.2M+ additional investment', 'Website and platform development'],
    icon: '💼',
    color: 'from-blue-700 to-cyan-700'
  },
  {
    id: 'donatos',
    title: 'Web-Based Automation Platform',
    client: 'Donatos Pizza Inc',
    period: 'Feb 2014 – May 2015',
    budget: '12% Sales Lift',
    description: 'Designed and launched web-based platform that increased in-store event frequency and drove 12% lift in sales through automation. Restaurant/bar and web-based platform expanded to 2 additional cities.',
    technologies: ['Web Platform', 'Automation', 'E-commerce', 'Event Management'],
    category: 'automation',
    achievements: ['12% sales lift', 'Multi-city expansion', 'Event frequency increase'],
    icon: '🍕',
    color: 'from-red-600 to-orange-600'
  },
  {
    id: 'bosca',
    title: 'Oracle ERP Transition',
    client: 'Bosca Accessories',
    period: 'Feb 2012 – Mar 2013',
    budget: '14% Sales Increase',
    description: 'Directed ERP transition to Oracle, enhancing e-commerce systems and increasing online sales by 14%.',
    technologies: ['Oracle ERP', 'E-commerce', 'ERP Migration'],
    category: 'erp',
    achievements: ['14% online sales increase', 'Oracle ERP implementation', 'E-commerce enhancement'],
    icon: '👜',
    color: 'from-amber-600 to-yellow-600'
  },
  {
    id: 'sharper-image',
    title: 'PLM System Implementation',
    client: 'Three Sixty Group / Sharper Image',
    period: 'Feb 2017 – May 2019',
    budget: '$250K Implementation ($150M Retail Business)',
    description: 'Consulted product lifecycle management (PLM) software at Sharper Image\'s product development office in Pasadena, California. Led on-site workshops and persona interviews with engineers and designers to build workflow user stories. Gathered technical requirements for PLM selection and planning for a $250K implementation that supported transformation benefits at the $150M retail business. Delivered PLM system implementation plan, scaling services from $250K to $1.6M, with $8M impact.',
    technologies: ['PLM', 'Product Lifecycle Management', 'Persona Discovery', 'User Flows', 'Workshop Facilitation', 'Technical Requirements'],
    category: 'erp',
    achievements: ['$250K PLM implementation', '$150M retail business transformation', 'On-site workshops and interviews', 'Workflow user stories', '$8M business impact'],
    icon: '🛍️',
    color: 'from-violet-500 to-purple-500'
  },
  {
    id: 'greenline-creative',
    title: 'Frettie.com User Growth',
    client: 'Greenline Creative',
    period: 'Feb 2011 – Feb 2012',
    budget: 'Acquisition Impact',
    description: 'Consulted feature enhancements for Frettie.com, driving user growth that contributed to an early acquisition.',
    technologies: ['Web Development', 'User Growth', 'Feature Enhancement', 'Product Strategy'],
    category: 'saas',
    achievements: ['User growth acceleration', 'Early acquisition contribution', 'Feature development'],
    icon: '📈',
    color: 'from-emerald-500 to-green-500'
  },
  {
    id: 'columbus-songwriters-assoc',
    title: 'Columbus Songwriters Association',
    client: 'Founder & President',
    period: '2015 – Present',
    budget: '$3M Impact',
    description: 'Founded and led the Columbus Songwriters Association, fostering a vibrant music community and supporting local songwriters in Columbus, Ohio. Built and scaled innovative solutions for the creative economy.',
    technologies: ['Community Building', 'Non-profit Leadership', 'Music Industry', 'Creative Economy'],
    category: 'civic',
    achievements: ['$3M economic impact', 'Founded organization', 'Community building', 'Creative economy growth'],
    icon: '🎵',
    color: 'from-purple-600 to-indigo-600'
  },
  {
    id: 'the-parlor',
    title: 'The Parlor',
    client: 'Founder',
    period: '2016 – Present',
    budget: '$45K Profitability',
    description: 'A creative music venue and community space that became a hub for local artists and musicians. Created a platform for live performances and community engagement.',
    technologies: ['Venue Management', 'Event Production', 'Community Space', 'Music Venue'],
    category: 'civic',
    achievements: ['$45K profitability', 'Community hub creation', 'Artist support platform'],
    icon: '🎸',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'local-music-shelf',
    title: 'Local Music Shelf',
    client: 'Founder',
    period: '2017 – Present',
    budget: '$30K Profitability',
    description: 'An innovative platform connecting local musicians with audiences, supporting the independent music scene. Built technology solutions to amplify local talent.',
    technologies: ['Platform Development', 'Music Technology', 'Community Platform', 'Artist Services'],
    category: 'saas',
    achievements: ['$30K profitability', 'Local artist support', 'Platform development'],
    icon: '💿',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'lamp-amp',
    title: 'Lamp Amp',
    client: 'Founder',
    period: '2018 – Present',
    budget: '$35K Profitability',
    description: 'A music technology venture focused on amplifying local talent and providing resources for independent artists. Technology solutions for music industry professionals.',
    technologies: ['Music Technology', 'Artist Resources', 'Technology Platform', 'Music Industry'],
    category: 'saas',
    achievements: ['$35K profitability', 'Music technology innovation', 'Artist resource platform'],
    icon: '🎚️',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'hidden-drive-in',
    title: 'The Hidden Drive In',
    client: 'Founder',
    period: '2019 – Present',
    budget: '$60K Profitability',
    description: 'A unique entertainment venue combining drive-in movie experiences with live music performances. Innovative approach to community entertainment and events.',
    technologies: ['Event Management', 'Entertainment Venue', 'Live Events', 'Community Entertainment'],
    category: 'civic',
    achievements: ['$60K profitability', 'Innovative venue concept', 'Community entertainment'],
    icon: '🎬',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'smart-sound',
    title: 'Smart Sound',
    client: 'Founder',
    period: '2020 – Present',
    budget: '$120K Profitability',
    description: 'An AI-powered music technology platform helping artists optimize their sound and reach wider audiences. Angel-backed by CEO for patented new product development in IoT product.',
    technologies: ['AI/ML', 'Music Technology', 'IoT', 'Patented Technology', 'Angel-backed'],
    category: 'ai-ml',
    achievements: ['$120K profitability', 'Patented technology', 'Angel-backed', 'AI-powered platform'],
    icon: '🔊',
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'celius',
    title: 'LoRaWAN Network Deployment',
    client: 'Celius (Joint Venture with Airriva)',
    period: '2020 – 2021',
    budget: '$80K',
    description: 'Launched a joint business, Celius, with CEO of Airriva, to build a LoRaWAN network across fifty downtown rental properties in The United States. Offered expansion capital in 2021, but declined due to device-level indicators that showed market saturation and impeding decline. Exited profitably in 2021.',
    technologies: ['LoRaWAN', 'IoT', 'Network Infrastructure', 'Real Estate Technology', 'Market Analysis'],
    category: 'iot',
    achievements: ['50 property network deployment', 'Profitable exit', 'Market analysis and strategic decision'],
    icon: '📡',
    color: 'from-blue-600 to-indigo-600'
  },
  {
    id: 'license-local',
    title: 'License Local App Development',
    client: 'License Local',
    period: '2015 – 2017',
    budget: '$80K',
    description: 'Raised early stage venture capital from Small Business Owners of America (SBOOA) to visually design and designed the License Local app. Architected the automated sync licensing capabilities, built and delivered the roadmap. Organized a global tech team to support app development from prototype to V1.',
    technologies: ['Mobile App Development', 'Venture Capital', 'Product Architecture', 'Team Leadership', 'Automation'],
    category: 'saas',
    achievements: ['SBOOA funding secured', 'Prototype to V1 delivery', 'Global team organization', 'Automated sync capabilities'],
    icon: '📱',
    color: 'from-green-600 to-emerald-600'
  },
  {
    id: 'jazz-arts-group',
    title: 'Interim CMO - Digital Marketing Transformation',
    client: 'Jazz Arts Group',
    period: '2014 – 2015',
    budget: '$2M Impact',
    description: 'Served as interim CMO for Jazz Arts Group to improve digital marketing, processes, and systems. Created the multi-channel digital marketing strategies that moved advertising from print to digital to improve advertising conversions by 300% year-over-year. Improved the organizations\' revenue by 25%.',
    technologies: ['Digital Marketing', 'Marketing Strategy', 'Process Improvement', 'Multi-channel Marketing', 'Conversion Optimization'],
    category: 'automation',
    achievements: ['300% conversion increase', '25% revenue improvement', 'Print to digital transformation', 'Multi-channel strategy'],
    icon: '🎷',
    color: 'from-purple-600 to-pink-600'
  },
  {
    id: 'uber-eats',
    title: 'Go-to-Market Strategy - Columbus',
    client: 'Uber Eats',
    period: '2016 – 2017',
    budget: '$4M Long Term Impact',
    description: 'Hired by VP of Uber Eats to lead their go-to-market strategy for Columbus, Ohio restaurants. Sold dozens of chain and local restaurants through targeted marketing campaigns on Facebook and LinkedIn.',
    technologies: ['Go-to-Market Strategy', 'Digital Marketing', 'Facebook Ads', 'LinkedIn Marketing', 'Sales Strategy'],
    category: 'automation',
    achievements: ['Dozens of restaurants onboarded', '$4M long term impact', 'Targeted campaign success', 'Chain and local restaurant sales'],
    icon: '🍔',
    color: 'from-black to-gray-800'
  },
  {
    id: 'alliance-mayors',
    title: 'Federally Funded City Improvement Projects',
    client: 'Alliance of Mayors - Ohio',
    period: '2019 – 2020',
    budget: '$300K',
    description: 'Consulted an alliance of mayors in Ohio by directing federally funded projects for city improvement.',
    technologies: ['Project Management', 'Federal Funding', 'Civic Programs', 'City Planning', 'Public Administration'],
    category: 'civic',
    achievements: ['Federally funded projects', 'Multi-city coordination', 'City improvement initiatives'],
    icon: '🏛️',
    color: 'from-blue-700 to-indigo-700'
  },
  {
    id: 'arlington-aesthetics',
    title: 'CMO - EMR, Digital Payments & Marketing Systems',
    client: 'Arlington Aesthetics & Maya Enterprises',
    period: '2020',
    budget: '$4M Health Clinics',
    description: 'Hired by Owners of Arlington Aesthetics and Maya Enterprises to deploy EMR patient record, digital payments, and web and digital marketing systems for $4M of health clinics across Ohio and Tennessee. Served as CMO for aesthetics, men\'s health, and laser treatment clinics and facilities. Developed website, managed digital content channels including social media, email marketing, press, and brand development. Led physical sales teams during launch.',
    technologies: ['EMR Systems', 'Digital Payments', 'Digital Marketing', 'Brand Development', 'Website Development', 'Sales Team Leadership', 'Email Marketing', 'Healthcare Technology'],
    category: 'automation',
    achievements: ['$4M health clinics deployment', 'EMR patient record systems', 'Digital payments integration', 'Multi-state deployment (OH & TN)', 'Multi-channel digital marketing', 'Sales team leadership'],
    icon: '💆',
    color: 'from-pink-600 to-rose-600'
  },
  {
    id: 'conres',
    title: 'Digital Sales Optimization - Test Equipment',
    client: 'Conres',
    period: '2017 – 2022',
    budget: '$15M Annual Digital Sales',
    description: 'Hired by VP Conres to maximize $15M annual digital sales of test equipment through management of website systems, Google AdWords, root cause analysis of click fraud, and technical resolution strategies.',
    technologies: ['Digital Marketing', 'Google AdWords', 'E-commerce', 'Click Fraud Analysis', 'Website Management', 'Sales Optimization'],
    category: 'automation',
    achievements: ['$15M annual digital sales management', 'Google AdWords optimization', 'Click fraud detection and resolution', 'Website systems management'],
    icon: '🔧',
    color: 'from-blue-700 to-cyan-700'
  },
  {
    id: 'retronyms-labs',
    title: 'iMPC Pro 2 App Expansion - South America',
    client: 'Retronyms Labs',
    period: '2018 – 2022',
    budget: '$2M Annual App Revenue',
    description: 'Hired by CEO of Retronyms Labs to plan and implement the expansion of $2M annual iMPC Pro 2 app, 400K users, and brand into South American territories through product enhancements and partnerships.',
    technologies: ['Mobile App Development', 'Product Strategy', 'International Expansion', 'Partnership Development', 'Brand Expansion', 'Product Enhancement'],
    category: 'saas',
    achievements: ['$2M annual app revenue', '400K user base', 'South American market expansion', 'Product enhancements', 'Strategic partnerships'],
    icon: '🎹',
    color: 'from-purple-700 to-indigo-700'
  },
  {
    id: 'foxfire-mountain',
    title: 'Marketing Strategy & Digital Campaigns',
    client: 'Foxfire Mountain',
    period: '2020 – 2021',
    budget: '$2M Impact',
    description: 'Developed and executed comprehensive marketing strategies and digital campaigns for Foxfire Mountain, driving significant business growth and market expansion.',
    technologies: ['Digital Marketing', 'Marketing Strategy', 'Campaign Management', 'Brand Development', 'Digital Advertising'],
    category: 'automation',
    achievements: ['$2M business impact', 'Marketing strategy development', 'Digital campaign execution', 'Market expansion'],
    icon: '🏔️',
    color: 'from-green-600 to-emerald-600'
  },
  {
    id: 'hilliard-city-schools',
    title: 'Innovation Education Program',
    client: 'Hilliard City Schools',
    period: '2021 – 2022',
    budget: '$30K',
    description: 'Consulted on innovation education initiatives for Hilliard City Schools, developing programs and strategies to enhance educational technology and student learning experiences.',
    technologies: ['Education Technology', 'Program Development', 'Innovation Strategy', 'Curriculum Design', 'Educational Consulting'],
    category: 'civic',
    achievements: ['Innovation education program development', 'Educational technology integration', 'Student learning enhancement'],
    icon: '🎓',
    color: 'from-blue-600 to-indigo-600'
  }
]

