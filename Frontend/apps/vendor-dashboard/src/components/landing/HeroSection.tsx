'use client'

import { Button } from 'ui'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Scale Your Hospitality Business with
            <span className="text-blue-600"> Bhramann</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The complete property management solution for multi-hotel vendors. 
            Manage all your properties, bookings, and revenue from one powerful platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-3">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8 py-3">
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}