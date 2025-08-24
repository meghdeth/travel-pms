'use client'

import { useState, useEffect } from 'react'
import { Button } from 'ui'
import { Calculator, Info, Calendar, Users, Utensils } from 'lucide-react'

export interface PricingData {
  base_rate: number
  nights: number
  guests: number
  meal_plan: 'none' | 'breakfast' | 'half_board' | 'full_board'
  meal_cost: number
  tax_rate: number
  service_charge_rate: number
  discount_amount: number
  weekend_surcharge: number
  holiday_surcharge: number
  long_stay_discount: number
  currency: string
}

export interface PricingBreakdown {
  base_amount: number
  meal_amount: number
  weekend_surcharge_amount: number
  holiday_surcharge_amount: number
  subtotal: number
  long_stay_discount_amount: number
  discount_amount: number
  tax_amount: number
  service_charge_amount: number
  total_amount: number
}

interface PricingCalculatorProps {
  accommodationType: 'hotel' | 'dormitory'
  baseRate: number
  checkInDate: string
  checkOutDate: string
  guests: number
  onPricingChange: (pricing: PricingData, breakdown: PricingBreakdown) => void
  className?: string
}

const MEAL_PLANS = {
  none: { label: 'No Meals', basePrice: 0, description: 'Room only' },
  breakfast: { label: 'Breakfast Included', basePrice: 15, description: 'Continental breakfast' },
  half_board: { label: 'Half Board', basePrice: 35, description: 'Breakfast + Dinner' },
  full_board: { label: 'Full Board', basePrice: 55, description: 'All meals included' }
}

const SEASONAL_RATES = {
  peak: 1.3,      // 30% increase
  high: 1.15,     // 15% increase
  regular: 1.0,   // Base rate
  low: 0.85       // 15% discount
}

