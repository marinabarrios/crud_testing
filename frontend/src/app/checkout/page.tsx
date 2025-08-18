'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Checkout from '@/components/Checkout'
import CheckoutSuccess from '@/components/CheckoutSuccess'
import AuthDebug from '@/components/AuthDebug'
import { Cart as CartType, Order } from '@/types/product'
import { useAppStore } from '@/lib/store'
import { cartService } from '@/lib/api'

export default function CheckoutPage() {
  const router = useRouter()
  const { isAuthenticated, cartItemCount, checkAuthStatus } = useAppStore()
  const [cart, setCart] = useState<CartType | null>(null)
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    // Verificar el estado de autenticación primero
    checkAuthStatus()
    setAuthChecked(true)
  }, [checkAuthStatus])

  useEffect(() => {
    // Solo proceder después de que se haya verificado la autenticación
    if (!authChecked) return

    if (!isAuthenticated) {
      // console.log('User not authenticated, redirecting to login')
      router.push('/login')
      return
    }

    fetchCart()
  }, [isAuthenticated, router, authChecked])

  const fetchCart = async () => {
    try {
      // console.log('Fetching cart, isAuthenticated:', isAuthenticated)
      // console.log('Token from localStorage:', localStorage.getItem('authToken'))
      
      const response = await cartService.getCart()
      const cartData = response.data
      
      if (cartData.items.length === 0) {
        router.push('/')
        return
      }
      setCart(cartData)
    } catch (error: any) {
      console.error('Error fetching cart:', error)
      // console.error('Error response:', error.response)
      if (error.response?.status === 401) {
        // console.log('401 error - redirecting to login')
        router.push('/login')
        return
      }
      setError('Error al cargar el carrito')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckoutComplete = (order: Order) => {
    setCompletedOrder(order)
  }

  const handleCancel = () => {
    router.push('/')
  }

  const handleContinueShopping = () => {
    router.push('/')
  }

  const handleViewOrders = () => {
    router.push('/orders')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header cartItemCount={cartItemCount} onCartClick={() => {}} />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header cartItemCount={cartItemCount} onCartClick={() => {}} />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="card text-center">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => router.push('/')}
                className="btn-primary"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <AuthDebug /> */}
      <Header cartItemCount={cartItemCount} onCartClick={() => {}} />
      <main className="container mx-auto px-4 py-8">
        {completedOrder ? (
          <CheckoutSuccess
            order={completedOrder}
            onContinueShopping={handleContinueShopping}
            onViewOrders={handleViewOrders}
          />
        ) : cart ? (
          <Checkout
            cart={cart}
            onCheckoutComplete={handleCheckoutComplete}
            onCancel={handleCancel}
          />
        ) : null}
      </main>
    </div>
  )
}
