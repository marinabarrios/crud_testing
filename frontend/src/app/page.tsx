'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import ProductGrid from '@/components/ProductGrid'
import Cart from '@/components/Cart'
import { Product } from '@/types/product'
import { useAppStore } from '@/lib/store'

export default function Home() {
  const {
    cartItems,
    cartItemCount,
    isAuthenticated,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    syncCartWithBackend,
    addToCartBackend
  } = useAppStore()

  const [isCartOpen, setIsCartOpen] = useState(false)

  // Sincronizar carrito con backend al cargar la página si está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      syncCartWithBackend()
    }
  }, [isAuthenticated, syncCartWithBackend])

  const handleAddToCart = async (product: Product) => {
    if (isAuthenticated) {
      // Si está autenticado, usar la función que conecta con el backend
      await addToCartBackend(product.id, 1)
    } else {
      // Si no está autenticado, usar el carrito local
      addToCart(product)
    }
  }

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para realizar la compra')
      return
    }
    
    if (cartItems.length === 0) {
      alert('El carrito está vacío')
      return
    }
    
    // TODO: Implementar checkout real con backend
    alert('Funcionalidad de checkout en desarrollo')
    clearCart()
    setIsCartOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        cartItemCount={cartItemCount}
        onCartClick={() => setIsCartOpen(true)}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <ProductGrid onAddToCart={handleAddToCart} />
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <Cart
                items={cartItems}
                onRemoveItem={removeFromCart}
                onUpdateQuantity={updateCartQuantity}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Cart Modal for mobile */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="fixed right-0 top-0 h-full w-80 bg-white p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Carrito</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <Cart
              items={cartItems}
              onRemoveItem={removeFromCart}
              onUpdateQuantity={updateCartQuantity}
              onCheckout={() => {
                handleCheckout()
                setIsCartOpen(false)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
