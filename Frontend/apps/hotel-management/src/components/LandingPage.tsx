'use client'

import React from 'react';
import Link from 'next/link';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1>Manage Your Hotel with Ease</h1>
            <p>Complete hotel management solution for modern hospitality</p>
            <div className="cta-buttons">
              <Link href="/register" className="btn btn-primary">Register Your Hotel</Link>
              <Link href="/login" className="btn btn-outline">Login</Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <i className="fas fa-hotel"></i>
              <h3>Room Management</h3>
              <p>Manage rooms, pricing, and availability</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-calendar-alt"></i>
              <h3>Booking System</h3>
              <p>Handle reservations and guest management</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-chart-line"></i>
              <h3>Analytics</h3>
              <p>Track performance and revenue</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;