import { apiClient } from 'shared/lib/api'

export interface BookingData {
  guestName: string
  guestEmail: string
  guestPhone: string
  checkIn: string
  checkOut: string
  roomNumber?: string
  bedNumber?: string
  roomType?: 'suite' | 'executive_suite' | 'basic'
  bedType?: 'male' | 'female' | 'mixed'
  totalAmount: number
  paymentStatus: 'paid' | 'pending' | 'refunded'
  bookingType: 'room' | 'bed'
  specialRequests?: string
}

export interface BookingFilters {
  status?: string
  roomType?: string
  bedType?: string
  checkIn?: string
  checkOut?: string
  search?: string
  bookingType?: string
}

export interface CalendarQuery {
  month: number
  year: number
  hotelId: string
}

class BookingService {
  private baseUrl = '/hotels'

  async getBookings(hotelId: string, filters?: BookingFilters) {
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value)
        })
      }
      
      const response = await apiClient.get(`${this.baseUrl}/${hotelId}/bookings?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching bookings:', error)
      throw error
    }
  }

  async createBooking(hotelId: string, bookingData: BookingData) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${hotelId}/bookings`, bookingData)
      return response.data
    } catch (error) {
      console.error('Error creating booking:', error)
      throw error
    }
  }

  async updateBooking(hotelId: string, bookingId: string, bookingData: Partial<BookingData>) {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${hotelId}/bookings/${bookingId}`, bookingData)
      return response.data
    } catch (error) {
      console.error('Error updating booking:', error)
      throw error
    }
  }

  async deleteBooking(hotelId: string, bookingId: string) {
    try {
      const response = await apiClient.delete(`${this.baseUrl}/${hotelId}/bookings/${bookingId}`)
      return response.data
    } catch (error) {
      console.error('Error deleting booking:', error)
      throw error
    }
  }

  async getBookingCalendar(query: CalendarQuery) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${query.hotelId}/calendar`, {
        params: {
          month: query.month,
          year: query.year
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching calendar data:', error)
      throw error
    }
  }

  async getBookingById(hotelId: string, bookingId: string) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${hotelId}/bookings/${bookingId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching booking:', error)
      throw error
    }
  }
}

export const bookingService = new BookingService()