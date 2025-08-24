'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { hotelAuthService } from 'shared/lib/hotelAuth'

interface DebugInfo {
  localStorage: {
    hotel_token: string | null
    hotel_refresh_token: string | null
    hotel_user: string | null
    hotel_data: string | null
    parsedUser: any
  }
  authService: {
    isAuthenticated: boolean
    getUser: any
    getHotel: any
    getUserRole: string | null
  }
  authContext: {
    user: any
    hotel: any
    isAuthenticated: boolean
    isLoading: boolean
  }
}

export default function DebugAuthPage() {
  const { user, hotel, isAuthenticated, isLoading } = useAuth()
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [loginResult, setLoginResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    setLoginResult(null)
    
    try {
      console.log('🧪 Starting test login...')
      
      // Clear any existing data first
      localStorage.clear()
      console.log('🧹 Cleared localStorage')
      
      // Perform login
      const result = await hotelAuthService.login({
        email: 'admin@grandhotel.com',
        password: 'Admin123!'
      })
      
      console.log('✅ Login successful:', result)
      
      // Check what's in localStorage immediately after login
      const tokenAfterLogin = localStorage.getItem('hotel_token')
      const userAfterLogin = localStorage.getItem('hotel_user')
      const hotelAfterLogin = localStorage.getItem('hotel_data')
      const refreshTokenAfterLogin = localStorage.getItem('hotel_refresh_token')
      
      console.log('📦 localStorage after login:')
      console.log('  - hotel_token:', tokenAfterLogin ? 'Present' : 'Missing')
      console.log('  - hotel_user:', userAfterLogin ? 'Present' : 'Missing')
      console.log('  - hotel_data:', hotelAfterLogin ? 'Present' : 'Missing')
      console.log('  - hotel_refresh_token:', refreshTokenAfterLogin ? 'Present' : 'Missing')
      
      setLoginResult({
        success: true,
        result,
        localStorageAfter: {
          hotel_token: tokenAfterLogin ? 'Present' : 'Missing',
          hotel_user: userAfterLogin ? JSON.parse(userAfterLogin) : null,
          hotel_data: hotelAfterLogin ? JSON.parse(hotelAfterLogin) : null,
          hotel_refresh_token: refreshTokenAfterLogin ? 'Present' : 'Missing'
        }
      })
      
    } catch (error) {
      console.error('❌ Login failed:', error)
      setLoginResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userDataStr = localStorage.getItem('hotel_user')
      let parsedUser = null
      
      if (userDataStr) {
        try {
          parsedUser = JSON.parse(userDataStr)
        } catch (error) {
          console.error('Error parsing user data:', error)
        }
      }

      const info: DebugInfo = {
        localStorage: {
          hotel_token: localStorage.getItem('hotel_token'),
          hotel_refresh_token: localStorage.getItem('hotel_refresh_token'),
          hotel_user: localStorage.getItem('hotel_user'),
          hotel_data: localStorage.getItem('hotel_data'),
          parsedUser
        },
        authService: {
          isAuthenticated: hotelAuthService.isAuthenticated(),
          getUser: hotelAuthService.getUser(),
          getHotel: hotelAuthService.getHotel(),
          getUserRole: hotelAuthService.getUserRole()
        },
        authContext: {
          user,
          hotel,
          isAuthenticated,
          isLoading
        }
      }

      setDebugInfo(info)
      
      // Also log to console
      console.log('🔍 Debug Info:', info)
    }
  }, [user, hotel, isAuthenticated, isLoading])

  if (!debugInfo) {
    return <div className="p-8">Loading debug info...</div>
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Authentication Debug</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">localStorage Data</h2>
          <div className="space-y-2 text-sm">
            <div><strong>hotel_token:</strong> {debugInfo.localStorage.hotel_token ? 'Present' : 'Missing'}</div>
            <div><strong>hotel_refresh_token:</strong> {debugInfo.localStorage.hotel_refresh_token ? 'Present' : 'Missing'}</div>
            <div><strong>hotel_user:</strong> {debugInfo.localStorage.hotel_user ? 'Present' : 'Missing'}</div>
            <div><strong>hotel_data:</strong> {debugInfo.localStorage.hotel_data ? 'Present' : 'Missing'}</div>
          </div>
          
          {debugInfo.localStorage.parsedUser && (
            <div className="mt-4">
              <h3 className="font-bold mb-2">Parsed User Data:</h3>
              <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(debugInfo.localStorage.parsedUser, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-blue-100 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">AuthService Data</h2>
          <div className="space-y-2 text-sm">
            <div><strong>isAuthenticated:</strong> {debugInfo.authService.isAuthenticated.toString()}</div>
            <div><strong>getUserRole:</strong> {debugInfo.authService.getUserRole || 'null'}</div>
          </div>
          
          <div className="mt-4">
            <h3 className="font-bold mb-2">getUser():</h3>
            <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(debugInfo.authService.getUser, null, 2)}
            </pre>
          </div>
          
          <div className="mt-4">
            <h3 className="font-bold mb-2">getHotel():</h3>
            <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(debugInfo.authService.getHotel, null, 2)}
            </pre>
          </div>
        </div>

        <div className="bg-green-100 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">AuthContext Data</h2>
          <div className="space-y-2 text-sm">
            <div><strong>isAuthenticated:</strong> {debugInfo.authContext.isAuthenticated.toString()}</div>
            <div><strong>isLoading:</strong> {debugInfo.authContext.isLoading.toString()}</div>
          </div>
          
          <div className="mt-4">
            <h3 className="font-bold mb-2">User:</h3>
            <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(debugInfo.authContext.user, null, 2)}
            </pre>
          </div>
          
          <div className="mt-4">
            <h3 className="font-bold mb-2">Hotel:</h3>
            <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(debugInfo.authContext.hotel, null, 2)}
            </pre>
          </div>
        </div>

        <div className="bg-yellow-100 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Role Analysis</h2>
          {debugInfo.localStorage.parsedUser?.role ? (
            <div className="space-y-2 text-sm">
              <div><strong>Role Name:</strong> {debugInfo.localStorage.parsedUser.role.name || 'undefined'}</div>
              <div><strong>Role Code:</strong> {debugInfo.localStorage.parsedUser.role.code || 'undefined'}</div>
              <div><strong>Is Admin:</strong> {debugInfo.localStorage.parsedUser.role.isAdmin?.toString() || 'undefined'}</div>
              <div><strong>Role Type:</strong> {typeof debugInfo.localStorage.parsedUser.role}</div>
            </div>
          ) : (
            <div className="text-red-600">No role data found in localStorage</div>
          )}
        </div>
      </div>
      
      <div className="bg-purple-100 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Test Login</h2>
        <div className="space-y-4">
          <button 
            onClick={testLogin}
            disabled={loading}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
          >
            {loading ? 'Testing Login...' : 'Test Login (admin@grandhotel.com)'}
          </button>
          
          {loginResult && (
            <div className="mt-4">
              <h3 className="font-bold mb-2">Login Test Result:</h3>
              <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-60">
                {JSON.stringify(loginResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8">
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh Debug Info
        </button>
      </div>
    </div>
  )
}