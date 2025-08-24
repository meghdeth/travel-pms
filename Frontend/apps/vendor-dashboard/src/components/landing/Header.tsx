'use client'

import { Button } from 'ui'
import { Building2 } from 'lucide-react'
import Link from 'next/link'

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Building2 className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Bhramann</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}