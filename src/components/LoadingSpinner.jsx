import React from 'react';

const LoadingSpinner = ({ text = 'Chargement...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-14 w-14',
    md: 'h-20 w-20',
    lg: 'h-24 w-24',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="relative">
        <div className={`relative ${sizeClasses[size]}`}>
          <div className="absolute inset-0 rounded-full border-2 border-cafe-200/70" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cafe-700 border-r-cafe-500 animate-spin" />
          <div className="absolute inset-[8%] rounded-full bg-white/90 shadow-inner" />
          <img
            src="/icon.png"
            alt="El Nadhour"
            className="absolute inset-[22%] h-[56%] w-[56%] object-contain animate-pulse"
          />
        </div>
      </div>
      <p className="text-sm font-semibold text-cafe-700 md:text-base">{text}</p>
    </div>
  );
};

export default LoadingSpinner;