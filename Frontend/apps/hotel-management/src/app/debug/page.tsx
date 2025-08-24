'use client'

import { useEffect, useState } from 'react'
import { hotelAuthService } from 'shared/lib/hotelAuth'
import { useAuth } from '../../contexts/AuthContext'

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('hotel_token')
      const userData = localStorage.getItem('hotel_user')
      const hotelData = localStorage.getItem('hotel_data')
      const isAuth = hotelAuthService.isAuthenticated()
      const serviceUser = hotelAuthService.getUser()
      const userRole = hotelAuthService.getUserRole()

      setDebugInfo({
        localStorage: {
          token: token ? 'Present' : 'Missing',
          userData: userData,
          hotelData: hotelData,
          parsedUser: userData ? JSON.parse(userData) : null
        },
        hotelAuthService: {
          isAuthenticated: isAuth,
          user: serviceUser,
          userRole: userRole
        },
        authContext: {
          user: user,
          isAuthenticated: isAuthenticated
        }
      })
    }

    checkAuth()
    // Check every 2 seconds
    const interval = setInterval(checkAuth, 2000)
    return () => clearInterval(interval)
  }, [user, isAuthenticated])

  const handleLogin = async () => {
    try {
      console.log('🔍 [Debug] Starting login test...')
      const result = await hotelAuthService.login({
        email: 'admin@grandhotel.com',
        password: 'Admin123!'
      })
      console.log('🔍 [Debug] Login result:', result)
    } catch (error) {
      console.error('🔍 [Debug] Login error:', error)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Debug Page</h1>
      
      <button 
        onClick={handleLogin}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Test Login
      </button>

      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold">LocalStorage Data:</h2>
          <pre className="text-sm">{JSON.stringify(debugInfo.localStorage, null, 2)}</pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold">HotelAuthService:</h2>
          <pre className="text-sm">{JSON.stringify(debugInfo.hotelAuthService, null, 2)}</pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold">AuthContext:</h2>
          <pre className="text-sm">{JSON.stringify(debugInfo.authContext, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}