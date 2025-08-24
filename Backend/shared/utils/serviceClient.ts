import axios, { AxiosInstance, AxiosError } from 'axios';
import { ServiceResponse, ServiceError, InterServiceResponse } from '../types';

export class ServiceClient {
  private client: AxiosInstance;
  private serviceName: string;

  constructor(baseURL: string, serviceName: string, timeout: number = 10000) {
    this.serviceName = serviceName;
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Name': serviceName
      }
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        // Add service-to-service authentication if needed
        const serviceToken = process.env.SERVICE_AUTH_TOKEN;
        if (serviceToken) {
          config.headers['X-Service-Token'] = serviceToken;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const serviceError = this.handleError(error);
        return Promise.reject(serviceError);
      }
    );
  }

  private handleError(error: AxiosError): ServiceError {
    const serviceError = new Error() as ServiceError;
    serviceError.service = this.serviceName;

    if (error.response) {
      // Server responded with error status
      serviceError.statusCode = error.response.status;
      serviceError.message = error.response.data?.message || error.message;
      serviceError.code = error.response.data?.error || 'SERVICE_ERROR';
    } else if (error.request) {
      // Request was made but no response received
      serviceError.statusCode = 503;
      serviceError.message = `Service ${this.serviceName} is unavailable`;
      serviceError.code = 'SERVICE_UNAVAILABLE';
    } else {
      // Something else happened
      serviceError.statusCode = 500;
      serviceError.message = error.message;
      serviceError.code = 'UNKNOWN_ERROR';
    }

    return serviceError;
  }

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<InterServiceResponse<T>> {
    try {
      const response = await this.client.get(endpoint, { headers });
      return {
        success: true,
        data: response.data,
        statusCode: response.status
      };
    } catch (error) {
      const serviceError = error as ServiceError;
      return {
        success: false,
        error: serviceError.message,
        statusCode: serviceError.statusCode || 500
      };
    }
  }

  async post<T>(endpoint: string, data: any, headers?: Record<string, string>): Promise<InterServiceResponse<T>> {
    try {
      const response = await this.client.post(endpoint, data, { headers });
      return {
        success: true,
        data: response.data,
        statusCode: response.status
      };
    } catch (error) {
      const serviceError = error as ServiceError;
      return {
        success: false,
        error: serviceError.message,
        statusCode: serviceError.statusCode || 500
      };
    }
  }

  async put<T>(endpoint: string, data: any, headers?: Record<string, string>): Promise<InterServiceResponse<T>> {
    try {
      const response = await this.client.put(endpoint, data, { headers });
      return {
        success: true,
        data: response.data,
        statusCode: response.status
      };
    } catch (error) {
      const serviceError = error as ServiceError;
      return {
        success: false,
        error: serviceError.message,
        statusCode: serviceError.statusCode || 500
      };
    }
  }

  async patch<T>(endpoint: string, data: any, headers?: Record<string, string>): Promise<InterServiceResponse<T>> {
    try {
      const response = await this.client.patch(endpoint, data, { headers });
      return {
        success: true,
        data: response.data,
        statusCode: response.status
      };
    } catch (error) {
      const serviceError = error as ServiceError;
      return {
        success: false,
        error: serviceError.message,
        statusCode: serviceError.statusCode || 500
      };
    }
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<InterServiceResponse<T>> {
    try {
      const response = await this.client.delete(endpoint, { headers });
      return {
        success: true,
        data: response.data,
        statusCode: response.status
      };
    } catch (error) {
      const serviceError = error as ServiceError;
      return {
        success: false,
        error: serviceError.message,
        statusCode: serviceError.statusCode || 500
      };
    }
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // Set authentication token for requests
  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Remove authentication token
  removeAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }
}

// Service client factory for creating pre-configured clients
export class ServiceClientFactory {
  private static clients: Map<string, ServiceClient> = new Map();

  static createClient(serviceName: string, baseURL: string, timeout?: number): ServiceClient {
    const key = `${serviceName}-${baseURL}`;
    
    if (!this.clients.has(key)) {
      const client = new ServiceClient(baseURL, serviceName, timeout);
      this.clients.set(key, client);
    }

    return this.clients.get(key)!;
  }

  static getVendorServiceClient(): ServiceClient {
    return this.createClient(
      'vendor-service',
      process.env.VENDOR_SERVICE_URL || 'http://localhost:3002'
    );
  }

  static getHotelServiceClient(): ServiceClient {
    return this.createClient(
      'hotel-service',
      process.env.HOTEL_SERVICE_URL || 'http://localhost:3003'
    );
  }

  static getBookingServiceClient(): ServiceClient {
    return this.createClient(
      'booking-service',
      process.env.BOOKING_SERVICE_URL || 'http://localhost:3004'
    );
  }

  static getSuperAdminServiceClient(): ServiceClient {
    return this.createClient(
      'super-admin-service',
      process.env.SUPER_ADMIN_SERVICE_URL || 'http://localhost:3001'
    );
  }
}