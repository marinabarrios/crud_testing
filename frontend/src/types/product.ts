export interface Category {
  id: number
  name: string
  description: string
  created_at: string
}

export interface Product {
  id: number
  name: string
  description: string
  price: number | string // Django DecimalField se serializa como string
  stock: number
  category: Category
  image?: string
  is_active: boolean
  created_at: string
  updated_at: string
  is_available: boolean
  quantity?: number
}

export interface CartItem {
  id: number
  product: Product
  quantity: number
  added_at: string
  total_price: number | string // Django DecimalField se serializa como string
}

export interface Cart {
  id: number
  user: number
  items: CartItem[]
  total_items: number
  total_price: number | string // Django DecimalField se serializa como string
  created_at: string
  updated_at: string
}

export interface Order {
  id: number
  user: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number | string // Django DecimalField se serializa como string
  shipping_address: string
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: number
  order: number
  product: Product
  quantity: number
  price: number | string // Django DecimalField se serializa como string
}
