'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useEffect } from 'react'

const Logo = () => (
  <Link href="/" className="flex items-center gap-2">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-8 h-8 text-[#E55A2B]"
    >
      <path
        d="M10.894 2.553a1 1 0 00-1.789 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
      />
    </svg>

    <span className="text-xl font-bold text-gray-900">LaunchThatSong</span>
  </Link>
)

export default function Navbar() {
  const router = useRouter()
  const { cartItems } = useCart()
  const totalItems = Array.isArray(cartItems) ? cartItems.reduce((acc, item) => acc + item.voteCount, 0) : 0

  const scrollToHowItWorks = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/') {
        const element = document.querySelector('[data-section="how-it-works"]');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        window.location.href = '/#how-it-works';
      }
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#how-it-works') {
      setTimeout(() => {
        const el = document.querySelector('[data-section="how-it-works"]');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);

  return (
    <header className="sticky top-0 z-50 py-4 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto flex justify-between items-center px-4 md:px-0">
        <Logo />
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/report-issue" className="text-gray-700 hover:text-black transition-colors">
            Report Issue
          </Link>
          <a
            href="#how-it-works"
            onClick={scrollToHowItWorks}
            className="hover:text-black transition-colors bg-transparent border-none text-gray-700 cursor-pointer"
          >
            How It Works
          </a>
          <Link
            href="/login"
            className="bg-[#E55A2B] text-white font-semibold py-2 px-4 rounded-full hover:bg-[#D14A1B] transition-colors"
          >
            Login
          </Link>
          <Link href="/cart" className="relative hover:text-black transition-colors text-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.46-5.23c.18-.487.22-1.01.12-1.521a.75.75 0 00-.728-.654h-12.21l-1.581-5.927A.75.75 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  )
} 