export default function PricingCalculator({
  accommodationType,
  baseRate,
  checkInDate,
  checkOutDate,
  guests,
  onPricingChange,
  className = ''
}: PricingCalculatorProps) {
  const [pricingData, setPricingData] = useState<PricingData>({
    base_rate: baseRate,
    nights: 1,
    guests: guests,
    meal_plan: 'none',
    meal_cost: 0,
    tax_rate: 10, // 10% tax
    service_charge_rate: 5, // 5% service charge
    discount_amount: 0,
    weekend_surcharge: accommodationType === 'hotel' ? 20 : 5,
    holiday_surcharge: accommodationType === 'hotel' ? 30 : 10,
    long_stay_discount: 10, // 10% for stays > 7 days
    currency: 'USD'
  })

  const [seasonalRate, setSeasonalRate] = useState<keyof typeof SEASONAL_RATES>('regular')
  const [isWeekend, setIsWeekend] = useState(false)
  const [isHoliday, setIsHoliday] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(false)

  // Calculate nights between dates
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate)
      const checkOut = new Date(checkOutDate)
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
      
      // Check if dates include weekend
      const includesWeekend = hasWeekendDays(checkIn, checkOut)
      
      setPricingData(prev => ({ ...prev, nights: Math.max(1, nights) }))
      setIsWeekend(includesWeekend)
    }
  }, [checkInDate, checkOutDate])

  // Update base rate when prop changes
  useEffect(() => {
    setPricingData(prev => ({ ...prev, base_rate: baseRate }))
  }, [baseRate])

  // Update guests when prop changes
  useEffect(() => {
    setPricingData(prev => ({ ...prev, guests }))
  }, [guests])

  const hasWeekendDays = (checkIn: Date, checkOut: Date): boolean => {
    const current = new Date(checkIn)
    while (current < checkOut) {
      const dayOfWeek = current.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
        return true
      }
      current.setDate(current.getDate() + 1)
    }
    return false
  }

  const calculatePricing = (): PricingBreakdown => {
    const { base_rate, nights, meal_plan, tax_rate, service_charge_rate, discount_amount, weekend_surcharge, holiday_surcharge, long_stay_discount } = pricingData
    
    // Apply seasonal rate
    const adjustedBaseRate = base_rate * SEASONAL_RATES[seasonalRate]
    
    // Calculate base amount
    const base_amount = adjustedBaseRate * nights
    
    // Calculate meal amount
    const mealPlanData = MEAL_PLANS[meal_plan]
    const meal_amount = mealPlanData.basePrice * nights * guests
    
    // Calculate surcharges
    const weekend_surcharge_amount = isWeekend ? weekend_surcharge * nights : 0
    const holiday_surcharge_amount = isHoliday ? holiday_surcharge * nights : 0
    
    // Calculate subtotal
    const subtotal = base_amount + meal_amount + weekend_surcharge_amount + holiday_surcharge_amount
    
    // Apply long stay discount (for stays > 7 days)
    const long_stay_discount_amount = nights > 7 ? (subtotal * long_stay_discount / 100) : 0
    
    // Apply manual discount
    const discounted_amount = subtotal - long_stay_discount_amount - discount_amount
    
    // Calculate tax and service charge
    const tax_amount = discounted_amount * (tax_rate / 100)
    const service_charge_amount = discounted_amount * (service_charge_rate / 100)
    
    // Calculate total
    const total_amount = discounted_amount + tax_amount + service_charge_amount
    
    return {
      base_amount,
      meal_amount,
      weekend_surcharge_amount,
      holiday_surcharge_amount,
      subtotal,
      long_stay_discount_amount,
      discount_amount,
      tax_amount,
      service_charge_amount,
      total_amount
    }
  }

  const breakdown = calculatePricing()

  // Update meal cost in pricing data
  useEffect(() => {
    const mealCost = MEAL_PLANS[pricingData.meal_plan].basePrice
    setPricingData(prev => ({ ...prev, meal_cost: mealCost }))
  }, [pricingData.meal_plan])

  // Notify parent of pricing changes
  useEffect(() => {
    onPricingChange(pricingData, breakdown)
  }, [pricingData, breakdown, onPricingChange])

  const handleInputChange = (field: keyof PricingData, value: any) => {
    setPricingData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Calculator className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">Dynamic Pricing Calculator</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="flex items-center space-x-1"
        >
          <Info className="w-4 h-4" />
          <span>{showBreakdown ? 'Hide' : 'Show'} Breakdown</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pricing Configuration */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Pricing Configuration</h4>
          
          {/* Base Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base Rate (per night)
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">$</span>
              <input
                type="number"
                value={pricingData.base_rate}
                onChange={(e) => handleInputChange('base_rate', parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Seasonal Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seasonal Rate
            </label>
            <select
              value={seasonalRate}
              onChange={(e) => setSeasonalRate(e.target.value as keyof typeof SEASONAL_RATES)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low Season (-15%)</option>
              <option value="regular">Regular Season</option>
              <option value="high">High Season (+15%)</option>
              <option value="peak">Peak Season (+30%)</option>
            </select>
          </div>

          {/* Meal Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Utensils className="w-4 h-4 inline mr-1" />
              Meal Plan
            </label>
            <select
              value={pricingData.meal_plan}
              onChange={(e) => handleInputChange('meal_plan', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(MEAL_PLANS).map(([key, plan]) => (
                <option key={key} value={key}>
                  {plan.label} {plan.basePrice > 0 && `(+$${plan.basePrice}/person/night)`}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {MEAL_PLANS[pricingData.meal_plan].description}
            </p>
          </div>

          {/* Surcharges and Discounts */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weekend Surcharge
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isWeekend}
                  onChange={(e) => setIsWeekend(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <input
                  type="number"
                  value={pricingData.weekend_surcharge}
                  onChange={(e) => handleInputChange('weekend_surcharge', parseFloat(e.target.value) || 0)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Holiday Surcharge
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isHoliday}
                  onChange={(e) => setIsHoliday(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <input
                  type="number"
                  value={pricingData.holiday_surcharge}
                  onChange={(e) => handleInputChange('holiday_surcharge', parseFloat(e.target.value) || 0)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Tax and Service Charge */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                value={pricingData.tax_rate}
                onChange={(e) => handleInputChange('tax_rate', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
                max="100"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Charge (%)
              </label>
              <input
                type="number"
                value={pricingData.service_charge_rate}
                onChange={(e) => handleInputChange('service_charge_rate', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          </div>

          {/* Manual Discount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manual Discount ($)
            </label>
            <input
              type="number"
              value={pricingData.discount_amount}
              onChange={(e) => handleInputChange('discount_amount', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Pricing Summary</h4>
          
          {/* Stay Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Stay Details</span>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Nights:</span>
                <span>{pricingData.nights}</span>
              </div>
              <div className="flex justify-between">
                <span>Guests:</span>
                <span>{pricingData.guests}</span>
              </div>
              <div className="flex justify-between">
                <span>Accommodation:</span>
                <span className="capitalize">{accommodationType}</span>
              </div>
            </div>
          </div>

          {/* Total Amount */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total Amount</span>
              <span className="text-2xl font-bold text-blue-600">
                ${breakdown.total_amount.toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              ${(breakdown.total_amount / pricingData.nights).toFixed(2)} per night
            </p>
          </div>

          {/* Long Stay Discount Notice */}
          {pricingData.nights > 7 && (
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                🎉 Long stay discount applied! Save ${breakdown.long_stay_discount_amount.toFixed(2)} for stays over 7 nights.
              </p>
            </div>
          )}

          {/* Pricing Breakdown */}
          {showBreakdown && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-3">Detailed Breakdown</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base Rate ({pricingData.nights} nights):</span>
                  <span>${breakdown.base_amount.toFixed(2)}</span>
                </div>
                
                {breakdown.meal_amount > 0 && (
                  <div className="flex justify-between">
                    <span>Meals ({MEAL_PLANS[pricingData.meal_plan].label}):</span>
                    <span>${breakdown.meal_amount.toFixed(2)}</span>
                  </div>
                )}
                
                {breakdown.weekend_surcharge_amount > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Weekend Surcharge:</span>
                    <span>+${breakdown.weekend_surcharge_amount.toFixed(2)}</span>
                  </div>
                )}
                
                {breakdown.holiday_surcharge_amount > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Holiday Surcharge:</span>
                    <span>+${breakdown.holiday_surcharge_amount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t pt-2">
                  <div className="flex justify-between font-medium">
                    <span>Subtotal:</span>
                    <span>${breakdown.subtotal.toFixed(2)}</span>
                  </div>
                </div>
                
                {breakdown.long_stay_discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Long Stay Discount:</span>
                    <span>-${breakdown.long_stay_discount_amount.toFixed(2)}</span>
                  </div>
                )}
                
                {breakdown.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Manual Discount:</span>
                    <span>-${breakdown.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Tax ({pricingData.tax_rate}%):</span>
                  <span>${breakdown.tax_amount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Service Charge ({pricingData.service_charge_rate}%):</span>
                  <span>${breakdown.service_charge_amount.toFixed(2)}</span>
                </div>
                
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${breakdown.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}