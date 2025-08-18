export interface UserProfile {
  phone: string
  address: string
  city: string
  postal_code: string
  country: string
}

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  profile: UserProfile
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  password_confirm: string
  first_name: string
  last_name: string
}
