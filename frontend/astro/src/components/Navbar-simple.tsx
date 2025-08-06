import React from 'react';

export default function Navbar(): JSX.Element {
  return (
    <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
              Cosmic Hub
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <a href="/" className="text-white hover:text-purple-300 px-3 py-2 rounded-md text-sm font-medium">
              Home
            </a>
            <a href="/chart" className="text-white hover:text-purple-300 px-3 py-2 rounded-md text-sm font-medium">
              Chart
            </a>
            <a href="/login" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Login
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
