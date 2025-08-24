import { apiClient } from 'shared/lib/api'

export interface HotelStats {
  totalRooms: number
  occupiedRooms: number
  todayCheckIns: number
  todayCheckOuts: number
  monthlyRevenue: number
  pendingBookings: number
  occupancyRate: number
}

export interface Room {
  id: number
  room_number: string
  room_type_id: number
  hotel_id: number
  floor_number: number
  status: 'available' | 'occupied' | 'maintenance' | 'out_of_order'
  max_occupancy: number
  base_price: number
  amenities?: any
  room_type?: {
    id: number
    name: string
    description: string
    max_occupancy: number
    base_price: number
  }
}

export interface Booking {
  id: number
  booking_reference: string
  guest_details: {
    first_name: string
    last_name: string
    email: string
    phone: string
  }
  check_in_date: string
  check_out_date: string
  room_id: number
  room?: Room
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'
  pricing: {
    total_amount: number
    currency: string
  }
  payment: {
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  }
}

export interface CreateBookingData {
  hotel_id: number
  room_id: number
  room_type_id: number
  guest_details: {
    first_name: string
    last_name: string
    email: string
    phone: string
  }
  adults: number
  children?: number
  check_in_date: string
  check_out_date: string
  pricing: {
    room_rate: number
    tax_amount: number
    service_charge: number
    total_amount: number
    currency: string
  }
  payment: {
    payment_method: string
    payment_status: string
  }
  special_requests?: string
}

export interface BedBookingPricing {
  bed_rate: number
  tax_amount: number
  service_charge: number
  discount_amount: number
  total_amount: number
  currency: string
  meal_plan?: 'none' | 'breakfast' | 'half_board' | 'full_board'
  meal_cost?: number
}

export interface PricingCalculationRequest {
  accommodation_type: 'hotel' | 'dormitory'
  base_rate: number
  check_in_date: string
  check_out_date: string
  guests: number
  meal_plan?: 'none' | 'breakfast' | 'half_board' | 'full_board'
  seasonal_rate?: 'low' | 'regular' | 'high' | 'peak'
  apply_weekend_surcharge?: boolean
  apply_holiday_surcharge?: boolean
  discount_amount?: number
}

export interface PricingCalculationResponse {
  base_amount: number
  meal_amount: number
  surcharge_amount: number
  discount_amount: number
  tax_amount: number
  service_charge_amount: number
  total_amount: number
  breakdown: any
}

// Staff Management Interfaces
export interface StaffMember {
  hotel_user_id: string
  dev_hotel_user_id?: string  // Add this field for the new ID system
  first_name: string
  last_name: string
  email: string
  phone: string
  role: 'Hotel Admin' | 'Manager' | 'Finance Department' | 'Front Desk' | 'Booking Agent' | 'Gatekeeper' | 'Support' | 'Tech Support' | 'Service Boy' | 'Maintenance' | 'Kitchen'
  status: 'active' | 'inactive' | 'suspended'
  permissions?: string[]
  last_login?: string
  hotel_id: string
  created_at: string
  updated_at?: string
}

export interface CreateStaffMemberData {
  first_name: string
  last_name: string
  email: string
  phone: string
  password: string
  role: 'Hotel Admin' | 'Manager' | 'Finance Department' | 'Front Desk' | 'Booking Agent' | 'Gatekeeper' | 'Support' | 'Tech Support' | 'Service Boy' | 'Maintenance' | 'Kitchen'
  permissions?: string[]
}

export interface UpdateStaffMemberData {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  role?: 'Hotel Admin' | 'Manager' | 'Finance Department' | 'Front Desk' | 'Booking Agent' | 'Gatekeeper' | 'Support' | 'Tech Support' | 'Service Boy' | 'Maintenance' | 'Kitchen'
  status?: 'active' | 'inactive' | 'suspended'
  permissions?: string[]
}

export interface StaffStatistics {
  totalStaff: number
  activeStaff: number
  inactiveStaff: number
  suspendedStaff: number
  roleDistribution: {
    role: string
    count: number
  }[]
}

// Add RoomType interface after the Room interface
export interface RoomType {
  id: number
  hotel_id: number
  name: string
  description?: string
  max_occupancy: number
  base_price: number
  amenities?: string[]
  images?: string[]
  status: 'active' | 'inactive'
  created_at?: string
  updated_at?: string
  rooms?: Room[]
}

