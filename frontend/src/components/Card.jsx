import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hover = true, 
  onClick, 
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-lg shadow-md p-6';
  const hoverClasses = hover ? 'hover:shadow-lg transition-shadow duration-200' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';
  
  const combinedClasses = `${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`;

  return (
    <div 
      className={combinedClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// Stats Card component
export const StatsCard = ({ icon, title, value, color = 'text-gray-600' }) => (
  <Card>
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <span className="text-3xl">{icon}</span>
      </div>
      <div className="ml-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className={`text-2xl font-bold ${color}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>
    </div>
  </Card>
);

// Quick Action Card component
export const QuickActionCard = ({ to, icon, title, description }) => (
  <Card 
    as="div"
    className="block hover:scale-105 transition-all duration-200"
  >
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </Card>
);

export default Card;
