'use client'

import { useState } from 'react'
import { Button } from 'ui'
import { Upload, Palette, Globe, Save, Eye } from 'lucide-react'

interface WhitelabelRequest {
  id?: string
  hotelName: string
  brandName: string
  primaryColor: string
  secondaryColor: string
  logo: File | null
  favicon: File | null
  customDomain: string
  brandingElements: {
    headerStyle: string
    footerContent: string
    welcomeMessage: string
  }
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  submittedAt?: string
  vendorResponse?: string
}

export default function WhitelabelingPage() {
  const [request, setRequest] = useState<WhitelabelRequest>({
    hotelName: '',
    brandName: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    logo: null,
    favicon: null,
    customDomain: '',
    brandingElements: {
      headerStyle: 'modern',
      footerContent: '',
      welcomeMessage: ''
    },
    status: 'draft'
  })

  const [preview, setPreview] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setRequest(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof WhitelabelRequest] as object),
          [child]: value
        }
      }))
    } else {
      setRequest(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0] || null
    setRequest(prev => ({ ...prev, [type]: file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Submit whitelabeling request to vendor
    const submittedRequest = {
      ...request,
      status: 'submitted' as const,
      submittedAt: new Date().toISOString()
    }
    console.log('Submitting whitelabeling request:', submittedRequest)
    // API call would go here
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Whitelabeling Request</h1>
          <p className="text-gray-600 mt-1">Customize your hotel's branding and request approval from your vendor</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={() => setPreview(!preview)}
            className="flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>{preview ? 'Edit' : 'Preview'}</span>
          </Button>
          <Button 
            onClick={handleSubmit}
            className="flex items-center space-x-2"
            disabled={request.status === 'submitted'}
          >
            <Save className="w-4 h-4" />
            <span>Submit Request</span>
          </Button>
        </div>
      </div>

      {!preview ? (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hotel Name
                </label>
                <input
                  type="text"
                  name="hotelName"
                  value={request.hotelName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your hotel name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name
                </label>
                <input
                  type="text"
                  name="brandName"
                  value={request.brandName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your brand name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Domain
                </label>
                <input
                  type="text"
                  name="customDomain"
                  value={request.customDomain}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="yourbrand.com"
                />
              </div>
            </div>
          </div>

          {/* Brand Colors */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Brand Colors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    name="primaryColor"
                    value={request.primaryColor}
                    onChange={handleInputChange}
                    className="w-12 h-10 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={request.primaryColor}
                    onChange={(e) => setRequest(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    name="secondaryColor"
                    value={request.secondaryColor}
                    onChange={handleInputChange}
                    className="w-12 h-10 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={request.secondaryColor}
                    onChange={(e) => setRequest(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Logo and Assets */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Brand Assets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload your logo</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'logo')}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload">
                    <Button type="button" variant="outline" size="sm">
                      Choose File
                    </Button>
                  </label>
                  {request.logo && (
                    <p className="text-sm text-green-600 mt-2">{request.logo.name}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Favicon
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload favicon (16x16 or 32x32)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'favicon')}
                    className="hidden"
                    id="favicon-upload"
                  />
                  <label htmlFor="favicon-upload">
                    <Button type="button" variant="outline" size="sm">
                      Choose File
                    </Button>
                  </label>
                  {request.favicon && (
                    <p className="text-sm text-green-600 mt-2">{request.favicon.name}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Branding Elements */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Branding Elements</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Header Style
                </label>
                <select
                  name="brandingElements.headerStyle"
                  value={request.brandingElements.headerStyle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="minimal">Minimal</option>
                  <option value="bold">Bold</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Welcome Message
                </label>
                <textarea
                  name="brandingElements.welcomeMessage"
                  value={request.brandingElements.welcomeMessage}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter a welcome message for your guests"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Footer Content
                </label>
                <textarea
                  name="brandingElements.footerContent"
                  value={request.brandingElements.footerContent}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter footer content (contact info, social links, etc.)"
                />
              </div>
            </div>
          </div>
        </form>
      ) : (
        // Preview Mode
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div 
            className="p-6 text-white"
            style={{ backgroundColor: request.primaryColor }}
          >
            <h2 className="text-2xl font-bold">{request.brandName || 'Your Brand Name'}</h2>
            <p className="mt-2">{request.brandingElements.welcomeMessage || 'Welcome to our hotel!'}</p>
          </div>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview of Your Branding</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: request.primaryColor }}
                ></div>
                <span>Primary Color: {request.primaryColor}</span>
              </div>
              <div className="flex items-center space-x-4">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: request.secondaryColor }}
                ></div>
                <span>Secondary Color: {request.secondaryColor}</span>
              </div>
              <div>
                <span>Header Style: {request.brandingElements.headerStyle}</span>
              </div>
              {request.customDomain && (
                <div>
                  <span>Custom Domain: {request.customDomain}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}