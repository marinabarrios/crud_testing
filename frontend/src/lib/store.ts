import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product, User } from '@/types'
import { cartService } from '@/lib/api'
import { parsePrice } from '@/lib/utils'

interface AppState {
  // Auth state
  user: User | null
  isAuthenticated: boolean
  token: string | null
  
  // Cart state
  cartItems: Product[]
  cartTotal: number
  cartItemCount: number
  
  // UI state
  isLoading: boolean
  error: string | null
  
  // Actions
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  login: (user: User, token: string) => void
  logout: () => void
  checkAuthStatus: () => void
  
  addToCart: (product: Product) => void
  removeFromCart: (productId: number) => void
  updateCartQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  syncCartWithBackend: () => Promise<void>
  addToCartBackend: (productId: number, quantity?: number) => Promise<void>
  updateCartTotals: () => void
  
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      token: null,
      cartItems: [],
      cartTotal: 0,
      cartItemCount: 0,
      isLoading: false,
      error: null,

      // Auth actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      login: (user, token) => {
        // Guardar en localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(user))
        }
        
        set({ 
          user, 
          token, 
          isAuthenticated: true,
          error: null 
        })
      },
      logout: () => {
        // Limpiar tokens y datos del usuario
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
        }
        
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          cartItems: [],
          cartTotal: 0,
          cartItemCount: 0 
        })
      },

      checkAuthStatus: () => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('authToken')
          const user = localStorage.getItem('user')
          
          // console.log('Checking auth status:', { token: !!token, user: !!user })
          
          if (token && user) {
            try {
              const parsedUser = JSON.parse(user)
              // console.log('Setting authenticated state with user:', parsedUser)
              set({
                token,
                user: parsedUser,
                isAuthenticated: true
              })
            } catch (error) {
              console.error('Error parsing stored user:', error)
              // Limpiar datos corruptos
              localStorage.removeItem('authToken')
              localStorage.removeItem('refreshToken')
              localStorage.removeItem('user')
            }
          } else {
            // console.log('No valid token or user found in localStorage')
            set({
              token: null,
              user: null,
              isAuthenticated: false
            })
          }
        }
      },

      // Cart actions
      addToCart: (product) => {
        const { cartItems } = get()
        const existingItem = cartItems.find(item => item.id === product.id)
        
        if (existingItem) {
          const updatedItems = cartItems.map(item =>
            item.id === product.id
              ? { ...item, quantity: (item.quantity || 0) + 1 }
              : item
          )
          set({ cartItems: updatedItems })
        } else {
          const newItem = { ...product, quantity: 1 }
          set({ cartItems: [...cartItems, newItem] })
        }
        
        // Update totals
        get().updateCartTotals()
      },

      removeFromCart: (productId) => {
        const { cartItems } = get()
        const updatedItems = cartItems.filter(item => item.id !== productId)
        set({ cartItems: updatedItems })
        get().updateCartTotals()
      },

      updateCartQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId)
          return
        }
        
        const { cartItems } = get()
        const updatedItems = cartItems.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
        set({ cartItems: updatedItems })
        get().updateCartTotals()
      },

      clearCart: () => set({ 
        cartItems: [], 
        cartTotal: 0, 
        cartItemCount: 0 
      }),

      // Backend cart sync
      syncCartWithBackend: async () => {
        const { isAuthenticated } = get()
        if (!isAuthenticated) return

        try {
          const response = await cartService.getCart()
          const backendCart = response.data
          
          if (backendCart?.items) {
            const cartItems: Product[] = backendCart.items.map((item: any) => ({
              ...item.product,
              quantity: item.quantity
            }))
            set({ cartItems })
            get().updateCartTotals()
          }
        } catch (error) {
          console.error('Error syncing cart:', error)
        }
      },

      addToCartBackend: async (productId: number, quantity = 1) => {
        const { isAuthenticated, addToCart } = get()
        
        if (!isAuthenticated) {
          // Si no está autenticado, solo agregar localmente
          const product = { id: productId } as Product // Temporal hasta obtener producto completo
          addToCart(product)
          return
        }

        try {
          set({ isLoading: true })
          await cartService.addItem(productId, quantity)
          await get().syncCartWithBackend()
        } catch (error: any) {
          console.error('Error adding to cart:', error)
          set({ 
            error: error.response?.data?.message || 'Error al agregar al carrito' 
          })
        } finally {
          set({ isLoading: false })
        }
      },

      // Helper function to update cart totals
      updateCartTotals: () => {
        const { cartItems } = get()
        const total = cartItems.reduce((sum, item) => 
          sum + (parsePrice(item.price) * (item.quantity || 0)), 0
        )
        const count = cartItems.reduce((sum, item) => 
          sum + (item.quantity || 0), 0
        )
        set({ cartTotal: total, cartItemCount: count })
      },

      // UI actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'tienda-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        cartItems: state.cartItems,
      }),
    }
  )
)
