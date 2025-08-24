import { apiClient } from 'shared/lib/api'

export interface VendorHotel {
  id: string
  name: string
  location: string
  vendorId: string
  permissions: HotelPermissions
  status: 'active' | 'suspended'
  createdAt: string
}

export interface HotelPermissions {
  roomManagement: boolean
  bookingManagement: boolean
  guestServices: boolean
  analytics: boolean
  staffManagement: boolean
  paymentProcessing: boolean
  reporting: boolean
  whitelabeling: boolean
}

class VendorApiService {
  private baseUrl = '/api/vendor'

  // Hotel Management
  async getVendorHotels(vendorId: string): Promise<VendorHotel[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${vendorId}/hotels`)
      return response.data
    } catch (error) {
      console.error('Error fetching vendor hotels:', error)
      throw error
    }
  }

  async updateHotelPermissions(hotelId: string, permissions: HotelPermissions): Promise<void> {
    try {
      await apiClient.put(`${this.baseUrl}/hotels/${hotelId}/permissions`, { permissions })
    } catch (error) {
      console.error('Error updating hotel permissions:', error)
      throw error
    }
  }

  async suspendHotel(hotelId: string): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/hotels/${hotelId}/suspend`)
    } catch (error) {
      console.error('Error suspending hotel:', error)
      throw error
    }
  }

  async activateHotel(hotelId: string): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/hotels/${hotelId}/activate`)
    } catch (error) {
      console.error('Error activating hotel:', error)
      throw error
    }
  }

  // Analytics and Reporting
  async getVendorAnalytics(vendorId: string, dateRange: { start: string; end: string }) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${vendorId}/analytics`, {
        params: dateRange
      })
      return response.data
    } catch (error) {
      console.error('Error fetching vendor analytics:', error)
      throw error
    }
  }

  // Whitelabeling Requests
  async getWhitelabelingRequests(vendorId: string) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${vendorId}/whitelabeling-requests`)
      return response.data
    } catch (error) {
      console.error('Error fetching whitelabeling requests:', error)
      throw error
    }
  }

  async approveWhitelabelingRequest(requestId: string) {
    try {
      await apiClient.patch(`${this.baseUrl}/whitelabeling-requests/${requestId}/approve`)
    } catch (error) {
      console.error('Error approving whitelabeling request:', error)
      throw error
    }
  }

  async rejectWhitelabelingRequest(requestId: string, reason: string) {
    try {
      await apiClient.patch(`${this.baseUrl}/whitelabeling-requests/${requestId}/reject`, { reason })
    } catch (error) {
      console.error('Error rejecting whitelabeling request:', error)
      throw error
    }
  }
}

export const vendorApiService = new VendorApiService()