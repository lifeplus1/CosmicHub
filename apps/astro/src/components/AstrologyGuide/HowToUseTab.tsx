import React from 'react';
import { FaBook, FaLightbulb, FaHeart, FaCheckCircle } from 'react-icons/fa';

const HowToUseTab: React.FC = React.memo(() => {
  return (
    <div className="flex flex-col space-y-8">
      <h3 className="mb-4 text-2xl font-bold text-gold-300">How to Use Your Chart</h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="shadow-md cosmic-card">
          <div className="p-4">
            <div className="flex items-center mb-2 space-x-3">
              <FaBook className="text-2xl text-blue-500" />
              <h4 className="text-sm font-bold">Reading Basics</h4>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-sm text-cosmic-silver">
                <FaCheckCircle className="text-green-500" />
                <span>Start with Sun, Moon, Rising signs</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-cosmic-silver">
                <FaCheckCircle className="text-green-500" />
                <span>Look at planets in signs and houses</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-cosmic-silver">
                <FaCheckCircle className="text-green-500" />
                <span>Examine major aspects between planets</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-cosmic-silver">
                <FaCheckCircle className="text-green-500" />
                <span>Consider elemental and modal balances</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="shadow-md cosmic-card">
          <div className="p-4">
            <div className="flex items-center mb-2 space-x-3">
              <FaLightbulb className="text-2xl text-yellow-500" />
              <h4 className="text-sm font-bold">Practical Applications</h4>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-sm text-cosmic-silver">
                <FaCheckCircle className="text-green-500" />
                <span>Self-awareness and personal growth</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-cosmic-silver">
                <FaCheckCircle className="text-green-500" />
                <span>Career and life path guidance</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-cosmic-silver">
                <FaCheckCircle className="text-green-500" />
                <span>Relationship compatibility</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-cosmic-silver">
                <FaCheckCircle className="text-green-500" />
                <span>Understanding current challenges</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-cosmic-silver">
                <FaCheckCircle className="text-green-500" />
                <span>Timing important events (launches, moves, etc.)</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-cosmic-silver">
                <FaCheckCircle className="text-green-500" />
                <span>Personal growth and spiritual development</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="shadow-md cosmic-card">
          <div className="p-4">
            <div className="flex items-center mb-2 space-x-3">
              <FaHeart className="text-2xl text-pink-500" />
              <h4 className="text-sm font-bold">Synastry Best Practices</h4>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-sm text-cosmic-silver">
                <FaCheckCircle className="text-green-500" />
                <span>Both partners need accurate birth data</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-cosmic-silver">
                <FaCheckCircle className="text-green-500" />
                <span>Focus on Moon, Venus, Mars connections</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-cosmic-silver">
                <FaCheckCircle className="text-green-500" />
                <span>Consider composite charts for relationship essence</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-cosmic-silver">
                <FaCheckCircle className="text-green-500" />
                <span>Remember compatibility isn't just about "good" aspects</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
});

HowToUseTab.displayName = 'HowToUseTab';

export default HowToUseTab;