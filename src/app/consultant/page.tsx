'use client'

import Link from 'next/link'

export default function Consultant() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="text-center py-20 sm:py-32 container mx-auto px-4 bg-gradient-to-br from-gray-50 to-white">
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
          Consultant
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mt-6 max-w-2xl mx-auto">
          Complex project management for Fortune 100 companies, startups, and cities
        </p>
      </section>

      {/* Current Focus Section */}
      <section className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-16">
        <div className="container mx-auto px-4 md:px-0">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-gray-200">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Current Focus</h2>
                  <p className="text-gray-700 text-lg leading-relaxed mb-4">
                    My current focus is to <strong>integrate AI into small business and enterprise functions</strong> to support 
                    growth, advancement, and team value. I help organizations leverage artificial intelligence to automate 
                    processes, enhance decision-making, and create intelligent systems that drive measurable business outcomes.
                  </p>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    Through strategic AI implementation, I enable teams to work more efficiently, make data-driven decisions, 
                    and unlock new opportunities for innovation and competitive advantage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 md:px-0 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              I specialize in complex project management, working with Fortune 100 companies, startups, and cities 
              to deliver innovative solutions and drive growth. My approach combines strategic thinking with hands-on 
              execution to solve challenging problems and deliver measurable results.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              With 14+ years of experience managing 50+ high-value projects, I bring proven expertise in planning, 
              scheduling, risk management, and stakeholder engagement including C-level and technical teams.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              Currently available for consulting and project work in the United States.
            </p>
            <div className="mt-8">
              <Link 
                href="/projects"
                className="inline-flex items-center gap-2 bg-[#E55A2B] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#D14A1B] transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                View All Projects
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Areas of Expertise */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Areas of Expertise</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI SaaS</h3>
                <p className="text-gray-600">Building and scaling AI-powered software solutions</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Welding Robotics</h3>
                <p className="text-gray-600">Advanced robotics solutions for manufacturing automation</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">IoT Surgical Robotics</h3>
                <p className="text-gray-600">Connected medical device systems and surgical robotics</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Order Promising</h3>
                <p className="text-gray-600">Supply chain optimization and fulfillment systems</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">E-commerce</h3>
                <p className="text-gray-600">Digital commerce platforms and strategies</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Blockchain for Supply Chain</h3>
                <p className="text-gray-600">Transparent and traceable supply chain solutions</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Cialdini Inbound Strategy</h3>
                <p className="text-gray-600">Psychology-based marketing and growth strategies</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Digital Marketing Transformation</h3>
                <p className="text-gray-600">Modern marketing strategies and execution</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Rapid User Growth</h3>
                <p className="text-gray-600">Scaling user bases and engagement strategies</p>
              </div>
            </div>
          </div>

          {/* Recent Engagements */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-bold text-gray-900">Recent Engagements</h2>
              <Link 
                href="/projects"
                className="text-[#E55A2B] font-semibold hover:text-[#D14A1B] transition-colors flex items-center gap-1"
              >
                View All Projects
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            <div className="space-y-6 mb-8">
              <Link href="/projects#path-robotics" className="block border-l-4 border-[#E55A2B] pl-6 hover:bg-gray-50 p-4 rounded-r-lg transition-colors group">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2 group-hover:text-[#E55A2B] transition-colors">Path Robotics</h3>
                <p className="text-gray-700 mb-2 font-medium">Multi-arm robotics development - $1.4M</p>
                <p className="text-gray-600">Assessed troubled project, redefined scope and critical path. Led AI-driven predictive app development with Vertex AI for real-time defect detection.</p>
              </Link>
              <Link href="/projects#innateiq" className="block border-l-4 border-[#E55A2B] pl-6 hover:bg-gray-50 p-4 rounded-r-lg transition-colors group">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2 group-hover:text-[#E55A2B] transition-colors">InnateIQ</h3>
                <p className="text-gray-700 mb-2 font-medium">AI SaaS Product Vision - $500K+</p>
                <p className="text-gray-600">Defined and executed roadmap for AI SaaS platform. Designed $500K product opportunity with Ford Motors for innovative 3D printing via AI.</p>
              </Link>
              <Link href="/projects#mayo-clinic" className="block border-l-4 border-[#E55A2B] pl-6 hover:bg-gray-50 p-4 rounded-r-lg transition-colors group">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2 group-hover:text-[#E55A2B] transition-colors">Mayo Clinic</h3>
                <p className="text-gray-700 mb-2 font-medium">GCP Cloud Transformation - $120M+</p>
                <p className="text-gray-600">Managed large-scale SaaS and GCP cloud transformation. Partnered with Deloitte to socialize and coach scaled agile across 300+ team members.</p>
              </Link>
              <Link href="/projects#jobsohio" className="block border-l-4 border-[#E55A2B] pl-6 hover:bg-gray-50 p-4 rounded-r-lg transition-colors group">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2 group-hover:text-[#E55A2B] transition-colors">JobsOhio</h3>
                <p className="text-gray-700 mb-2 font-medium">ERP & ML Inventory System - $20M Impact</p>
                <p className="text-gray-600">Supported Modern ERP and Logistics System development. Enhanced $1B+ OHLQ inventory system with machine learning-based product recommendations.</p>
              </Link>
            </div>
            <div className="text-center">
              <Link 
                href="/projects"
                className="inline-flex items-center gap-2 bg-[#E55A2B] text-white font-semibold py-3 px-8 rounded-lg hover:bg-[#D14A1B] transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Explore All Projects
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

