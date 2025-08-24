import React from 'react';
import Link from 'next/link';

const CTASection: React.FC = () => {
  return (
    <section className="bg-blue-600 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to Transform Your Hotel Operations?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
          Join thousands of hotels worldwide who trust our PMS to streamline their operations and boost revenue.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
            Start Your Free Trial
          </Link>
          <Link href="/contact" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors">
            Schedule Demo
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;