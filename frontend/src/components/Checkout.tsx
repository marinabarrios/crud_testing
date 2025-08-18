'use client'

import { useState } from 'react'
import { Cart, Order } from '@/types/product'
import { parsePrice, formatSimplePrice } from '@/lib/utils'
import { cartService } from '@/lib/api'

interface CheckoutProps {
  cart: Cart
  onCheckoutComplete: (order: Order) => void
  onCancel: () => void
}

const paymentMethods = [
  { value: 'credit_card', label: 'Tarjeta de Crédito', icon: '💳' },
  { value: 'debit_card', label: 'Tarjeta de Débito', icon: '💳' },
  { value: 'paypal', label: 'PayPal', icon: '🅿️' },
  { value: 'bank_transfer', label: 'Transferencia Bancaria', icon: '🏦' },
  { value: 'cash_on_delivery', label: 'Pago Contra Entrega', icon: '💵' },
]

export default function Checkout({ cart, onCheckoutComplete, onCancel }: CheckoutProps) {
  const [shippingAddress, setShippingAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const totalPrice = cart.items.reduce((sum, item) => 
    sum + (parsePrice(item.product.price) * item.quantity), 0
  )

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    
    if (!shippingAddress.trim()) {
      newErrors.shippingAddress = 'La dirección de envío es requerida'
    }
    
    if (!paymentMethod) {
      newErrors.paymentMethod = 'Debe seleccionar un método de pago'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsProcessing(true)
    setErrors({})
    
    try {
      // Simulate API call delay for demo
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create the checkout request using cartService
      const response = await cartService.checkout(shippingAddress, paymentMethod)
      
      if (response.data.success) {
        onCheckoutComplete(response.data.order)
      } else {
        setErrors({ general: response.data.error || 'Error al procesar el pago' })
      }
    } catch (error: any) {
      console.error('Checkout error:', error)
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Error de conexión. Intente nuevamente.'
      setErrors({ general: errorMessage })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Resumen de Orden</h3>
          <div className="space-y-2">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.product.name}</span>
                <span>${(parsePrice(item.product.price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Shipping Address */}
          <div>
            <label htmlFor="shipping-address" className="block text-sm font-medium text-gray-700 mb-2">
              Dirección de Envío *
            </label>
            <textarea
              id="shipping-address"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.shippingAddress ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ingrese su dirección completa de envío..."
              disabled={isProcessing}
            />
            {errors.shippingAddress && (
              <p className="text-red-500 text-sm mt-1">{errors.shippingAddress}</p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Método de Pago *
            </label>
            <div className="grid grid-cols-1 gap-3">
              {paymentMethods.map((method) => (
                <label
                  key={method.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === method.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="radio"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="sr-only"
                    disabled={isProcessing}
                  />
                  <span className="text-2xl mr-3">{method.icon}</span>
                  <span className="text-sm font-medium text-gray-900">{method.label}</span>
                  {paymentMethod === method.value && (
                    <svg className="w-5 h-5 text-blue-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </label>
              ))}
            </div>
            {errors.paymentMethod && (
              <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>
            )}
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Demo Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-yellow-800 text-sm font-medium">Checkout de Demostración</p>
                <p className="text-yellow-700 text-sm">Este es un checkout ficticio. El pago se validará automáticamente sin procesamiento real.</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isProcessing}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </div>
              ) : (
                'Confirmar Pago'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
