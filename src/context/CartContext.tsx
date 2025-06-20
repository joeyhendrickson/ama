'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type CartItem = {
  songId: string
  songTitle: string
  artistId: string
  voteCount: number
  votePrice: number
}

type CartContextType = {
  cartItems: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (songId: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  const addToCart = (item: CartItem) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.songId === item.songId)
      if (existing) {
        return prev.map(i =>
          i.songId === item.songId
            ? { ...i, voteCount: i.voteCount + item.voteCount }
            : i
        )
      }
      return [...prev, item]
    })
  }

  const removeFromCart = (songId: string) => {
    setCartItems(prev => prev.filter(i => i.songId !== songId))
  }

  const clearCart = () => setCartItems([])

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}