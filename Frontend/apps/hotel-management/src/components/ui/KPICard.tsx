'use client'

import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'yellow' | 'indigo' | 'pink' | 'gray';
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  loading?: boolean;
}

const colorClasses = {
  blue: {
    text: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600'
  },
  green: {
    text: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-600'
  },
  red: {
    text: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600'
  },
  orange: {
    text: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: 'text-orange-600'
  },
  purple: {
    text: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: 'text-purple-600'
  },
  yellow: {
    text: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-600'
  },
  indigo: {
    text: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    icon: 'text-indigo-600'
  },
  pink: {
    text: 'text-pink-600',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    icon: 'text-pink-600'
  },
  gray: {
    text: 'text-gray-600',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    icon: 'text-gray-600'
  }
};

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon,
  color = 'blue',
  subtitle,
  trend,
  onClick,
  loading = false
}) => {
  const colors = colorClasses[color];

  if (loading) {
    return (
      <div className=\"bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse\">
        <div className=\"flex items-center\">
          <div className=\"flex-shrink-0\">
            <div className=\"h-8 w-8 bg-gray-300 rounded\"></div>
          </div>
          <div className=\"ml-4 flex-1\">
            <div className=\"h-4 bg-gray-300 rounded w-3/4 mb-2\"></div>
            <div className=\"h-8 bg-gray-300 rounded w-1/2\"></div>
          </div>
        </div>
      </div>
    );
  }

  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toString();
    }
    return val;
  };

  return (
    <div
      className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-1' : ''
      }`}
      onClick={onClick}
    >
      <div className=\"flex items-center\">
        <div className={`flex-shrink-0 p-3 rounded-lg ${colors.bg} ${colors.border} border`}>
          <div className={`h-8 w-8 ${colors.icon}`}>
            {icon}
          </div>
        </div>
        <div className=\"ml-4 flex-1\">
          <h3 className=\"text-sm font-medium text-gray-500 uppercase tracking-wide\">
            {title}
          </h3>
          <div className=\"flex items-baseline\">
            <p className={`text-3xl font-bold ${colors.text}`}>
              {formatValue(value)}
            </p>
            {trend && (
              <span
                className={`ml-2 text-sm font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className=\"text-sm text-gray-500 mt-1\">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default KPICard;