'use client'

import { useState, useEffect } from 'react'
import { Button } from 'ui'
import { Home, Mail, Lock, AlertCircle, Users } from 'lucide-react'
import Link from 'next/link'
import { hotelAuthService } from 'shared/lib/hotelAuth'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'

export default function StaffLoginPage() {
  const router = useRouter()
  const { login: authLogin, user, isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Test credentials for staff roles
  const staffTestCredentials = [
    {
      role: 'Manager',
      email: 'manager@grandhotel.com',
      password: 'Manager123!',
      description: 'Hotel manager - operations and coordination'
    },
    {
      role: 'Front Desk',
      email: 'frontdesk@grandhotel.com', 
      password: 'FrontDesk123!',
      description: 'Front desk operations - check-in/out, guest services'
    },
    {
      role: 'Finance Department',
      email: 'finance@grandhotel.com',
      password: 'Finance123!', 
      description: 'Financial operations - billing, payments, reports'
    }
  ]

  // Auto-fill test credentials
  const fillTestCredentials = (email: string, password: string) => {
    setFormData({ email, password })
  }

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, user, router])

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
      // Direct API call to backend for staff login
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/staff/login`, {
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
        throw new Error(result.message || 'Staff login failed')
      }

      if (result.success && result.data) {
        // Store auth data in sessionStorage (more secure, no SSR issues)
        sessionStorage.setItem('hotel_token', result.data.token)
        sessionStorage.setItem('hotel_user', JSON.stringify(result.data.user))
        sessionStorage.setItem('hotel_id', result.data.user.hotelId)

        // Clear form and redirect to dashboard
        setFormData({ email: '', password: '' })
        setErrors({})
        
        console.log('Staff login successful:', result.data.user)
        router.push('/staffdashboard')
      } else {
        throw new Error(result.message || 'Staff login failed')
      }
    } catch (error: any) {
      console.error('Staff login error:', error)
      setErrors({ 
        submit: error.message || 'Staff login failed. Please check your credentials and try again.' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Users className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Staff Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Access your hotel staff dashboard
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
                  className={`appearance-none block w-full px-3 py-2 pl-10 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
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
                  className={`appearance-none block w-full px-3 py-2 pl-10 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
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
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in as Staff'}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Need hotel admin access?{' '}
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Admin Login
                </Link>
              </p>
            </div>
            
            <div className="text-center mt-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-3">Test Staff Credentials (Click to auto-fill):</p>
                <div className="space-y-2">
                  {staffTestCredentials.map((cred, index) => (
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