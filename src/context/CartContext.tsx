'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type VoiceComment = {
  songId: string
  songTitle: string
  artistId: string
  artistName: string
  audioData: string // Base64 encoded audio
  audioFilename: string
  commentId?: string // Supabase record ID if saved
}

export type CartItem = {
  songId: string
  songTitle: string
  artistId: string
  voteCount: number
  votePrice: number
  voiceComment?: VoiceComment
}

type CartContextType = {
  cartItems: CartItem[]
  lastVisitedArtist: string | null
  addToCart: (item: CartItem) => void
  removeFromCart: (songId: string) => void
  clearCart: () => void
  setLastVisitedArtist: (artistId: string) => void
  addVoiceComment: (songId: string, voiceComment: VoiceComment) => void
  removeVoiceComment: (songId: string) => void
  getVoiceComment: (songId: string) => VoiceComment | undefined
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [lastVisitedArtist, setLastVisitedArtistState] = useState<string | null>(null)

  useEffect(() => {
    const storedCart = localStorage.getItem('cart')
    if (storedCart) {
      setCartItems(JSON.parse(storedCart))
    }
    
    const storedLastArtist = localStorage.getItem('lastVisitedArtist')
    if (storedLastArtist) {
      setLastVisitedArtistState(storedLastArtist)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems))
  }, [cartItems])

  useEffect(() => {
    if (lastVisitedArtist) {
      localStorage.setItem('lastVisitedArtist', lastVisitedArtist)
    }
  }, [lastVisitedArtist])

  const addToCart = (item: CartItem) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.songId === item.songId)
      if (existing) {
        return prev.map(i =>
          i.songId === item.songId
            ? { ...i, voteCount: i.voteCount + (item.voteCount || 1) }
            : i
        )
      }
      return [...prev, { ...item, voteCount: item.voteCount || 1 }]
    })
  }

  const removeFromCart = (songId: string) => {
    setCartItems(prev => prev.filter(i => i.songId !== songId))
  }

  const clearCart = () => setCartItems([])

  const setLastVisitedArtist = (artistId: string) => {
    setLastVisitedArtistState(artistId)
  }

  const addVoiceComment = (songId: string, voiceComment: VoiceComment) => {
    setCartItems(prev => 
      prev.map(item => 
        item.songId === songId 
          ? { ...item, voiceComment }
          : item
      )
    )
  }

  const removeVoiceComment = (songId: string) => {
    setCartItems(prev => 
      prev.map(item => 
        item.songId === songId 
          ? { ...item, voiceComment: undefined }
          : item
      )
    )
  }

  const getVoiceComment = (songId: string) => {
    const item = cartItems.find(i => i.songId === songId)
    return item?.voiceComment
  }

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      lastVisitedArtist, 
      addToCart, 
      removeFromCart, 
      clearCart, 
      setLastVisitedArtist,
      addVoiceComment,
      removeVoiceComment,
      getVoiceComment
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}