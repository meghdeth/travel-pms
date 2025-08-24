'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { hotelAuthService } from 'shared/lib/hotelAuth';

const TopNavbar: React.FC = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await hotelAuthService.logout();
      console.log('Logout completed successfully');
      router.push('/login');
    } catch (error) {
      console.warn('Logout completed with warnings:', error);
      // Force logout even if API call fails
      router.push('/login');
    }
  };

  return (
    <nav className="navbar bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Hotel Management</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Welcome back!</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;