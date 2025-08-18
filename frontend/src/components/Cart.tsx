'use client'

import { Product } from '@/types/product'
import { parsePrice, formatSimplePrice } from '@/lib/utils'

interface CartProps {
  items: Product[]
  onRemoveItem: (productId: number) => void
  onUpdateQuantity: (productId: number, quantity: number) => void
  onCheckout: () => void
}

export default function Cart({ items, onRemoveItem, onUpdateQuantity, onCheckout }: CartProps) {
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0)
  const totalPrice = items.reduce((sum, item) => sum + (parsePrice(item.price) * (item.quantity || 0)), 0)

  if (items.length === 0) {
    return (
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Carrito de Compras</h2>
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">🛒</div>
          <p className="text-gray-500">Tu carrito está vacío</p>
          <p className="text-gray-400 text-sm">Agrega algunos productos para comenzar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Carrito de Compras</h2>
      
      {/* Cart Items */}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            {/* Product Image */}
            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <span className="text-gray-400 text-lg">📦</span>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {item.name}
              </h4>
              <p className="text-sm text-gray-500">
                {formatSimplePrice(item.price)}
              </p>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) - 1)}
                className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
              >
                -
              </button>
              <span className="text-sm font-medium w-8 text-center">
                {item.quantity || 1}
              </span>
              <button
                onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
              >
                +
              </button>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => onRemoveItem(item.id)}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div className="border-t pt-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span>Total ({totalItems} items):</span>
          <span className="font-medium">${totalPrice.toFixed(2)}</span>
        </div>
        
        <button
          onClick={onCheckout}
          className="w-full btn-primary"
        >
          Proceder al Pago
        </button>
      </div>
    </div>
  )
}