export interface CreateRoomTypeData {
  hotel_id: number
  name: string
  description?: string
  max_occupancy: number
  base_price: number
  amenities?: string[]
  status?: 'active' | 'inactive'
}

class HotelApiService {
  private baseUrl = '/hotel'; // Updated to match backend route mounting

  // Dashboard Stats
  async getDashboardStats(hotelId?: number): Promise<HotelStats> {
    try {
      // Use the correct backend endpoint that gets hotel_id from auth context
      const response = await apiClient.get(`${this.baseUrl}/dashboard/stats`)
      const data = response.data.data || response.data
      
      // Enhanced mapping with better fallbacks
      return {
        totalRooms: data.totalRooms || data.total_rooms || 0,
        occupiedRooms: data.occupiedRooms || data.occupied_rooms || 0,
        todayCheckIns: data.todayCheckIns || data.today_check_ins || 0,
        todayCheckOuts: data.todayCheckOuts || data.today_check_outs || 0,
        monthlyRevenue: data.monthlyRevenue || data.monthly_revenue || data.todayRevenue || 0,
        pendingBookings: data.pendingBookings || data.pending_bookings || data.totalBookings || 0,
        occupancyRate: data.occupancyRate || data.occupancy_rate || 0
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      // Return default stats if API fails
      return {
        totalRooms: 0,
        occupiedRooms: 0,
        todayCheckIns: 0,
        todayCheckOuts: 0,
        monthlyRevenue: 0,
        pendingBookings: 0,
        occupancyRate: 0
      }
    }
  }

  // Room Management
  async getRooms(hotelId: number): Promise<Room[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${hotelId}/rooms`)
      return response.data
    } catch (error) {
      console.error('Error fetching rooms:', error)
      throw error
    }
  }

  async createRoom(hotelId: number, roomData: Partial<Room>): Promise<Room> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${hotelId}/rooms`, roomData)
      return response.data
    } catch (error) {
      console.error('Error creating room:', error)
      throw error
    }
  }

  async updateRoom(hotelId: number, roomId: number, roomData: Partial<Room>): Promise<Room> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${hotelId}/rooms/${roomId}`, roomData)
      return response.data
    } catch (error) {
      console.error('Error updating room:', error)
      throw error
    }
  }

  async deleteRoom(hotelId: number, roomId: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${hotelId}/rooms/${roomId}`)
    } catch (error) {
      console.error('Error deleting room:', error)
      throw error
    }
  }

  // Booking Management
  async getBookings(hotelId: number, filters?: any): Promise<Booking[]> {
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value as string)
        })
      }
      
      const response = await apiClient.get(`${this.baseUrl}/${hotelId}/bookings?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching bookings:', error)
      throw error
    }
  }

  async createBooking(hotelId: number, bookingData: CreateBookingData): Promise<Booking> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${hotelId}/bookings`, bookingData)
      return response.data
    } catch (error) {
      console.error('Error creating booking:', error)
      throw error
    }
  }

  async updateBooking(hotelId: number, bookingId: number, bookingData: Partial<CreateBookingData>): Promise<Booking> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${hotelId}/bookings/${bookingId}`, bookingData)
      return response.data
    } catch (error) {
      console.error('Error updating booking:', error)
      throw error
    }
  }

  async cancelBooking(hotelId: number, bookingId: number, reason?: string): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/${hotelId}/bookings/${bookingId}/cancel`, { reason })
    } catch (error) {
      console.error('Error cancelling booking:', error)
      throw error
    }
  }

  // Check-in/Check-out
  async checkInGuest(hotelId: number, bookingId: number): Promise<Booking> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/${hotelId}/bookings/${bookingId}/checkin`)
      return response.data
    } catch (error) {
      console.error('Error checking in guest:', error)
      throw error
    }
  }

  async checkOutGuest(hotelId: number, bookingId: number): Promise<Booking> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/${hotelId}/bookings/${bookingId}/checkout`)
      return response.data
    } catch (error) {
      console.error('Error checking out guest:', error)
      throw error
    }
  }

  // Analytics
  async getAnalytics(hotelId: number, dateRange: { start: string; end: string }) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${hotelId}/analytics`, {
        params: dateRange
      })
      return response.data
    } catch (error) {
      console.error('Error fetching analytics:', error)
      throw error
    }
  }

  // Room Availability
  async checkRoomAvailability(hotelId: number, checkIn: string, checkOut: string, guests?: number) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${hotelId}/availability`, {
        params: { check_in: checkIn, check_out: checkOut, guests }
      })
      return response.data
    } catch (error) {
      console.error('Error checking room availability:', error)
      throw error
    }
  }

  // Calculate dynamic pricing
  async calculatePricing(hotelId: number, request: PricingCalculationRequest): Promise<PricingCalculationResponse> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${hotelId}/pricing/calculate`, request)
      return response.data
    } catch (error) {
      console.error('Error calculating pricing:', error)
      throw error
    }
  }

  // Get meal plan options
  async getMealPlans(hotelId: number): Promise<any[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${hotelId}/meal-plans`)
      return response.data
    } catch (error) {
      console.error('Error fetching meal plans:', error)
      throw error
    }
  }

  // Get seasonal rates
  async getSeasonalRates(hotelId: number): Promise<any[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${hotelId}/seasonal-rates`)
      return response.data
    } catch (error) {
      console.error('Error fetching seasonal rates:', error)
      throw error
    }
  }

  async uploadHotelImages(hotelId: string, formData: FormData) {
    try {
      const response = await apiClient.post(`/api/upload/hotels/${hotelId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async uploadRoomTypeImages(roomTypeId: string, formData: FormData) {
    try {
      const response = await apiClient.post(`/api/upload/room-types/${roomTypeId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async uploadFacilityImages(facilityId: string, formData: FormData) {
    try {
      const response = await apiClient.post(`/api/upload/facilities/${facilityId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteImage(data: {
    entity_type: string;
    entity_id: string;
    image_url: string;
  }) {
    try {
      const response = await apiClient.delete('/api/upload/images', { data });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Staff Management Methods
  async getStaffMembers(hotelId: string): Promise<StaffMember[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${hotelId}/users`)
      return response.data
    } catch (error) {
      console.error('Error fetching staff members:', error)
      throw error
    }
  }

  async createStaffMember(hotelId: string, staffData: CreateStaffMemberData): Promise<StaffMember> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${hotelId}/users`, staffData)
      return response.data
    } catch (error) {
      console.error('Error creating staff member:', error)
      throw error
    }
  }

  async updateStaffMember(hotelId: string, staffId: string, staffData: UpdateStaffMemberData): Promise<StaffMember> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${hotelId}/users/${staffId}`, staffData)
      return response.data
    } catch (error) {
      console.error('Error updating staff member:', error)
      throw error
    }
  }

  async deleteStaffMember(hotelId: string, staffId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${hotelId}/users/${staffId}`)
    } catch (error) {
      console.error('Error deleting staff member:', error)
      throw error
    }
  }

  async getStaffStatistics(hotelId: string): Promise<StaffStatistics> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${hotelId}/users/statistics`)
      return response.data
    } catch (error) {
      console.error('Error fetching staff statistics:', error)
      throw error
    }
  }

  async updateStaffStatus(hotelId: string, staffId: string, status: 'active' | 'inactive' | 'suspended'): Promise<StaffMember> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/${hotelId}/staff/${staffId}/status`, { status })
      return response.data
    } catch (error) {
      console.error('Error updating staff status:', error)
      throw error
    }
  }

  // Room Type Management Methods - Move these inside the class
  async getRoomTypes(hotelId: number): Promise<RoomType[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${hotelId}/room-types`)
      return response.data
    } catch (error) {
      console.error('Error fetching room types:', error)
      throw error
    }
  }

  async getRoomType(roomTypeId: number): Promise<RoomType> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/room-types/${roomTypeId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching room type:', error)
      throw error
    }
  }

  async createRoomType(hotelId: number, roomTypeData: CreateRoomTypeData): Promise<RoomType> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${hotelId}/room-types`, roomTypeData)
      return response.data
    } catch (error) {
      console.error('Error creating room type:', error)
      throw error
    }
  }

  async updateRoomType(roomTypeId: number, roomTypeData: Partial<CreateRoomTypeData>): Promise<RoomType> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/room-types/${roomTypeId}`, roomTypeData)
      return response.data
    } catch (error) {
      console.error('Error updating room type:', error)
      throw error
    }
  }

  async deleteRoomType(roomTypeId: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/room-types/${roomTypeId}`)
    } catch (error) {
      console.error('Error deleting room type:', error)
      throw error
    }
  }
}

export const hotelApiService = new HotelApiService()