// app/components/TopBar.tsx
import React from 'react';

const TopBar: React.FC = () => {
  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white shadow-md flex items-center px-6 justify-between z-10">
      <div className="text-xl font-semibold">Project Manager Dashboard</div>
      <div className="flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search..."
          className="border rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          <span>PM</span>
        </div>
      </div>
    </header>
  );
};

export default TopBar;