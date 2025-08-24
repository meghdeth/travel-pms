'use client'

import React, { useState, useEffect } from 'react';
import { 
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { dashboardApi } from '../../services/apiService';
import KPICard from '../ui/KPICard';
import LoadingSpinner from '../ui/LoadingSpinner';

interface FinanceData {
  summary: {
    totalRevenue: number;
    pendingPayments: number;
    completedTransactions: number;
    pendingTransactions: number;
  };
  transactions: Array<{
    id: string;
    guestName: string;
    amount: number;
    status: string;
    type: string;
    date: string;
  }>;
  chartData: {
    daily: Array<{
      date: string;
      revenue: number;
    }>;
  };
}

const FinanceDashboard: React.FC = () => {
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  useEffect(() => {
    fetchFinanceData();
  }, [selectedPeriod]);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardApi.getFinanceOverview(selectedPeriod);
      
      if (response?.success) {
        setData(response.data);
      } else {
        throw new Error('Failed to fetch finance data');
      }
    } catch (error: any) {
      console.error('Failed to fetch finance data:', error);
      setError(error?.response?.data?.message || error?.message || 'Failed to load finance data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <KPICard
              key={i}
              title="Loading..."
              value=""
              icon={<CurrencyDollarIcon className="h-8 w-8" />}
              loading={true}
            />
          ))}
        </div>
        <LoadingSpinner size="lg" text="Loading finance data..." className="my-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-red-800">Error Loading Finance Dashboard</h3>
            <p className="text-red-600 mt-1">{error}</p>
            <button
              onClick={fetchFinanceData}
              className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Period Selector */}
      <div className="mb-6">
        <div className="flex space-x-4">
          {['today', 'week', 'month'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Revenue"
          value={`$${data?.summary?.totalRevenue?.toLocaleString() || '0'}`}
          icon={<CurrencyDollarIcon />}
          color="green"
          subtitle={`For ${selectedPeriod}`}
        />
        
        <KPICard
          title="Pending Payments"
          value={`$${data?.summary?.pendingPayments?.toLocaleString() || '0'}`}
          icon={<ClockIcon />}
          color="yellow"
          subtitle="Awaiting payment"
        />
        
        <KPICard
          title="Completed Transactions"
          value={data?.summary?.completedTransactions || 0}
          icon={<CheckCircleIcon />}
          color="blue"
          subtitle="Successful payments"
        />
        
        <KPICard
          title="Pending Transactions"
          value={data?.summary?.pendingTransactions || 0}
          icon={<ExclamationTriangleIcon />}
          color="orange"
          subtitle="Require attention"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Revenue Trend</h2>
          {data?.chartData?.daily && data.chartData.daily.length > 0 ? (
            <div className="space-y-4">
              {data.chartData.daily.map((day) => (
                <div key={day.date} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{new Date(day.date).toLocaleDateString()}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min((day.revenue / Math.max(...data.chartData.daily.map(d => d.revenue))) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      ${day.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No chart data available</p>
          )}
        </div>

        {/* Payment Status Overview */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Status</h2>
          <div className="space-y-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">
                ${data?.summary?.totalRevenue?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-green-700">Total Revenue</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-xl font-bold text-blue-600">
                  {data?.summary?.completedTransactions || 0}
                </p>
                <p className="text-sm text-blue-700">Completed</p>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-xl font-bold text-yellow-600">
                  {data?.summary?.pendingTransactions || 0}
                </p>
                <p className="text-sm text-yellow-700">Pending</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.transactions && data.transactions.length > 0 ? (
                data.transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{transaction.id}</div>
                      <div className="text-sm text-gray-500">{transaction.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transaction.guestName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        ${transaction.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View all transactions →
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            Export Report
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Finance Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 font-medium transition-colors">
            <CurrencyDollarIcon className="h-6 w-6 mx-auto mb-2" />
            Record Payment
          </button>
          <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 font-medium transition-colors">
            <ChartBarIcon className="h-6 w-6 mx-auto mb-2" />
            Generate Report
          </button>
          <button className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-yellow-700 font-medium transition-colors">
            <ClockIcon className="h-6 w-6 mx-auto mb-2" />
            Follow Up
          </button>
          <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 font-medium transition-colors">
            <CheckCircleIcon className="h-6 w-6 mx-auto mb-2" />
            Reconcile
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;