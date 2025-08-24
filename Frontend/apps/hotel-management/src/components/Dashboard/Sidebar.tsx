'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Hotel, 
  Calendar, 
  Users, 
  Waves, 
  BarChart3, 
  UserCog 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../utils/auth';

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user: authUser } = useAuth();
  
  // Use fallback to sessionStorage if AuthContext user is null
  const user = authUser || auth.getUser();
  
  // Debug logging to see user object structure
  console.log('Sidebar - AuthContext user:', authUser);
  console.log('Sidebar - SessionStorage user:', auth.getUser());
  console.log('Sidebar - Final user object:', user);
  console.log('Sidebar - user.role:', user?.role);
  
  // Check if user is admin
  const isAdmin = user?.role === 'Hotel Admin' || auth.isAdmin();
  console.log('Sidebar - Is Admin:', isAdmin);
  
  // Determine correct dashboard path based on role
  const dashboardPath = isAdmin ? '/admin-dashboard' : '/staffdashboard';
  
  const baseMenu = [
    { path: dashboardPath, icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/rooms', icon: Hotel, label: 'Room Management' },
    { path: '/bookings', icon: Calendar, label: 'Bookings' },
    { path: '/facilities', icon: Waves, label: 'Facilities' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/profile', icon: UserCog, label: 'Profile' },
  ];

  // Only show staff management to admin users
  const menuItems = [...baseMenu];
  if (isAdmin) {
    menuItems.splice(3, 0, { path: '/staff', icon: Users, label: 'Staff Management' });
  }

  return (
    <div className="sidebar">
      <div className="sidebar-wrapper">
        <div className="sidebar-content">
          <ul className="nav nav-primary">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.path} className={`nav-item ${pathname === item.path ? 'active' : ''}`}>
                  <Link href={item.path}>
                    <IconComponent size={16} />
                    <p>{item.label}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;