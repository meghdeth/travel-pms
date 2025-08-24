'use client'

import { Building2, Users, TrendingUp, Shield } from 'lucide-react'

const features = [
  {
    icon: Building2,
    title: 'Multi-Property Management',
    description: 'Manage multiple hotels, hostels, and accommodations from a single dashboard'
  },
  {
    icon: Users,
    title: 'Guest Management',
    description: 'Comprehensive guest profiles, booking history, and personalized service'
  },
  {
    icon: TrendingUp,
    title: 'Revenue Analytics',
    description: 'Real-time revenue tracking, occupancy rates, and performance insights'
  },
  {
    icon: Shield,
    title: 'Secure Platform',
    description: 'Enterprise-grade security with data encryption and secure payment processing'
  }
]

export function FeaturesSection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Manage Multiple Properties
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From boutique hotels to hostel chains, our platform scales with your business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}