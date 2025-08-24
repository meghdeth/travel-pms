export interface EnhancedRoom {
  id: string
  roomNumber: string
  roomType: {
    id: string
    name: string
    basePrice: number
    maxOccupancy: number
    amenities: string[]
  }
  floor: number
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning' | 'out-of-order'
  currentGuest?: {
    name: string
    checkIn: string
    checkOut: string
    guestCount: number
  }
  lastCleaned?: string
  maintenanceNotes?: string
  pricing: {
    baseRate: number
    currentRate: number
    seasonalRate?: number
  }
  amenities: string[]
  images: string[]
  notes?: string
}