// Updated Dashboard Layout
'use client'

import React from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import '../../styles/dashboard.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="dashboard-wrapper">
      <TopNavbar />
      <div className="dashboard-content">
        <Sidebar />
        <main className="main-panel">
          <div className="content">
            <div className="page-inner">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;