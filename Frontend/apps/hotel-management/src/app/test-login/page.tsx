'use client'

import { useState } from 'react'
import { hotelAuthService } from '@shared/lib/hotelAuth'

export default function TestLoginPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      console.log('🧪 Starting test login...')
      
      // Clear any existing data first
      localStorage.clear()
      console.log('🧹 Cleared localStorage')
      
      // Perform login
      const loginResult = await hotelAuthService.login({
        email: 'admin@grandhotel.com',
        password: 'Admin123!'
      })
      
      console.log('✅ Login successful:', loginResult)
      
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
      
      // Test auth service methods
      const isAuth = hotelAuthService.isAuthenticated()
      const user = hotelAuthService.getUser()
      const hotel = hotelAuthService.getHotel()
      const userRole = hotelAuthService.getUserRole()
      
      setResult({
        success: true,
        loginResult,
        localStorage: {
          hotel_token: tokenAfterLogin ? 'Present' : 'Missing',
          hotel_user: userAfterLogin ? JSON.parse(userAfterLogin) : null,
          hotel_data: hotelAfterLogin ? JSON.parse(hotelAfterLogin) : null,
          hotel_refresh_token: refreshTokenAfterLogin ? 'Present' : 'Missing'
        },
        authService: {
          isAuthenticated: isAuth,
          user: user,
          hotel: hotel,
          userRole: userRole
        }
      })
      
    } catch (error) {
      console.error('❌ Login failed:', error)
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Login Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <button
            onClick={testLogin}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded"
          >
            {loading ? 'Testing Login...' : 'Test Login with admin@grandhotel.com'}
          </button>
        </div>
        
        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              {result.success ? '✅ Login Test Results' : '❌ Login Test Failed'}
            </h2>
            
            {result.success ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-green-600">Login Result:</h3>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(result.loginResult, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h3 className="font-semibold text-blue-600">localStorage Contents:</h3>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(result.localStorage, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h3 className="font-semibold text-purple-600">Auth Service State:</h3>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(result.authService, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-red-600">
                <p>Error: {result.error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}