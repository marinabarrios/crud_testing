'use client'

import { Order } from '@/types/product'
import { parsePrice } from '@/lib/utils'

interface CheckoutSuccessProps {
  order: Order
  onContinueShopping: () => void
  onViewOrders: () => void
}

const getPaymentMethodLabel = (method: string) => {
  const methods = {
    credit_card: 'Tarjeta de Crédito',
    debit_card: 'Tarjeta de Débito', 
    paypal: 'PayPal',
    bank_transfer: 'Transferencia Bancaria',
    cash_on_delivery: 'Pago Contra Entrega'
  }
  return methods[method as keyof typeof methods] || method
}

export default function CheckoutSuccess({ order, onContinueShopping, onViewOrders }: CheckoutSuccessProps) {
  const totalAmount = parsePrice(order.total_amount)
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="card text-center">
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Success Message */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Pago Exitoso!</h2>
        <p className="text-gray-600 mb-6">Su orden ha sido procesada y confirmada exitosamente.</p>

        {/* Order Details */}
        <div className="bg-gray-50 p-6 rounded-lg mb-6 text-left">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles de la Orden</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Número de Orden:</span>
              <span className="font-medium">#{order.id}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Estado:</span>
              <span className="inline-flex px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                {order.status === 'processing' ? 'Procesando' : order.status}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Método de Pago:</span>
              <span className="font-medium">{getPaymentMethodLabel(order.payment_method)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-bold text-lg">${totalAmount.toFixed(2)}</span>
            </div>
            
            <div className="pt-3 border-t">
              <span className="text-gray-600 block mb-2">Dirección de Envío:</span>
              <p className="text-sm text-gray-800 bg-white p-3 rounded border">
                {order.shipping_address}
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-gray-50 p-6 rounded-lg mb-6 text-left">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos Ordenados</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <div>
                  <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                  <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                </div>
                <span className="font-medium">${(parsePrice(item.price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h4 className="font-medium text-blue-900 mb-2">¿Qué sigue?</h4>
          <p className="text-sm text-blue-800">
            Recibirá un email de confirmación con los detalles de su orden. 
            Puede rastrear el estado de su pedido en la sección "Mis Órdenes".
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onContinueShopping}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Continuar Comprando
          </button>
          <button
            onClick={onViewOrders}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Ver Mis Órdenes
          </button>
        </div>
      </div>
    </div>
  )
}
