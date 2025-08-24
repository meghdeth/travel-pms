import React from 'react';
import Link from 'next/link';

const HeroSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Revolutionize Your Hotel Management
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Streamline operations, boost revenue, and deliver exceptional guest experiences with our comprehensive Hotel PMS solution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
              Start Free Trial
            </Link>
            <Link href="/login" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors">
              Login to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;