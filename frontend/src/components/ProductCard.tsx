'use client'

import { Product } from '@/types/product'
import { formatSimplePrice } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      {/* Product Image */}
      <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="text-gray-400 text-4xl">
            📦
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {product.category.name}
          </p>
        </div>

        <p className="text-gray-600 text-sm line-clamp-3">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-primary-600">
            {formatSimplePrice(product.price)}
          </div>
          <div className="text-sm text-gray-500">
            Stock: {product.stock}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart(product)}
          disabled={!product.is_available || product.stock === 0}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
            product.is_available && product.stock > 0
              ? 'btn-primary'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {product.is_available && product.stock > 0
            ? 'Agregar al Carrito'
            : 'Sin Stock'
          }
        </button>
      </div>
    </div>
  )
}
