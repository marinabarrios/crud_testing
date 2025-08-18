'use client'

import { useState, useEffect } from 'react'
import ProductCard from './ProductCard'
import { Product } from '@/types/product'
import { productService } from '@/lib/api'

interface ProductGridProps {
  onAddToCart: (product: Product) => void
}

export default function ProductGrid({ onAddToCart }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await productService.getAll()
      console.log('Products loaded:', response.data)
      
      // Si la respuesta es paginada, usar results, sino usar directamente data
      const productsData = response.data.results || response.data
      setProducts(productsData)
    } catch (err: any) {
      console.error('Error loading products:', err)
      setError(
        err.response?.data?.message || 
        err.message || 
        'Error al cargar los productos. Verifique que el backend esté ejecutándose.'
      )
    } finally {
      setLoading(false)
    }
  }

  const retryFetch = () => {
    setError(null)
    fetchProducts()
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-red-600 text-lg mb-2">⚠️ Error de Conexión</div>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="space-y-2">
            <button 
              onClick={retryFetch}
              className="btn-primary w-full"
            >
              Reintentar
            </button>
            <p className="text-sm text-gray-600">
              Asegúrese de que el backend esté ejecutándose en localhost:8000
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Productos Disponibles</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
      
      {products.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay productos disponibles</p>
        </div>
      )}
    </div>
  )
}
