import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 md:h-[4.25rem]">
          <Link
            to="/"
            className="flex items-center gap-3 sm:gap-3.5 -ml-0.5 sm:-ml-1 text-gray-900 hover:text-cafe-700 transition-colors"
          >
            <img
              src="/icon.png"
              alt="El Nadhour"
              className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 object-contain"
            />
            <span className="font-display text-xl sm:text-2xl font-semibold tracking-tight">
              El Nadhour
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
