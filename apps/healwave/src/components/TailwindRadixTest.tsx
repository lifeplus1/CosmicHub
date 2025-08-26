import React from 'react';
import * as Switch from '@radix-ui/react-switch';

const TailwindRadixTest: React.FC = () => {
  return (
    <div className="p-8 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Tailwind CSS & Radix UI Test
        </h1>
        
        {/* Tailwind CSS Tests */}
        <div className="mb-8 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
          <h2 className="text-2xl font-semibold mb-4">Tailwind CSS Utilities</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-500 rounded-lg text-center">
              <p className="text-white font-semibold">Blue Background</p>
            </div>
            <div className="p-4 bg-purple-500 rounded-lg text-center">
              <p className="text-white font-semibold">Purple Background</p>
            </div>
            <div className="p-4 bg-green-500 rounded-lg text-center">
              <p className="text-white font-semibold">Green Background</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mb-4">
            <button className="px-6 py-3 bg-gradient-to-r from-cosmic-gold to-yellow-500 text-cosmic-dark font-semibold rounded-lg transition-all duration-200 hover:scale-105 shadow-lg">
              Cosmic Gold Button
            </button>
            <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              Blue Button
            </button>
            <button className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors">
              Purple Button
            </button>
          </div>
          
          <div className="text-sm space-y-2">
            <p className="text-blue-300">This text should be blue-300</p>
            <p className="text-purple-300">This text should be purple-300</p>
            <p className="text-green-300">This text should be green-300</p>
          </div>
        </div>

        {/* Radix UI Tests */}
        <div className="mb-8 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
          <h2 className="text-2xl font-semibold mb-4">Radix UI Components</h2>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <label htmlFor="test-switch" className="text-lg font-medium">
                Toggle Switch:
              </label>
              <Switch.Root
                id="test-switch"
                className="w-11 h-6 bg-gray-600 rounded-full relative data-[state=checked]:bg-blue-600 outline-none cursor-pointer transition-colors"
              >
                <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-5" />
              </Switch.Root>
            </div>
            
            <div className="space-y-4">
              <p className="text-lg">Animation Classes Test:</p>
              <div className="flex flex-wrap gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full animate-spin"></div>
                <div className="w-12 h-12 bg-purple-500 rounded-full animate-pulse"></div>
                <div className="w-12 h-12 bg-green-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom CSS Classes Test */}
        <div className="p-6 glass rounded-xl">
          <h2 className="text-2xl font-semibold mb-4">Custom CSS Classes</h2>
          <div className="space-y-4">
            <div className="p-4 pulse-glow rounded-lg bg-blue-600/20">
              <p>This should have a pulsing glow effect (pulse-glow class)</p>
            </div>
            <div className="p-4 bg-purple-600/20 rounded-lg">
              <p>This container uses glassmorphism effect (glass class on parent)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailwindRadixTest;
