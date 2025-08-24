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

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  
  // Debug logging to see user object structure
  console.log('Sidebar - Full user object:', user);
  console.log('Sidebar - user.role:', user?.role);
  console.log('Sidebar - user.role.name:', user?.role?.name);
  console.log('Sidebar - user.role.code:', user?.role?.code);
  
  // Check if user is admin (either by role name or code)
  const isAdmin = user?.role?.name === 'Hotel Admin' || user?.role?.code === '1' || user?.role === '1' || user?.role === 'Hotel Admin';
  console.log('Sidebar - Is Admin:', isAdmin);
  
  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/rooms', icon: Hotel, label: 'Room Management' },
    { path: '/bookings', icon: Calendar, label: 'Bookings' },
    // Only show Staff Management for Hotel Admins - Fixed role check
    ...(isAdmin ? [{ path: '/staff', icon: Users, label: 'Staff Management' }] : []),
    { path: '/facilities', icon: Waves, label: 'Facilities' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/profile', icon: UserCog, label: 'Profile' },
  ];

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