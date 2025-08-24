'use client'

import { CheckCircle, Star } from 'lucide-react'

const benefits = [
  'Increase direct bookings by up to 40%',
  'Reduce operational costs by 25%',
  'Automate routine tasks and workflows',
  'Access to 24/7 customer support',
  'Integration with major OTA platforms',
  'Mobile-responsive management tools'
]

export function BenefitsSection() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Why Choose Bhramann?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of successful hospitality businesses that trust Bhramann 
              to manage their operations and drive growth.
            </p>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-6">
              <Star className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900">4.9/5 Rating</h3>
              <p className="text-gray-600">From 500+ hospitality businesses</p>
            </div>
            <div className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">40%</div>
                <div className="text-sm text-gray-600">Increase in Direct Bookings</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">25%</div>
                  <div className="text-xs text-gray-600">Cost Reduction</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">60%</div>
                  <div className="text-xs text-gray-600">Time Saved</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}