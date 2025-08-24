import { Response } from 'express';
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants';
import { ApiResponse, PaginatedResponse, ServiceError } from '../types';

/**
 * Standard API Response utility class
 */
export class ResponseHandler {
  /**
   * Send success response
   */
  static success<T>(
    res: Response,
    data?: T,
    message: string = SUCCESS_MESSAGES.RETRIEVED,
    statusCode: number = HTTP_STATUS.OK,
    meta?: any
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };

    if (meta) {
      response.meta = meta;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send created response
   */
  static created<T>(
    res: Response,
    data?: T,
    message: string = SUCCESS_MESSAGES.CREATED
  ): Response {
    return this.success(res, data, message, HTTP_STATUS.CREATED);
  }

  /**
   * Send updated response
   */
  static updated<T>(
    res: Response,
    data?: T,
    message: string = SUCCESS_MESSAGES.UPDATED
  ): Response {
    return this.success(res, data, message, HTTP_STATUS.OK);
  }

  /**
   * Send deleted response
   */
  static deleted(
    res: Response,
    message: string = SUCCESS_MESSAGES.DELETED
  ): Response {
    return this.success(res, null, message, HTTP_STATUS.OK);
  }

  /**
   * Send no content response
   */
  static noContent(res: Response): Response {
    return res.status(HTTP_STATUS.NO_CONTENT).send();
  }

  /**
   * Send paginated response
   */
  static paginated<T>(
    res: Response,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    },
    message: string = SUCCESS_MESSAGES.RETRIEVED
  ): Response {
    const response: PaginatedResponse<T> = {
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString()
    };

    return res.status(HTTP_STATUS.OK).json(response);
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    message: string = ERROR_MESSAGES.INTERNAL_ERROR,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errorCode?: string,
    details?: any
  ): Response {
    const response: ApiResponse<null> = {
      success: false,
      message,
      data: null,
      timestamp: new Date().toISOString()
    };

    if (errorCode) {
      response.error = errorCode;
    }

    if (details) {
      response.details = details;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send bad request response
   */
  static badRequest(
    res: Response,
    message: string = ERROR_MESSAGES.VALIDATION_FAILED,
    details?: any
  ): Response {
    return this.error(res, message, HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR', details);
  }

  /**
   * Send unauthorized response
   */
  static unauthorized(
    res: Response,
    message: string = ERROR_MESSAGES.UNAUTHORIZED
  ): Response {
    return this.error(res, message, HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
  }

  /**
   * Send forbidden response
   */
  static forbidden(
    res: Response,
    message: string = ERROR_MESSAGES.FORBIDDEN
  ): Response {
    return this.error(res, message, HTTP_STATUS.FORBIDDEN, 'FORBIDDEN');
  }

  /**
   * Send not found response
   */
  static notFound(
    res: Response,
    message: string = ERROR_MESSAGES.NOT_FOUND
  ): Response {
    return this.error(res, message, HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }

  /**
   * Send conflict response
   */
  static conflict(
    res: Response,
    message: string = ERROR_MESSAGES.ALREADY_EXISTS
  ): Response {
    return this.error(res, message, HTTP_STATUS.CONFLICT, 'CONFLICT');
  }

  /**
   * Send unprocessable entity response
   */
  static unprocessableEntity(
    res: Response,
    message: string = ERROR_MESSAGES.VALIDATION_FAILED,
    details?: any
  ): Response {
    return this.error(res, message, HTTP_STATUS.UNPROCESSABLE_ENTITY, 'UNPROCESSABLE_ENTITY', details);
  }

  /**
   * Send too many requests response
   */
  static tooManyRequests(
    res: Response,
    message: string = ERROR_MESSAGES.RATE_LIMIT_EXCEEDED
  ): Response {
    return this.error(res, message, HTTP_STATUS.TOO_MANY_REQUESTS, 'RATE_LIMIT_EXCEEDED');
  }

  /**
   * Send internal server error response
   */
  static internalError(
    res: Response,
    message: string = ERROR_MESSAGES.INTERNAL_ERROR
  ): Response {
    return this.error(res, message, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'INTERNAL_SERVER_ERROR');
  }

  /**
   * Send service unavailable response
   */
  static serviceUnavailable(
    res: Response,
    message: string = ERROR_MESSAGES.SERVICE_UNAVAILABLE
  ): Response {
    return this.error(res, message, HTTP_STATUS.SERVICE_UNAVAILABLE, 'SERVICE_UNAVAILABLE');
  }

  /**
   * Handle service error and send appropriate response
   */
  static handleServiceError(res: Response, error: ServiceError): Response {
    const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = error.message || ERROR_MESSAGES.INTERNAL_ERROR;
    const errorCode = error.code || 'UNKNOWN_ERROR';

    return this.error(res, message, statusCode, errorCode);
  }

  /**
   * Send validation error response
   */
  static validationError(
    res: Response,
    errors: Array<{
      field: string;
      message: string;
      value?: any;
    }>
  ): Response {
    return this.badRequest(res, ERROR_MESSAGES.VALIDATION_FAILED, { errors });
  }

  /**
   * Send custom response
   */
  static custom<T>(
    res: Response,
    statusCode: number,
    success: boolean,
    message: string,
    data?: T,
    meta?: any
  ): Response {
    const response: ApiResponse<T> = {
      success,
      message,
      data: data || null,
      timestamp: new Date().toISOString()
    };

    if (meta) {
      response.meta = meta;
    }

    return res.status(statusCode).json(response);
  }
}

/**
 * Response builder for chaining
 */
export class ResponseBuilder<T = any> {
  private statusCode: number = HTTP_STATUS.OK;
  private success: boolean = true;
  private message: string = SUCCESS_MESSAGES.RETRIEVED;
  private data: T | null = null;
  private meta: any = null;
  private errorCode?: string;
  private details?: any;

  /**
   * Set status code
   */
  status(code: number): ResponseBuilder<T> {
    this.statusCode = code;
    return this;
  }

  /**
   * Set success flag
   */
  setSuccess(success: boolean): ResponseBuilder<T> {
    this.success = success;
    return this;
  }

  /**
   * Set message
   */
  setMessage(message: string): ResponseBuilder<T> {
    this.message = message;
    return this;
  }

  /**
   * Set data
   */
  setData(data: T): ResponseBuilder<T> {
    this.data = data;
    return this;
  }

  /**
   * Set meta information
   */
  setMeta(meta: any): ResponseBuilder<T> {
    this.meta = meta;
    return this;
  }

  /**
   * Set error code
   */
  setErrorCode(code: string): ResponseBuilder<T> {
    this.errorCode = code;
    return this;
  }

  /**
   * Set error details
   */
  setDetails(details: any): ResponseBuilder<T> {
    this.details = details;
    return this;
  }

  /**
   * Build and send response
   */
  send(res: Response): Response {
    const response: ApiResponse<T> = {
      success: this.success,
      message: this.message,
      data: this.data,
      timestamp: new Date().toISOString()
    };

    if (this.meta) {
      response.meta = this.meta;
    }

    if (this.errorCode) {
      response.error = this.errorCode;
    }

    if (this.details) {
      response.details = this.details;
    }

    return res.status(this.statusCode).json(response);
  }
}

/**
 * Pagination helper
 */
export class PaginationHelper {
  /**
   * Calculate pagination metadata
   */
  static calculatePagination(
    page: number,
    limit: number,
    totalCount: number
  ): {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    skip: number;
  } {
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    const skip = (page - 1) * limit;

    return {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage,
      hasPrevPage,
      skip
    };
  }

  /**
   * Build pagination links
   */
  static buildPaginationLinks(
    baseUrl: string,
    page: number,
    limit: number,
    totalPages: number,
    queryParams?: Record<string, any>
  ): {
    first?: string;
    prev?: string;
    next?: string;
    last?: string;
  } {
    const links: any = {};
    const params = new URLSearchParams();

    // Add existing query parameters
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (key !== 'page' && key !== 'limit' && value !== undefined) {
          params.append(key, String(value));
        }
      });
    }

    params.append('limit', String(limit));

    // First page link
    if (page > 1) {
      const firstParams = new URLSearchParams(params);
      firstParams.set('page', '1');
      links.first = `${baseUrl}?${firstParams.toString()}`;
    }

    // Previous page link
    if (page > 1) {
      const prevParams = new URLSearchParams(params);
      prevParams.set('page', String(page - 1));
      links.prev = `${baseUrl}?${prevParams.toString()}`;
    }

    // Next page link
    if (page < totalPages) {
      const nextParams = new URLSearchParams(params);
      nextParams.set('page', String(page + 1));
      links.next = `${baseUrl}?${nextParams.toString()}`;
    }

    // Last page link
    if (page < totalPages) {
      const lastParams = new URLSearchParams(params);
      lastParams.set('page', String(totalPages));
      links.last = `${baseUrl}?${lastParams.toString()}`;
    }

    return links;
  }
}

/**
 * Response formatter for different content types
 */
export class ResponseFormatter {
  /**
   * Format response as JSON
   */
  static json<T>(data: T, success: boolean = true, message?: string): ApiResponse<T> {
    return {
      success,
      message: message || (success ? SUCCESS_MESSAGES.RETRIEVED : ERROR_MESSAGES.INTERNAL_ERROR),
      data,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Format response as CSV
   */
  static csv(data: any[], headers: string[]): string {
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  }

  /**
   * Format response as XML
   */
  static xml<T>(data: T, rootElement: string = 'response'): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const xmlBody = this.objectToXml(data, rootElement);
    return `${xmlHeader}\n${xmlBody}`;
  }

  /**
   * Convert object to XML
   */
  private static objectToXml(obj: any, rootElement: string): string {
    const xmlElements: string[] = [];
    
    const processValue = (value: any, key: string): string => {
      if (value === null || value === undefined) {
        return `<${key}></${key}>`;
      }
      
      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          return value.map(item => processValue(item, key)).join('');
        } else {
          const innerXml = Object.entries(value)
            .map(([k, v]) => processValue(v, k))
            .join('');
          return `<${key}>${innerXml}</${key}>`;
        }
      }
      
      return `<${key}>${String(value)}</${key}>`;
    };

    if (typeof obj === 'object' && obj !== null) {
      const innerXml = Object.entries(obj)
        .map(([key, value]) => processValue(value, key))
        .join('');
      return `<${rootElement}>${innerXml}</${rootElement}>`;
    }
    
    return `<${rootElement}>${String(obj)}</${rootElement}>`;
  }
}

/**
 * Export response utilities
 */
export const response = {
  ResponseHandler,
  ResponseBuilder,
  PaginationHelper,
  ResponseFormatter
};

// Convenience functions
export const success = ResponseHandler.success;
export const created = ResponseHandler.created;
export const updated = ResponseHandler.updated;
export const deleted = ResponseHandler.deleted;
export const error = ResponseHandler.error;
export const badRequest = ResponseHandler.badRequest;
export const unauthorized = ResponseHandler.unauthorized;
export const forbidden = ResponseHandler.forbidden;
export const notFound = ResponseHandler.notFound;
export const conflict = ResponseHandler.conflict;
export const internalError = ResponseHandler.internalError;
export const paginated = ResponseHandler.paginated;
export const validationError = ResponseHandler.validationError;