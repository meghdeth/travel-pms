'use client'

import React, { useState, useEffect } from 'react'
import { hotelAuthService } from 'shared/lib/hotelAuth'
import { useAuth } from '../../contexts/AuthContext'

export default function AuthDebugPage() {
  const [debugData, setDebugData] = useState<any>(null)
  const { user, hotel, isAuthenticated, isLoading, refreshAuth } = useAuth()

  const checkAuthData = () => {
    const token = hotelAuthService.getToken()
    const userData = hotelAuthService.getUser()
    const hotelData = hotelAuthService.getHotel()
    const isAuth = hotelAuthService.isAuthenticated()

    const data = {
      localStorage: {
        token: token ? `${token.substring(0, 20)}...` : null,
        userData: userData,
        hotelData: hotelData,
        rawUserData: localStorage.getItem('hotel_user'),
        rawHotelData: localStorage.getItem('hotel_data'),
        rawToken: localStorage.getItem('hotel_token')
      },
      hotelAuthService: {
        isAuthenticated: isAuth,
        getUser: userData,
        getHotel: hotelData
      },
      authContext: {
        user: user,
        hotel: hotel,
        isAuthenticated: isAuthenticated,
        isLoading: isLoading
      }
    }

    setDebugData(data)
    console.log('🔍 [AuthDebug] Complete debug data:', data)
  }

  useEffect(() => {
    checkAuthData()
  }, [user, hotel, isAuthenticated])

  const handleRefreshAuth = () => {
    console.log('🔄 [AuthDebug] Manually refreshing auth...')
    refreshAuth()
    setTimeout(checkAuthData, 1000)
  }

  const handleClearStorage = () => {
    localStorage.clear()
    console.log('🧹 [AuthDebug] Cleared localStorage')
    checkAuthData()
  }

  const handleTestLogin = async () => {
    try {
      console.log('🧪 [AuthDebug] Testing login...')
      const result = await hotelAuthService.login({
        email: 'admin@grandhotel.com',
        password: 'Admin123!'
      })
      console.log('✅ [AuthDebug] Login successful:', result)
      setTimeout(checkAuthData, 1000)
    } catch (error) {
      console.error('❌ [AuthDebug] Login failed:', error)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="flex gap-4 mb-6">
        <button 
          onClick={checkAuthData}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh Debug Data
        </button>
        <button 
          onClick={handleRefreshAuth}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Refresh Auth Context
        </button>
        <button 
          onClick={handleTestLogin}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Test Login
        </button>
        <button 
          onClick={handleClearStorage}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Clear Storage
        </button>
      </div>

      {debugData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* localStorage Data */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-blue-800">localStorage</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Token:</strong> {debugData.localStorage.token || 'null'}</div>
              <div><strong>Raw Token:</strong> {debugData.localStorage.rawToken ? 'Present' : 'null'}</div>
              <div><strong>Raw User:</strong> {debugData.localStorage.rawUserData ? 'Present' : 'null'}</div>
              <div><strong>Raw Hotel:</strong> {debugData.localStorage.rawHotelData ? 'Present' : 'null'}</div>
            </div>
            
            {debugData.localStorage.userData && (
              <div className="mt-4">
                <h3 className="font-bold mb-2">Parsed User Data:</h3>
                <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(debugData.localStorage.userData, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* HotelAuthService Data */}
          <div className="bg-green-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-green-800">HotelAuthService</h2>
            <div className="space-y-2 text-sm">
              <div><strong>isAuthenticated():</strong> {debugData.hotelAuthService.isAuthenticated.toString()}</div>
              <div><strong>getUser():</strong> {debugData.hotelAuthService.getUser ? 'Present' : 'null'}</div>
              <div><strong>getHotel():</strong> {debugData.hotelAuthService.getHotel ? 'Present' : 'null'}</div>
            </div>
            
            {debugData.hotelAuthService.getUser && (
              <div className="mt-4">
                <h3 className="font-bold mb-2">User from Service:</h3>
                <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(debugData.hotelAuthService.getUser, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* AuthContext Data */}
          <div className="bg-yellow-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-yellow-800">AuthContext</h2>
            <div className="space-y-2 text-sm">
              <div><strong>isAuthenticated:</strong> {debugData.authContext.isAuthenticated.toString()}</div>
              <div><strong>isLoading:</strong> {debugData.authContext.isLoading.toString()}</div>
              <div><strong>user:</strong> {debugData.authContext.user ? 'Present' : 'null'}</div>
              <div><strong>hotel:</strong> {debugData.authContext.hotel ? 'Present' : 'null'}</div>
            </div>
            
            {debugData.authContext.user && (
              <div className="mt-4">
                <h3 className="font-bold mb-2">User from Context:</h3>
                <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(debugData.authContext.user, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {debugData?.localStorage.userData?.role && (
        <div className="mt-6 bg-purple-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-purple-800">Role Analysis</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Role Name:</strong> {debugData.localStorage.userData.role.name || 'undefined'}</div>
            <div><strong>Role Code:</strong> {debugData.localStorage.userData.role.code || 'undefined'}</div>
            <div><strong>Is Admin:</strong> {debugData.localStorage.userData.role.isAdmin?.toString() || 'undefined'}</div>
            <div><strong>Role Type:</strong> {typeof debugData.localStorage.userData.role}</div>
            <div><strong>Full Role Object:</strong></div>
            <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-20">
              {JSON.stringify(debugData.localStorage.userData.role, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}