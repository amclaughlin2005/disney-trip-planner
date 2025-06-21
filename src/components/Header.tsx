import React from 'react';
import { Castle, Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-lg">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="flex items-center justify-center space-x-2 sm:space-x-3">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Castle size={24} className="sm:w-8 sm:h-8 text-disney-blue" />
            <Sparkles size={18} className="sm:w-6 sm:h-6 text-disney-yellow" />
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-disney-blue to-disney-purple bg-clip-text text-transparent text-center">
            Disney Trip Planner
          </h1>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Sparkles size={18} className="sm:w-6 sm:h-6 text-disney-yellow" />
            <Castle size={24} className="sm:w-8 sm:h-8 text-disney-blue" />
          </div>
        </div>
        <p className="text-center text-gray-600 mt-2 text-sm sm:text-base">
          Plan your magical Disney vacation with ease ✨
        </p>
      </div>
    </header>
  );
};

export default Header; 