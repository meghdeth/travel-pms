'use client'

import React from 'react'

interface Column<T> {
  key: string
  header: string
  render?: (item: T, index: number) => React.ReactNode
  className?: string
  sortable?: boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  emptyMessage?: string
  emptyIcon?: React.ReactNode
  onRowClick?: (item: T, index: number) => void
  className?: string
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data found',
  emptyIcon,
  onRowClick,
  className = ''
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border overflow-hidden ${className}`}>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.className || ''
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  {emptyIcon && <div className="flex justify-center mb-4">{emptyIcon}</div>}
                  <p className="text-lg font-medium">No data found</p>
                  <p className="text-sm">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={item.id || item.hotel_user_id || index}
                  className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(item, index)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 whitespace-nowrap ${column.className || ''}`}
                    >
                      {column.render ? 
                        column.render(item, index) : 
                        (item[column.key] || '-')
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Export common column types for reuse
export type { Column }