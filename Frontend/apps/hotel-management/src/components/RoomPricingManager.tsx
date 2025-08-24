'use client'

import React, { useState } from 'react'
import { DollarSign, Calendar, TrendingUp, Save, RefreshCw } from 'lucide-react'
import { Button } from 'ui'

interface PricingRule {
  id: string
  name: string
  roomType: string
  baseRate: number
  seasonalMultiplier: number
  weekendMultiplier: number
  minimumStay?: number
  advanceBookingDiscount?: number
  lastMinuteMultiplier?: number
  dateRange?: {
    start: string
    end: string
  }
}

const mockPricingRules: PricingRule[] = [
  {
    id: '1',
    name: 'Standard Room - Regular Season',
    roomType: 'standard',
    baseRate: 100,
    seasonalMultiplier: 1.0,
    weekendMultiplier: 1.2,
    minimumStay: 1,
    advanceBookingDiscount: 0.1
  },
  {
    id: '2',
    name: 'Deluxe Room - Peak Season',
    roomType: 'deluxe',
    baseRate: 150,
    seasonalMultiplier: 1.5,
    weekendMultiplier: 1.3,
    minimumStay: 2,
    dateRange: {
      start: '2024-06-01',
      end: '2024-08-31'
    }
  },
  {
    id: '3',
    name: 'Suite - Holiday Premium',
    roomType: 'suite',
    baseRate: 300,
    seasonalMultiplier: 2.0,
    weekendMultiplier: 1.4,
    minimumStay: 3,
    lastMinuteMultiplier: 1.2
  }
]

export default function RoomPricingManager() {
  const [pricingRules, setPricingRules] = useState<PricingRule[]>(mockPricingRules)
  const [selectedRule, setSelectedRule] = useState<PricingRule | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  
  const handleSaveRule = (rule: PricingRule) => {
    if (selectedRule) {
      setPricingRules(prev => prev.map(r => r.id === rule.id ? rule : r))
    } else {
      setPricingRules(prev => [...prev, { ...rule, id: Date.now().toString() }])
    }
    setIsEditing(false)
    setSelectedRule(null)
  }
  
  const calculateFinalRate = (rule: PricingRule, isWeekend: boolean = false) => {
    let rate = rule.baseRate * rule.seasonalMultiplier
    if (isWeekend) {
      rate *= rule.weekendMultiplier
    }
    return Math.round(rate)
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Room Pricing Management</h2>
          <p className="text-gray-600">Manage room rates, seasonal pricing, and special offers</p>
        </div>
        <Button
          onClick={() => {
            setSelectedRule(null)
            setIsEditing(true)
          }}
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Add Pricing Rule
        </Button>
      </div>
      
      {/* Pricing Rules List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {pricingRules.map(rule => (
          <div key={rule.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedRule(rule)
                  setIsEditing(true)
                }}
              >
                Edit
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Base Rate</span>
                <span className="font-medium">${rule.baseRate}/night</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Seasonal Rate</span>
                <span className="font-medium">${calculateFinalRate(rule)}/night</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Weekend Rate</span>
                <span className="font-medium">${calculateFinalRate(rule, true)}/night</span>
              </div>
              
              {rule.minimumStay && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Minimum Stay</span>
                  <span className="font-medium">{rule.minimumStay} nights</span>
                </div>
              )}
              
              {rule.dateRange && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Date Range</span>
                  <span className="font-medium text-xs">
                    {rule.dateRange.start} - {rule.dateRange.end}
                  </span>
                </div>
              )}
              
              <div className="pt-3 border-t">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">
                    {((rule.seasonalMultiplier - 1) * 100).toFixed(0)}% seasonal adjustment
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pricing Editor Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {selectedRule ? 'Edit Pricing Rule' : 'Add New Pricing Rule'}
            </h3>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
                <input
                  type="text"
                  defaultValue={selectedRule?.name || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Summer Peak Season"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                  <select
                    defaultValue={selectedRule?.roomType || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select room type</option>
                    <option value="standard">Standard Room</option>
                    <option value="deluxe">Deluxe Room</option>
                    <option value="suite">Executive Suite</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Rate ($)</label>
                  <input
                    type="number"
                    defaultValue={selectedRule?.baseRate || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="100"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seasonal Multiplier</label>
                  <input
                    type="number"
                    step="0.1"
                    defaultValue={selectedRule?.seasonalMultiplier || 1.0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="1.0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weekend Multiplier</label>
                  <input
                    type="number"
                    step="0.1"
                    defaultValue={selectedRule?.weekendMultiplier || 1.2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="1.2"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    defaultValue={selectedRule?.dateRange?.start || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    defaultValue={selectedRule?.dateRange?.end || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stay (nights)</label>
                <input
                  type="number"
                  defaultValue={selectedRule?.minimumStay || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="1"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    setSelectedRule(null)
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={() => handleSaveRule(selectedRule || {} as PricingRule)}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Rule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}