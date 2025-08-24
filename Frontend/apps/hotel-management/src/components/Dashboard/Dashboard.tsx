'use client'

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { auth } from '../../utils/auth';
import AdminDashboard from './AdminDashboard';
import FrontDeskDashboard from './FrontDeskDashboard';
import FinanceDashboard from './FinanceDashboard';
import TasksDashboard from './TasksDashboard';

const Dashboard: React.FC = () => {
  const { user: storeUser } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  
  // Use fallback to sessionStorage if Redux user is null
  const user = storeUser || auth.getUser();

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-6 w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-300 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getRoleName = () => {
    if (!user?.role) return 'Hotel Admin'
    if (typeof user.role === 'string') return user.role
    return (user.role as any)?.name || (user.role as any)?.code || 'Hotel Admin'
  }

  const renderDashboard = () => {
    const roleName = getRoleName()

    switch (roleName) {
      case 'Hotel Admin':
      case 'Manager':
        return <AdminDashboard />;
      case 'Front Desk':
        return <FrontDeskDashboard />;
      case 'Finance Department':
        return <FinanceDashboard />;
      case 'Maintenance':
      case 'Kitchen':
      case 'Service Boy':
        return <TasksDashboard />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName || 'User'}!
        </h1>
        <p className="text-gray-600 mt-1">
          {getRoleName()} Dashboard - {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
      
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;