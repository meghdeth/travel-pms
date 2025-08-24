'use client'

import { useState } from 'react'
import { Button } from 'ui'
import { Search, Filter, Download, CreditCard, DollarSign, TrendingUp, Calendar, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react'

interface Payment {
  id: string
  bookingId: string
  guestName: string
  hotelName: string
  amount: number
  fee: number
  netAmount: number
  method: 'card' | 'bank' | 'paypal' | 'stripe'
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  gateway: string
  transactionId: string
  date: string
  refundAmount?: number
}

const mockPayments: Payment[] = [
  {
    id: 'PAY001',
    bookingId: 'BK001',
    guestName: 'John Smith',
    hotelName: 'Grand Plaza Hotel',
    amount: 450,
    fee: 13.50,
    netAmount: 436.50,
    method: 'card',
    status: 'completed',
    gateway: 'Stripe',
    transactionId: 'pi_1234567890',
    date: '2024-01-15T10:30:00Z'
  },
  {
    id: 'PAY002',
    bookingId: 'BK002',
    guestName: 'Sarah Johnson',
    hotelName: 'Seaside Resort',
    amount: 750,
    fee: 22.50,
    netAmount: 727.50,
    method: 'paypal',
    status: 'pending',
    gateway: 'PayPal',
    transactionId: 'PAYID-123456',
    date: '2024-01-16T14:20:00Z'
  },
  {
    id: 'PAY003',
    bookingId: 'BK003',
    guestName: 'Mike Wilson',
    hotelName: 'Mountain View Lodge',
    amount: 180,
    fee: 5.40,
    netAmount: 174.60,
    method: 'card',
    status: 'failed',
    gateway: 'Stripe',
    transactionId: 'pi_0987654321',
    date: '2024-01-17T09:15:00Z'
  },
  {
    id: 'PAY004',
    bookingId: 'BK004',
    guestName: 'Emily Davis',
    hotelName: 'City Center Hotel',
    amount: 320,
    fee: 9.60,
    netAmount: 310.40,
    method: 'card',
    status: 'refunded',
    gateway: 'Stripe',
    transactionId: 'pi_1122334455',
    date: '2024-01-18T16:45:00Z',
    refundAmount: 320
  }
]

const statusColors = {
  completed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-blue-100 text-blue-800'
}

const methodColors = {
  card: 'bg-purple-100 text-purple-800',
  bank: 'bg-blue-100 text-blue-800',
  paypal: 'bg-yellow-100 text-yellow-800',
  stripe: 'bg-indigo-100 text-indigo-800'
}

const StatusIcon = ({ status }: { status: Payment['status'] }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4" />
    case 'pending':
      return <Clock className="w-4 h-4" />
    case 'failed':
      return <XCircle className="w-4 h-4" />
    case 'refunded':
      return <RefreshCw className="w-4 h-4" />
  }
}

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState('30d')

  const filteredPayments = mockPayments.filter(payment => {
    const matchesSearch = payment.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalStats = {
    totalAmount: mockPayments.reduce((sum, p) => sum + p.amount, 0),
    totalFees: mockPayments.reduce((sum, p) => sum + p.fee, 0),
    netAmount: mockPayments.reduce((sum, p) => sum + p.netAmount, 0),
    completedPayments: mockPayments.filter(p => p.status === 'completed').length
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600">Track and manage all payment transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totalStats.totalAmount.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Processing Fees</p>
              <p className="text-2xl font-bold text-gray-900">${totalStats.totalFees.toLocaleString()}</p>
            </div>
            <CreditCard className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Amount</p>
              <p className="text-2xl font-bold text-gray-900">${totalStats.netAmount.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.completedPayments}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search payments..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest / Booking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hotel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{payment.id}</div>
                      <div className="text-sm text-gray-500">{payment.transactionId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{payment.guestName}</div>
                      <div className="text-sm text-gray-500">{payment.bookingId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{payment.hotelName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">${payment.amount}</div>
                      <div className="text-xs text-gray-500">Fee: ${payment.fee}</div>
                      <div className="text-xs text-green-600">Net: ${payment.netAmount}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        methodColors[payment.method]
                      }`}>
                        {payment.method.toUpperCase()}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">{payment.gateway}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      statusColors[payment.status]
                    }`}>
                      <StatusIcon status={payment.status} />
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                    {payment.refundAmount && (
                      <div className="text-xs text-blue-600 mt-1">
                        Refunded: ${payment.refundAmount}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.date).toLocaleDateString()}
                    <div className="text-xs">
                      {new Date(payment.date).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      {payment.status === 'completed' && (
                        <Button variant="outline" size="sm">
                          Refund
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredPayments.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
          <p className="text-gray-600">No payments match your current filters.</p>
        </div>
      )}
    </div>
  )
}