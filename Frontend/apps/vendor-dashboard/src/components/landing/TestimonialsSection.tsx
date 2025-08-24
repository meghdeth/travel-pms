'use client'

import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Hotel Chain Owner',
    company: 'Luxury Stays Group',
    content: 'Bhramann has transformed how we manage our 15 properties. The unified dashboard and analytics have increased our efficiency by 60%.'
  },
  {
    name: 'Michael Chen',
    role: 'Operations Director',
    company: 'Urban Hostels Network',
    content: 'The bed management system is perfect for our hostel chain. We can track every bed across all locations in real-time.'
  }
]

export function TestimonialsSection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Trusted by Industry Leaders
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
              <div>
                <div className="font-semibold text-gray-900">{testimonial.name}</div>
                <div className="text-sm text-gray-600">{testimonial.role}</div>
                <div className="text-sm text-blue-600">{testimonial.company}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}