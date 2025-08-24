'use client'

import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Rooms</h3>
          <p className="text-3xl font-bold text-blue-600">45</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Available Rooms</h3>
          <p className="text-3xl font-bold text-green-600">12</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Occupied Rooms</h3>
          <p className="text-3xl font-bold text-red-600">33</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Today's Revenue</h3>
          <p className="text-3xl font-bold text-orange-600">$2,890</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;