import React, { useState } from 'react';
import { FaEnvelope, FaCheck, FaSpinner } from 'react-icons/fa';
import { EducationalTooltip } from './EducationalTooltip';

interface BlogSubscriptionProps {
  variant?: 'inline' | 'modal' | 'sidebar';
  className?: string;
}

const BlogSubscription: React.FC<BlogSubscriptionProps> = ({
  variant = 'inline',
  className = '',
}) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email?.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');

    try {
      // In a real app, this would call your backend API or email service
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate success (you'd replace this with actual API call)
      setStatus('success');
      setMessage(
        'Welcome to the cosmic community! Check your email for confirmation.'
      );
      setEmail('');

      // Reset after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');

      // Reset error after 3 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    }
  };

  const baseClasses = `relative ${className}`;

  if (variant === 'sidebar') {
    return (
      <div
        className={`${baseClasses} bg-gradient-to-br from-cosmic-purple/10 to-cosmic-blue/10 rounded-xl p-6 border border-cosmic-silver/10 sticky top-8`}
      >
        <div className='text-center mb-4'>
          <div className='w-12 h-12 bg-cosmic-gold/20 rounded-full flex items-center justify-center mx-auto mb-3'>
            <FaEnvelope className='text-cosmic-gold' />
          </div>
          <h3 className='text-lg font-bold text-cosmic-gold mb-2 font-cinzel'>
            Stay Connected
          </h3>
          <p className='text-sm text-cosmic-silver/80'>
            Get weekly cosmic insights delivered to your inbox
          </p>
        </div>

        {status === 'success' ? (
          <div className='text-center py-4'>
            <FaCheck className='text-green-400 text-2xl mx-auto mb-2' />
            <p className='text-green-400 text-sm'>{message}</p>
          </div>
        ) : (
          <form
            onSubmit={e => {
              void handleSubmit(e);
            }}
            className='space-y-3'
          >
            <input
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='your@email.com'
              className='w-full px-3 py-2 bg-cosmic-dark/50 border border-cosmic-silver/20 rounded-lg text-cosmic-silver text-sm placeholder-cosmic-silver/60 focus:outline-none focus:ring-2 focus:ring-cosmic-purple/50 focus:border-cosmic-purple/50'
              disabled={status === 'loading'}
            />
            <button
              type='submit'
              disabled={status === 'loading'}
              className='w-full px-4 py-2 bg-gradient-to-r from-cosmic-gold to-cosmic-purple text-cosmic-dark rounded-lg font-semibold text-sm hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2'
            >
              {status === 'loading' ? (
                <>
                  <FaSpinner className='animate-spin' />
                  Subscribing...
                </>
              ) : (
                <>
                  <FaEnvelope />
                  Subscribe
                </>
              )}
            </button>
            {message && status === 'error' && (
              <p className='text-red-400 text-xs text-center'>{message}</p>
            )}
          </form>
        )}
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div className={`${baseClasses} max-w-md mx-auto`}>
        <div className='text-center mb-6'>
          <div className='w-16 h-16 bg-cosmic-gold/20 rounded-full flex items-center justify-center mx-auto mb-4'>
            <FaEnvelope className='text-cosmic-gold text-xl' />
          </div>
          <h2 className='text-2xl font-bold text-cosmic-gold mb-2 font-cinzel'>
            Never Miss an Insight
          </h2>
          <p className='text-cosmic-silver/80'>
            Join thousands of cosmic explorers receiving weekly wisdom,
            exclusive content, and early access to new features.
          </p>
        </div>

        {status === 'success' ? (
          <div className='text-center py-8'>
            <FaCheck className='text-green-400 text-3xl mx-auto mb-4' />
            <p className='text-green-400'>{message}</p>
          </div>
        ) : (
          <form
            onSubmit={e => {
              void handleSubmit(e);
            }}
            className='space-y-4'
          >
            <input
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='Enter your email address'
              className='w-full px-4 py-3 bg-cosmic-dark/50 border border-cosmic-silver/20 rounded-lg text-cosmic-silver placeholder-cosmic-silver/60 focus:outline-none focus:ring-2 focus:ring-cosmic-purple/50 focus:border-cosmic-purple/50'
              disabled={status === 'loading'}
            />
            <button
              type='submit'
              disabled={status === 'loading'}
              className='w-full px-6 py-3 bg-gradient-to-r from-cosmic-gold to-cosmic-purple text-cosmic-dark rounded-lg font-semibold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2'
            >
              {status === 'loading' ? (
                <>
                  <FaSpinner className='animate-spin' />
                  Subscribing...
                </>
              ) : (
                <>
                  <FaEnvelope />
                  Subscribe to Newsletter
                </>
              )}
            </button>
            {message && status === 'error' && (
              <p className='text-red-400 text-sm text-center'>{message}</p>
            )}
            <p className='text-xs text-cosmic-silver/60 text-center'>
              No spam, unsubscribe anytime. We respect your cosmic privacy.
            </p>
          </form>
        )}
      </div>
    );
  }

  // Inline variant (default)
  return (
    <div
      className={`${baseClasses} bg-gradient-to-r from-cosmic-purple/20 to-cosmic-blue/20 rounded-2xl p-8 border border-cosmic-silver/10`}
    >
      <div className='max-w-2xl mx-auto text-center'>
        <h3 className='text-2xl font-bold text-cosmic-gold mb-4 font-cinzel'>
          Stay Updated with Cosmic Wisdom
        </h3>
        <p className='text-cosmic-silver mb-6'>
          Get the latest insights on astrology, numerology, human design, and
          consciousness delivered weekly. Join our community of cosmic explorers
          and never miss a revelation.
        </p>

        {status === 'success' ? (
          <div className='py-4'>
            <FaCheck className='text-green-400 text-2xl mx-auto mb-2' />
            <p className='text-green-400'>{message}</p>
          </div>
        ) : (
          <form
            onSubmit={e => {
              void handleSubmit(e);
            }}
            className='flex flex-col sm:flex-row gap-4 max-w-md mx-auto'
          >
            <input
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='Enter your email address'
              className='flex-1 px-4 py-3 bg-cosmic-dark/50 border border-cosmic-silver/20 rounded-lg text-cosmic-silver placeholder-cosmic-silver/60 focus:outline-none focus:ring-2 focus:ring-cosmic-purple/50 focus:border-cosmic-purple/50'
              disabled={status === 'loading'}
            />
            <EducationalTooltip
              title='Newsletter Benefits'
              description='Weekly cosmic insights, exclusive content, early access to features, and special offers for premium subscribers.'
            >
              <button
                type='submit'
                disabled={status === 'loading'}
                className='px-8 py-3 bg-gradient-to-r from-cosmic-gold to-cosmic-purple text-cosmic-dark rounded-lg font-semibold hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 whitespace-nowrap'
              >
                {status === 'loading' ? (
                  <>
                    <FaSpinner className='animate-spin' />
                    <span className='hidden sm:inline'>Subscribing...</span>
                  </>
                ) : (
                  <>
                    <FaEnvelope />
                    Subscribe
                  </>
                )}
              </button>
            </EducationalTooltip>
          </form>
        )}

        {message && status === 'error' && (
          <p className='text-red-400 text-sm mt-3'>{message}</p>
        )}

        <p className='text-xs text-cosmic-silver/60 mt-4'>
          No spam, unsubscribe anytime. We respect your cosmic privacy.
        </p>
      </div>
    </div>
  );
};

export default BlogSubscription;
