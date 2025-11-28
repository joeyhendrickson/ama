'use client'

import Link from 'next/link'
import { useState } from 'react'

const Logo = () => (
  <Link href="/" className="flex items-center gap-2">
    <span className="text-xl font-bold text-gray-900">Joey Hendrickson</span>
  </Link>
)

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 py-4 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto flex justify-between items-center px-4 md:px-0">
        <Logo />
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-gray-700 hover:text-black transition-colors">
            Home
          </Link>
          <Link href="/consultant" className="text-gray-700 hover:text-black transition-colors">
            Consultant
          </Link>
          <Link href="/projects" className="text-gray-700 hover:text-black transition-colors">
            Projects
          </Link>
          <Link href="/founder" className="text-gray-700 hover:text-black transition-colors">
            Founder
          </Link>
          <Link href="/personal-ai-os" className="text-gray-700 hover:text-black transition-colors">
            Personal AI OS
          </Link>
          <Link href="/speaker" className="text-gray-700 hover:text-black transition-colors">
            Speaker
          </Link>
          <Link href="/music" className="text-gray-700 hover:text-black transition-colors">
            Music
          </Link>
          <Link href="/travel-santa-marta" className="text-gray-700 hover:text-black transition-colors">
            Travel Santa Marta
          </Link>
          <a
            href="/#contact"
            className="text-gray-700 hover:text-black transition-colors"
          >
            Contact
          </a>
        </nav>

        {/* Mobile Hamburger Menu */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Sidebar Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2"
                >
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <nav className="space-y-4">
                <Link 
                  href="/" 
                  className="block bg-black text-white font-semibold py-2 px-4 rounded-full hover:bg-gray-800 transition-colors text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  href="/consultant" 
                  className="block bg-black text-white font-semibold py-2 px-4 rounded-full hover:bg-gray-800 transition-colors text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Consultant
                </Link>
                <Link 
                  href="/projects" 
                  className="block bg-black text-white font-semibold py-2 px-4 rounded-full hover:bg-gray-800 transition-colors text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Projects
                </Link>
                <Link 
                  href="/founder" 
                  className="block bg-black text-white font-semibold py-2 px-4 rounded-full hover:bg-gray-800 transition-colors text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Founder
                </Link>
                <Link 
                  href="/personal-ai-os" 
                  className="block bg-black text-white font-semibold py-2 px-4 rounded-full hover:bg-gray-800 transition-colors text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Personal AI OS
                </Link>
                <Link 
                  href="/speaker" 
                  className="block bg-black text-white font-semibold py-2 px-4 rounded-full hover:bg-gray-800 transition-colors text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Speaker
                </Link>
                <Link 
                  href="/music" 
                  className="block bg-black text-white font-semibold py-2 px-4 rounded-full hover:bg-gray-800 transition-colors text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Music
                </Link>
                <Link 
                  href="/travel-santa-marta" 
                  className="block bg-black text-white font-semibold py-2 px-4 rounded-full hover:bg-gray-800 transition-colors text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Travel Santa Marta
                </Link>
                <Link 
                  href="/#contact" 
                  className="block bg-black text-white font-semibold py-2 px-4 rounded-full hover:bg-gray-800 transition-colors text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  )
} 