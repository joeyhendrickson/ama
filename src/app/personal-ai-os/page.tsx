'use client'

import { useState } from 'react'

export default function PersonalAIOS() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative text-center py-20 sm:py-32 container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Lifestacks.ai Logo/Branding */}
          <div className="mb-8">
            <a 
              href="https://lifestacks.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block group"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="relative">
                {/* Logo Container */}
                <div className="bg-white rounded-2xl p-8 shadow-2xl transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-3xl">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    {/* Logo SVG - You can replace this with the actual Lifestacks.ai logo */}
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                      <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Lifestacks.ai
                      </h1>
                      <p className="text-gray-600 text-sm md:text-base mt-1">Personal AI Operating System</p>
                    </div>
                  </div>
                </div>
                
                {/* Animated Arrow */}
                <div className={`absolute -right-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${isHovered ? 'translate-x-2 opacity-100' : 'translate-x-0 opacity-0'}`}>
                  <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </a>
          </div>

          <p className="text-xl md:text-2xl text-gray-700 mb-8 font-medium">
            The future of personal productivity is here
          </p>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            Experience an AI operating system that understands you, learns from you, and works with you to transform how you live and work.
          </p>

          {/* Primary CTA */}
          <a
            href="https://lifestacks.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block group"
          >
            <button className="relative bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 px-12 rounded-full text-lg shadow-xl transform transition-all duration-300 hover:scale-110 hover:shadow-2xl overflow-hidden">
              <span className="relative z-10 flex items-center gap-3">
                Explore Lifestacks.ai
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative container mx-auto px-4 md:px-0 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Why Lifestacks.ai?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Contextual Understanding</h3>
              <p className="text-gray-600 leading-relaxed">
                AI that truly understands your context, intent, and needs, providing relevant assistance when you need it most.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Behavioral Learning</h3>
              <p className="text-gray-600 leading-relaxed">
                Systems that learn and adapt from your behavior patterns, becoming more helpful over time.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Proactive Assistance</h3>
              <p className="text-gray-600 leading-relaxed">
                Intelligent systems that anticipate your needs and provide support before you even ask.
              </p>
            </div>
          </div>

          {/* Secondary CTA Section */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-center text-white shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Productivity?</h2>
            <p className="text-xl mb-8 text-purple-100">
              Join the future of personal AI and discover what Lifestacks.ai can do for you.
            </p>
            <a
              href="https://lifestacks.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <button className="bg-white text-purple-600 font-bold py-4 px-12 rounded-full text-lg shadow-xl transform transition-all duration-300 hover:scale-110 hover:shadow-2xl">
                Visit Lifestacks.ai →
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="relative container mx-auto px-4 md:px-0 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">About Personal AI OS</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Personal AI Operating Systems represent the next evolution in human-computer interaction. 
                Unlike traditional operating systems that require explicit commands, Personal AI OS learns 
                from your behavior, understands your context, and proactively assists you throughout your day.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                <strong>Lifestacks.ai</strong> is at the forefront of this revolution, building the 
                infrastructure and intelligence needed to make personal AI a reality. Through advanced 
                machine learning, natural language processing, and behavioral analysis, Lifestacks.ai 
                creates systems that truly understand and adapt to individual users.
              </p>
              <div className="mt-8">
                <a
                  href="https://lifestacks.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-700 transition-colors"
                >
                  Learn more at Lifestacks.ai
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating CTA (sticky bottom) */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 hidden md:block">
        <a
          href="https://lifestacks.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block"
        >
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110 flex items-center gap-3 animate-pulse hover:animate-none">
            <span className="font-bold">Explore Lifestacks.ai</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </a>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
