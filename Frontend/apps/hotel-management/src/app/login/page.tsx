'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from 'ui'
import { Home, Mail, Lock, AlertCircle, Users, UserCheck, Shield, User, Phone } from 'lucide-react'
import Link from 'next/link'
import { hotelAuthService } from 'shared/lib/hotelAuth'
import { useRouter } from 'next/navigation'
import { hotelApiService, StaffMember } from '../../services/hotelApiService'
import { useAuth } from '../../contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { login: authLogin, user, isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loginType] = useState<'hotel'>('hotel')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [hotelUsers, setHotelUsers] = useState<StaffMember[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  // Test credentials for different roles
  const testCredentials = [
    {
      role: 'Hotel Admin',
      email: 'admin@grandhotel.com',
      password: 'Admin123!', 
      description: 'Hotel admin - full hotel management access'
    }
  ]

  // Auto-fill test credentials
  const fillTestCredentials = (email: string, password: string) => {
    setFormData({ email, password })
  }


  const loadHotelUsers = useCallback(async () => {
    try {
      setLoadingUsers(true)
      const hotelId = hotelAuthService.getHotelId()
      if (hotelId) {
        const users = await hotelApiService.getStaffMembers(hotelId)
        // Ensure users is always an array
        setHotelUsers(Array.isArray(users) ? users : [])
      }
    } catch (error) {
      console.error('Error loading hotel users:', error)
      setHotelUsers([]) // Set empty array on error
    } finally {
      setLoadingUsers(false)
    }
  }, [])

  // Handle user role check and navigation after login
  useEffect(() => {
    if (isLoggedIn && user) {
      setCurrentUser(user)
      // If user is admin, load and show hotel users
      if (user?.role?.name === 'Hotel Admin' || user?.role === '1') {
        loadHotelUsers()
      } else {
        // Redirect non-admin users to dashboard
        router.push('/dashboard')
      }
    }
  }, [user, isLoggedIn, router, loadHotelUsers])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    // Clear submit error when user modifies any field
    if (errors.submit) {
      setErrors(prev => ({ ...prev, submit: '' }))
    }
  }

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Use AuthContext to check authentication status
        if (isAuthenticated && user) {
          setCurrentUser(user);
          setIsLoggedIn(true);
          
          // If user is admin, load hotel users
          if (user?.role?.name === 'Hotel Admin' || user?.role === '1') {
            await loadHotelUsers();
          }
        } else {
          // Clear any invalid tokens on page load
          const token = hotelAuthService.getToken();
          if (token) {
            try {
              // Try to validate token by making a simple API call
              const storedUser = hotelAuthService.getUser();
              if (storedUser) {
                setCurrentUser(storedUser);
                setIsLoggedIn(true);
                
                // If user is admin, load hotel users
                if (storedUser?.role?.name === 'Hotel Admin' || storedUser?.role === '1') {
                  await loadHotelUsers();
                }
              }
            } catch (error) {
              // If token is invalid, clear it
              hotelAuthService.clearTokens();
            }
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    }
    checkAuthStatus()
  }, [isAuthenticated, user, loadHotelUsers])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    setErrors({})
    
    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.password.trim()) newErrors.password = 'Password is required'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setIsLoading(true)
    try {
      // Direct API call to backend for hotel admin login
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Hotel admin login failed')
      }

      if (result.success && result.data) {
        // Store auth data in sessionStorage (more secure, no SSR issues)
        sessionStorage.setItem('hotel_token', result.data.token)
        sessionStorage.setItem('hotel_user', JSON.stringify(result.data.user))
        sessionStorage.setItem('hotel_id', result.data.user.hotelId)

        // Clear form and redirect
        setFormData({ email: '', password: '' })
        setErrors({})
        setIsLoggedIn(true)
        setCurrentUser(result.data.user)
        
        console.log('Hotel admin login successful:', result.data.user)
        router.push('/admin-dashboard')
      } else {
        throw new Error(result.message || 'Hotel admin login failed')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      // Don't clear form data on error, just show error message
      setErrors({ 
        submit: error.message || 'Login failed. Please check your credentials and try again.' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await hotelAuthService.logout()
      console.log('Logout completed successfully')
    } catch (error) {
      console.warn('Logout completed with warnings:', error)
    } finally {
      setIsLoggedIn(false)
      setCurrentUser(null)
      setHotelUsers([])
      setFormData({ email: '', password: '' })
    }
  }

  const getRoleColor = (role: string) => {
    const roleColors: Record<string, string> = {
      'Hotel Admin': 'bg-red-100 text-red-800',
      'Manager': 'bg-purple-100 text-purple-800',
      'Finance Department': 'bg-green-100 text-green-800',
      'Front Desk': 'bg-blue-100 text-blue-800',
      'Booking Agent': 'bg-indigo-100 text-indigo-800',
      'Gatekeeper': 'bg-yellow-100 text-yellow-800',
      'Support': 'bg-pink-100 text-pink-800',
      'Tech Support': 'bg-cyan-100 text-cyan-800',
      'Service Boy': 'bg-orange-100 text-orange-800',
      'Maintenance': 'bg-gray-100 text-gray-800',
      'Kitchen': 'bg-emerald-100 text-emerald-800'
    }
    return roleColors[role] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      suspended: 'bg-yellow-100 text-yellow-800'
    }
    return statusColors[status] || 'bg-gray-100 text-gray-800'
  }

  // If user is logged in and is admin, show hotel users
  if (isLoggedIn && (currentUser?.role?.name === 'Hotel Admin' || currentUser?.role === '1')) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-8 h-8 text-blue-600" />
                    Hotel Users Management
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Welcome, {currentUser?.first_name} {currentUser?.last_name} - Viewing all hotel users
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => router.push('/dashboard')}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Home className="w-4 h-4" />
                    Dashboard
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Hotel Users List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">All Hotel Users</h2>
              <p className="text-sm text-gray-600">Total users: {hotelUsers?.length || 0}</p>
            </div>
            
            {loadingUsers ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading hotel users...</p>
              </div>
            ) : !hotelUsers || hotelUsers.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hotel users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.isArray(hotelUsers) && hotelUsers.map((user) => (
                      <tr key={user.hotel_user_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {user.hotel_user_id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center gap-1">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {user.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                            {user.role === 'Hotel Admin' || user.role === 'Manager' ? (
                              <Shield className="w-3 h-3" />
                            ) : (
                              <User className="w-3 h-3" />
                            )}
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                            <UserCheck className="w-3 h-3" />
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Home className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Hotel Admin Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Access your hotel management dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full px-3 py-2 pl-10 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full px-3 py-2 pl-10 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
              {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Login Failed</span>
                </div>
                <p className="text-sm text-red-700 mt-1">{errors.submit}</p>
              </div>
            )}

            <div>
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Staff member?{' '}
                <Link href="/staff/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Staff Login
                </Link>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Don't have an account?{' '}
                <Link href="/register" className="font-medium text-green-600 hover:text-green-500">
                  Register here
                </Link>
              </p>
            </div>
            
            <div className="text-center mt-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-3">Test Credentials (Click to auto-fill):</p>
                <div className="space-y-2">
                  {testCredentials.map((cred, index) => (
                    <div key={index} className="text-left">
                      <button
                        type="button"
                        onClick={() => fillTestCredentials(cred.email, cred.password)}
                        className="w-full text-left p-2 rounded border hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        disabled={isLoading}
                      >
                        <div className="text-xs font-medium text-gray-800">{cred.role}</div>
                        <div className="text-xs text-gray-600">{cred.email} / {cred.password}</div>
                        <div className="text-xs text-gray-500 mt-1">{cred.description}</div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}