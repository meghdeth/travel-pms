import React from 'react';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: '🏨',
      title: 'Room Management',
      description: 'Efficiently manage room inventory, pricing, and availability with real-time updates.'
    },
    {
      icon: '📅',
      title: 'Booking System',
      description: 'Handle reservations, check-ins, and guest management seamlessly.'
    },
    {
      icon: '💰',
      title: 'Revenue Analytics',
      description: 'Track performance with detailed reports and revenue optimization insights.'
    },
    {
      icon: '🛎️',
      title: 'Guest Services',
      description: 'Enhance guest experience with integrated service management tools.'
    },
    {
      icon: '🧹',
      title: 'Housekeeping',
      description: 'Coordinate housekeeping operations and maintenance schedules efficiently.'
    },
    {
      icon: '📊',
      title: 'Business Intelligence',
      description: 'Make data-driven decisions with comprehensive analytics and reporting.'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Manage Your Hotel
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive PMS solution covers every aspect of hotel operations, from reservations to revenue management.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;