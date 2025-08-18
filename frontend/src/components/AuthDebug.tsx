'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'

export default function AuthDebug() {
  const { isAuthenticated, user, token, checkAuthStatus } = useAppStore()
  const [localStorageData, setLocalStorageData] = useState<any>({})

  useEffect(() => {
    checkAuthStatus()
    
    // Obtener datos del localStorage
    if (typeof window !== 'undefined') {
      setLocalStorageData({
        authToken: localStorage.getItem('authToken'),
        user: localStorage.getItem('user'),
        refreshToken: localStorage.getItem('refreshToken')
      })
    }
  }, [checkAuthStatus])

  return (
    <div className="fixed top-0 right-0 bg-black text-white p-4 text-xs z-50 max-w-xs">
      <div className="font-bold mb-2">Debug Auth Status</div>
      <div>Store isAuthenticated: {isAuthenticated ? 'true' : 'false'}</div>
      <div>Store user: {user ? user.username : 'null'}</div>
      <div>Store token: {token ? 'exists' : 'null'}</div>
      <div className="mt-2 font-bold">LocalStorage:</div>
      <div>authToken: {localStorageData.authToken ? 'exists' : 'null'}</div>
      <div>user: {localStorageData.user ? 'exists' : 'null'}</div>
      <div>refreshToken: {localStorageData.refreshToken ? 'exists' : 'null'}</div>
    </div>
  )
}
