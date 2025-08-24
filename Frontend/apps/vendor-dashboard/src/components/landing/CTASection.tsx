'use client'

import { Button } from 'ui'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function CTASection() {
  return (
    <section className="bg-blue-600 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          Ready to Transform Your Business?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Join the Bhramann family and take your hospitality business to the next level. 
          Start your free trial today.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link href="/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3">
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3">
            Contact Sales
          </Button>
        </div>
      </div>
    </section>
  )
}