import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// Configuración base de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => {
    // Guardar token de acceso si viene en la respuesta de login
    if (response.data?.access) {
      localStorage.setItem('authToken', response.data.access)
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Servicios de Productos
export const productService = {
  getAll: () => api.get('/products/'),
  getById: (id: number) => api.get(`/products/${id}/`),
  create: (data: any) => api.post('/products/', data),
  update: (id: number, data: any) => api.put(`/products/${id}/`, data),
  delete: (id: number) => api.delete(`/products/${id}/`),
  search: (query: string) => api.get(`/products/search/?q=${query}`),
}

// Servicios de Categorías
export const categoryService = {
  getAll: () => api.get('/categories/'),
  getById: (id: number) => api.get(`/categories/${id}/`),
  create: (data: any) => api.post('/categories/', data),
  update: (id: number, data: any) => api.put(`/categories/${id}/`, data),
  delete: (id: number) => api.delete(`/categories/${id}/`),
  getProducts: (id: number) => api.get(`/categories/${id}/products/`),
}

// Servicios de Usuarios
export const userService = {
  register: (data: any) => api.post('/users/register/', data),
  login: (data: any) => api.post('/users/login/', data),
  logout: (data: any) => api.post('/users/logout/', data),
  getProfile: () => api.get('/users/me/'),
  updateProfile: (data: any) => api.put('/users/me/', data),
}

// Servicios del Carrito
export const cartService = {
  getCart: () => api.get('/cart/my_cart/'),
  addItem: (productId: number, quantity: number = 1) =>
    api.post('/cart/add_item/', { product_id: productId, quantity }),
  removeItem: (productId: number) =>
    api.post('/cart/remove_item/', { product_id: productId }),
  checkout: (shippingAddress: string, paymentMethod: string) =>
    api.post('/cart/checkout/', { 
      shipping_address: shippingAddress, 
      payment_method: paymentMethod 
    }),
}

// Servicios de Pedidos
export const orderService = {
  getAll: () => api.get('/orders/'),
  getById: (id: number) => api.get(`/orders/${id}/`),
}

// Funciones utilitarias para autenticación
export const auth = {
  setTokens: (accessToken: string, refreshToken?: string) => {
    localStorage.setItem('authToken', accessToken)
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken)
    }
  },
  getAccessToken: () => localStorage.getItem('authToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  clearTokens: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('refreshToken')
  },
  isAuthenticated: () => !!localStorage.getItem('authToken'),
}

export default api
