'use client'

import { Header } from '../../components/landing/Header'
import { HeroSection } from '../../components/landing/HeroSection'
import { FeaturesSection } from '../../components/landing/FeaturesSection'
import { BenefitsSection } from '../../components/landing/BenefitsSection'
import { TestimonialsSection } from '../../components/landing/TestimonialsSection'
import { CTASection } from '../../components/landing/CTASection'
import { Footer } from '../../components/landing/Footer'

export default function VendorLanding() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <BenefitsSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  )
}