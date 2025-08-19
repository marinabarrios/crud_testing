'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { useAppStore } from '@/lib/store'
import { orderService } from '@/lib/api'
import { Order } from '@/types/product'
import { formatSimplePrice, formatDate } from '@/lib/utils'

export default function OrdersPage() {
  const router = useRouter()
  const { isAuthenticated, user, cartItemCount } = useAppStore()
  
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    fetchOrders()
  }, [isAuthenticated, router])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await orderService.getAll()
      const ordersData = response.data.results || response.data
      setOrders(ordersData)
    } catch (err: any) {
      console.error('Error loading orders:', err)
      setError('Error al cargar las órdenes')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente'
      case 'processing': return 'Procesando'
      case 'shipped': return 'Enviado'
      case 'delivered': return 'Entregado'
      case 'cancelled': return 'Cancelado'
      default: return status
    }
  }

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'credit_card': return 'Tarjeta de Crédito'
      case 'debit_card': return 'Tarjeta de Débito'
      case 'paypal': return 'PayPal'
      case 'bank_transfer': return 'Transferencia Bancaria'
      case 'cash_on_delivery': return 'Pago Contra Entrega'
      default: return method
    }
  }

  if (!isAuthenticated) {
    return null // El useEffect redirigirá
  }

  if (loading) {
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
          <div className="text-center py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="text-red-600 text-lg mb-2">⚠️ Error</div>
              <p className="text-red-700 mb-4">{error}</p>
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => router.push('/')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Volver al Inicio
                </button>
                <button 
                  onClick={fetchOrders}
                  className="btn-primary"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartItemCount={cartItemCount} onCartClick={() => {}} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          {/* Botón de regresar */}
          <button
            onClick={() => router.push('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Inicio
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mis Órdenes
          </h1>
          <p className="text-gray-600">
            Historial de compras de {user?.first_name || user?.username}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow p-8 max-w-md mx-auto">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tienes órdenes aún
              </h3>
              <p className="text-gray-500 mb-4">
                Cuando realices una compra, aparecerá aquí
              </p>
              <button
                onClick={() => router.push('/')}
                className="btn-primary"
              >
                Explorar Productos
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Orden #{order.id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      <div className="text-lg font-bold text-gray-900">
                        {formatSimplePrice(order.total_amount)}
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Dirección de Envío:
                      </h4>
                      <p className="text-sm text-gray-600">
                        {order.shipping_address}
                      </p>
                    </div>
                    {order.payment_method && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Método de Pago:
                        </h4>
                        <p className="text-sm text-gray-600">
                          {getPaymentMethodText(order.payment_method)}
                        </p>
                      </div>
                    )}
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div className="border-t pt-4 mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Productos ({order.items.length}):
                      </h4>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {item.product.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                Cantidad: {item.quantity}
                              </p>
                            </div>
                            <div className="text-sm text-gray-900">
                              {formatSimplePrice(item.price)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
