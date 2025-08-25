import React, { useState, useCallback } from 'react';
import { devConsole } from '../config/environment';

interface NumerologyData {
  fullName: string;
  birthDate: string;
}

const Numerology: React.FC = () => {
  const [numerologyData, setNumerologyData] = useState<NumerologyData>({
    fullName: '',
    birthDate: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    lifePath?: number;
    expression?: number;
    soulUrge?: number;
  }>({});

  devConsole.log?.('🔢 Numerology page rendered with data:', numerologyData);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      devConsole.log?.('📝 Numerology input changed:', { name, value });
      setNumerologyData(prev => ({ ...prev, [name]: value }));
    },
    []
  );

  const calculateLifePathNumber = useCallback((dateStr: string): number => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    let sum = day + month + year;
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum
        .toString()
        .split('')
        .reduce((acc, digit) => acc + parseInt(digit), 0);
    }
    return sum;
  }, []);

  const calculateExpressionNumber = useCallback((name: string): number => {
    const letterValues: { [key: string]: number } = {
      A: 1,
      B: 2,
      C: 3,
      D: 4,
      E: 5,
      F: 6,
      G: 7,
      H: 8,
      I: 9,
      J: 1,
      K: 2,
      L: 3,
      M: 4,
      N: 5,
      O: 6,
      P: 7,
      Q: 8,
      R: 9,
      S: 1,
      T: 2,
      U: 3,
      V: 4,
      W: 5,
      X: 6,
      Y: 7,
      Z: 8,
    };

    let sum = 0;
    for (const char of name.toUpperCase().replace(/[^A-Z]/g, '')) {
      sum += letterValues[char] ?? 0;
    }

    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum
        .toString()
        .split('')
        .reduce((acc, digit) => acc + parseInt(digit), 0);
    }
    return sum;
  }, []);

  const calculateSoulUrgeNumber = useCallback((name: string): number => {
    const vowelValues: { [key: string]: number } = {
      A: 1,
      E: 5,
      I: 9,
      O: 6,
      U: 3,
      Y: 7,
    };

    let sum = 0;
    for (const char of name.toUpperCase().replace(/[^A-Z]/g, '')) {
      sum += vowelValues[char] ?? 0;
    }

    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum
        .toString()
        .split('')
        .reduce((acc, digit) => acc + parseInt(digit), 0);
    }
    return sum;
  }, []);

  const handleCalculateNumbers = useCallback(() => {
    devConsole.log?.('🔢 Calculate numbers clicked with data:', numerologyData);

    if (
      numerologyData.fullName.trim() === '' ||
      numerologyData.birthDate.trim() === ''
    ) {
      alert('Please enter both your full name and birth date.');
      return;
    }

    setIsLoading(true);

    try {
      const lifePath = calculateLifePathNumber(numerologyData.birthDate);
      const expression = calculateExpressionNumber(numerologyData.fullName);
      const soulUrge = calculateSoulUrgeNumber(numerologyData.fullName);

      setResults({
        lifePath,
        expression,
        soulUrge,
      });

      devConsole.log?.('✅ Numerology calculations complete:', {
        lifePath,
        expression,
        soulUrge,
      });
    } catch (error) {
      devConsole.error('❌ Error calculating numerology:', error);
      alert('Error calculating your numbers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [
    numerologyData,
    calculateLifePathNumber,
    calculateExpressionNumber,
    calculateSoulUrgeNumber,
  ]);

  return (
    <div className='space-y-8'>
      {/* Hero Section */}
      <div className='text-center py-12 bg-gradient-to-r from-cosmic-gold/20 to-cosmic-purple/20 rounded-2xl border border-cosmic-silver/10'>
        <h1 className='text-4xl font-bold text-cosmic-gold mb-4 font-cinzel'>
          Numerology Calculator
        </h1>
        <p className='text-xl text-cosmic-silver/80 font-playfair'>
          Discover the mystical meanings behind the numbers in your life
        </p>
      </div>

      {/* Numerology Content */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-cosmic-blue/30 backdrop-blur-lg border border-cosmic-silver/20 rounded-xl p-8'>
          <div className='text-center mb-6'>
            <div className='w-16 h-16 bg-cosmic-gold/20 rounded-lg flex items-center justify-center mx-auto mb-4'>
              <span className='text-3xl'>📊</span>
            </div>
            <h2 className='text-2xl font-semibold text-cosmic-gold mb-4 font-playfair'>
              Core Numbers
            </h2>
          </div>

          <div className='space-y-6'>
            <div className='bg-cosmic-dark/30 rounded-lg p-4 border border-cosmic-silver/10'>
              <h3 className='text-lg font-semibold text-cosmic-gold mb-2'>
                Life Path Number
              </h3>
              <p className='text-cosmic-silver/80 text-sm mb-3'>
                Your life&apos;s purpose and the path you&apos;re meant to walk
              </p>
              <div className='w-12 h-12 bg-cosmic-purple/20 rounded-full flex items-center justify-center mx-auto'>
                <span className='text-xl font-bold text-cosmic-gold'>
                  {results.lifePath ?? '?'}
                </span>
              </div>
            </div>

            <div className='bg-cosmic-dark/30 rounded-lg p-4 border border-cosmic-silver/10'>
              <h3 className='text-lg font-semibold text-cosmic-gold mb-2'>
                Expression Number
              </h3>
              <p className='text-cosmic-silver/80 text-sm mb-3'>
                Your natural talents and abilities you&apos;re meant to develop
              </p>
              <div className='w-12 h-12 bg-cosmic-purple/20 rounded-full flex items-center justify-center mx-auto'>
                <span className='text-xl font-bold text-cosmic-gold'>
                  {results.expression ?? '?'}
                </span>
              </div>
            </div>

            <div className='bg-cosmic-dark/30 rounded-lg p-4 border border-cosmic-silver/10'>
              <h3 className='text-lg font-semibold text-cosmic-gold mb-2'>
                Soul Urge Number
              </h3>
              <p className='text-cosmic-silver/80 text-sm mb-3'>
                Your heart&apos;s desire and inner motivations
              </p>
              <div className='w-12 h-12 bg-cosmic-purple/20 rounded-full flex items-center justify-center mx-auto'>
                <span className='text-xl font-bold text-cosmic-gold'>
                  {results.soulUrge ?? '?'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className='bg-cosmic-blue/30 backdrop-blur-lg border border-cosmic-silver/20 rounded-xl p-8'>
          <div className='text-center mb-6'>
            <div className='w-16 h-16 bg-cosmic-purple/20 rounded-lg flex items-center justify-center mx-auto mb-4'>
              <span className='text-3xl'>✨</span>
            </div>
            <h2 className='text-2xl font-semibold text-cosmic-gold mb-4 font-playfair'>
              Calculate Your Numbers
            </h2>
          </div>

          <div className='space-y-4'>
            <div>
              <label
                htmlFor='full-name'
                className='block text-cosmic-silver/80 mb-2'
              >
                Full Name at Birth
              </label>
              <input
                id='full-name'
                name='fullName'
                type='text'
                value={numerologyData.fullName}
                onChange={handleInputChange}
                placeholder='Enter your full birth name'
                className='w-full px-4 py-2 bg-cosmic-blue/20 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-purple focus:outline-none'
                required
                aria-label='Enter your full birth name'
              />
            </div>
            <div>
              <label
                htmlFor='birth-date-numerology'
                className='block text-cosmic-silver/80 mb-2'
              >
                Date of Birth
              </label>
              <input
                id='birth-date-numerology'
                name='birthDate'
                type='date'
                value={numerologyData.birthDate}
                onChange={handleInputChange}
                className='w-full px-4 py-2 bg-cosmic-blue/20 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-purple focus:outline-none'
                required
                aria-label='date input'
              />
            </div>

            <button
              onClick={() => void handleCalculateNumbers()}
              disabled={
                isLoading ||
                numerologyData.fullName.trim() === '' ||
                numerologyData.birthDate.trim() === ''
              }
              className='w-full mt-6 px-6 py-3 bg-gradient-to-r from-cosmic-gold to-cosmic-purple hover:from-cosmic-gold/80 hover:to-cosmic-purple/80 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-lg transition-all duration-300 font-semibold disabled:cursor-not-allowed'
            >
              {isLoading ? (
                <div className='flex items-center justify-center'>
                  <div className='w-5 h-5 mr-2 border-b-2 border-white rounded-full animate-spin'></div>
                  Calculating...
                </div>
              ) : (
                'Calculate My Numbers'
              )}
            </button>

            <div className='mt-6 p-4 bg-cosmic-dark/30 rounded-lg border border-cosmic-silver/10'>
              <h4 className='text-cosmic-gold font-semibold mb-2'>
                About Numerology
              </h4>
              <p className='text-cosmic-silver/70 text-sm'>
                Numerology is the ancient study of numbers and their mystical
                significance in your life. Each number carries unique vibrations
                that can reveal insights about your personality, destiny, and
                life purpose.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Numerology;
