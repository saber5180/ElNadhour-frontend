import React from 'react';
import { Coffee } from 'lucide-react';

const LoadingSpinner = ({ text = 'Chargement...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        <Coffee className={`${sizeClasses[size]} text-cafe-600 animate-pulse`} />
        <div className="absolute inset-0 border-2 border-gray-300 border-t-cafe-700 rounded-full animate-spin"></div>
      </div>
      <p className="text-gray-600 font-medium">{text}</p>
    </div>
  );
};

export default LoadingSpinner;