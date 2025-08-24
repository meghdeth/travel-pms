'use client'

import React, { useState, useEffect } from 'react'

export default function StorageTestPage() {
  const [storageData, setStorageData] = useState<any>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const checkStorage = async () => {
    addLog('🔍 Checking localStorage...')
    
    const data = {
      hotel_token: localStorage.getItem('hotel_token'),
      hotel_refresh_token: localStorage.getItem('hotel_refresh_token'),
      hotel_user: localStorage.getItem('hotel_user'),
      hotel_data: localStorage.getItem('hotel_data'),
      authToken: localStorage.getItem('authToken'),
      user: localStorage.getItem('user'),
      allKeys: Object.keys(localStorage)
    }
    
    addLog(`Found ${data.allKeys.length} localStorage keys: ${data.allKeys.join(', ')}`)
    
    let resultData: any = { ...data }
    if (data.hotel_user) {
      try {
        const parsedUser = JSON.parse(data.hotel_user)
        addLog(`✅ Parsed user data: ${JSON.stringify(parsedUser, null, 2)}`)
        addLog(`✅ User role: ${JSON.stringify(parsedUser.role)}`)
        resultData.parsedUser = parsedUser
      } catch (e) {
        addLog(`❌ Failed to parse user data: ${e}`)
      }
    } else {
      addLog('❌ No hotel_user data found in localStorage')
    }
    
    if (data.hotel_data) {
      try {
        const parsedHotel = JSON.parse(data.hotel_data)
        addLog(`✅ Parsed hotel data: ${JSON.stringify(parsedHotel, null, 2)}`)
        resultData.parsedHotel = parsedHotel
      } catch (e) {
        addLog(`❌ Failed to parse hotel data: ${e}`)
      }
    } else {
      addLog('❌ No hotel_data found in localStorage')
    }
    
    // Test hotelAuthService if data exists
    if (data.hotel_user || data.hotel_token) {
      try {
        const { hotelAuthService } = await import('shared/lib/hotelAuth')
        addLog(`🔍 hotelAuthService.getUser(): ${JSON.stringify(hotelAuthService.getUser())}`)
        addLog(`🔍 hotelAuthService.getToken(): ${hotelAuthService.getToken() ? 'Present' : 'null'}`)
        addLog(`🔍 hotelAuthService.isAuthenticated(): ${hotelAuthService.isAuthenticated()}`)
      } catch (e) {
        addLog(`❌ Error testing hotelAuthService: ${e}`)
      }
    }
    
  setStorageData(resultData)
  }

  const testLogin = async () => {
    addLog('🧪 Testing login...')
    
    try {
      const response = await fetch('http://localhost:3000/api/v1/hotel/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@grandhotel.com',
          password: 'Admin123!'
        })
      })
      
      const result = await response.json()
      addLog(`📡 Login response status: ${response.status}`)
      addLog(`📡 Login response: ${JSON.stringify(result, null, 2)}`)
      
      if (result.success && result.data) {
        // Store data in localStorage
        localStorage.setItem('hotel_token', result.data.token)
        localStorage.setItem('hotel_refresh_token', result.data.refreshToken)
        localStorage.setItem('hotel_user', JSON.stringify(result.data.user))
        localStorage.setItem('hotel_data', JSON.stringify(result.data.hotel))
        
        addLog('✅ Data stored in localStorage')
        addLog(`✅ User role stored: ${JSON.stringify(result.data.user.role)}`)
        
        // Test hotelAuthService methods
        const { hotelAuthService } = await import('shared/lib/hotelAuth')
        addLog(`🔍 hotelAuthService.getUser(): ${JSON.stringify(hotelAuthService.getUser())}`)
        addLog(`🔍 hotelAuthService.isAuthenticated(): ${hotelAuthService.isAuthenticated()}`)
        
        // Check storage again
        setTimeout(checkStorage, 500)
      } else {
        addLog(`❌ Login failed: ${result.message}`)
      }
    } catch (error) {
      addLog(`❌ Login error: ${error}`)
    }
  }

  const clearStorage = () => {
    localStorage.clear()
    addLog('🧹 Cleared localStorage')
    setStorageData(null)
    setLogs([])
  }

  useEffect(() => {
    checkStorage()
  }, [])

  const testAuthContext = async () => {
    addLog('🧪 Testing AuthContext...')
    try {
      const { useAuth } = await import('../../contexts/AuthContext')
      addLog('✅ AuthContext imported successfully')
    } catch (e) {
      addLog(`❌ Error importing AuthContext: ${e}`)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Storage Test</h1>
      
      <div className="flex gap-4 mb-6">
        <button 
          onClick={checkStorage}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Check Storage
        </button>
        <button 
          onClick={testLogin}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Test Login
        </button>
        <button 
          onClick={clearStorage}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Clear Storage
        </button>
        <button 
          onClick={testAuthContext}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          Test AuthContext
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logs */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Logs</h2>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>

        {/* Storage Data */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Storage Data</h2>
          {storageData ? (
            <div className="space-y-4">
              <div className="text-sm">
                <strong>Keys found:</strong> {storageData.allKeys.length}
              </div>
              
              {storageData.parsedUser && (
                <div>
                  <h3 className="font-bold mb-2">User Data:</h3>
                  <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(storageData.parsedUser, null, 2)}
                  </pre>
                </div>
              )}
              
              {storageData.parsedHotel && (
                <div>
                  <h3 className="font-bold mb-2">Hotel Data:</h3>
                  <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(storageData.parsedHotel, null, 2)}
                  </pre>
                </div>
              )}
              
              <div>
                <h3 className="font-bold mb-2">Raw Data:</h3>
                <div className="text-xs space-y-1">
                  <div><strong>hotel_token:</strong> {storageData.hotel_token ? 'Present' : 'Missing'}</div>
                  <div><strong>hotel_refresh_token:</strong> {storageData.hotel_refresh_token ? 'Present' : 'Missing'}</div>
                  <div><strong>hotel_user:</strong> {storageData.hotel_user ? 'Present' : 'Missing'}</div>
                  <div><strong>hotel_data:</strong> {storageData.hotel_data ? 'Present' : 'Missing'}</div>
                </div>
              </div>
            </div>
          ) : (
            <div>No data loaded</div>
          )}
        </div>
      </div>
    </div>
  )
}