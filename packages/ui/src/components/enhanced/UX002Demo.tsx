/**
 * UX-002 Validation Test Component
 * Demonstrates all UX-002 components working together
 */

import React, { useState } from 'react';
import {
  StaggerAnimation,
  MorphingButton,
  FloatingActionButton,
  InteractiveRating,
  RippleButton,
  AnimatedTooltip,
  CountUp,
  SmoothProgress,
  TiltCard,
} from '../animation';

export const UX002Demo: React.FC = () => {
  const [buttonState, setButtonState] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [rating, setRating] = useState(4);
  const [progress, setProgress] = useState(65);
  const [counter, setCounter] = useState(1234);

  const handleButtonClick = () => {
    setButtonState('loading');
    setTimeout(() => {
      setButtonState('success');
      setTimeout(() => setButtonState('idle'), 2000);
    }, 2000);
  };

  const cards = [
    { id: 1, title: 'Animation Card 1', content: 'Smooth stagger animation' },
    {
      id: 2,
      title: 'Animation Card 2',
      content: 'Delightful micro-interactions',
    },
    { id: 3, title: 'Animation Card 3', content: 'Performance optimized' },
  ];

  return (
    <div className='min-h-screen bg-cosmic-dark text-cosmic-silver p-8'>
      <div className='max-w-6xl mx-auto space-y-12'>
        {/* Header with CountUp */}
        <div className='text-center space-y-4'>
          <h1 className='text-4xl font-bold text-cosmic-gold'>
            UX-002 Animation System Demo
          </h1>
          <div className='text-2xl'>
            Total Interactions:{' '}
            <CountUp value={counter} duration={2000} prefix='+' />
          </div>
        </div>

        {/* Stagger Animation Demo */}
        <section className='space-y-6'>
          <h2 className='text-2xl font-semibold text-cosmic-gold'>
            Stagger Animations
          </h2>
          <StaggerAnimation animation='fadeInUp' staggerDelay={200}>
            {cards.map(card => (
              <TiltCard key={card.id} className='mb-4'>
                <div className='bg-cosmic-purple/20 border border-cosmic-silver/30 rounded-lg p-6'>
                  <h3 className='text-xl font-semibold mb-2'>{card.title}</h3>
                  <p className='text-cosmic-silver/80'>{card.content}</p>
                </div>
              </TiltCard>
            ))}
          </StaggerAnimation>
        </section>

        {/* Interactive Components */}
        <section className='grid md:grid-cols-2 gap-8'>
          <div className='space-y-6'>
            <h2 className='text-2xl font-semibold text-cosmic-gold'>
              Interactive Elements
            </h2>

            {/* Morphing Button */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Morphing Button</h3>
              <MorphingButton
                state={buttonState}
                onClick={handleButtonClick}
                loadingChildren='Processing...'
                successChildren='✅ Complete!'
              >
                Click to Test
              </MorphingButton>
            </div>

            {/* Interactive Rating */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Interactive Rating</h3>
              <InteractiveRating
                rating={rating}
                maxRating={5}
                onRatingChange={setRating}
                size='lg'
                icon='star'
              />
              <p className='text-sm text-cosmic-silver/70'>
                Current: {rating}/5
              </p>
            </div>

            {/* Ripple Buttons */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Ripple Effects</h3>
              <div className='flex gap-4'>
                <RippleButton
                  variant='primary'
                  onClick={() => setCounter(prev => prev + 1)}
                >
                  Primary
                </RippleButton>
                <RippleButton
                  variant='secondary'
                  onClick={() => setCounter(prev => prev + 1)}
                >
                  Secondary
                </RippleButton>
                <RippleButton
                  variant='ghost'
                  onClick={() => setCounter(prev => prev + 1)}
                >
                  Ghost
                </RippleButton>
              </div>
            </div>
          </div>

          <div className='space-y-6'>
            <h2 className='text-2xl font-semibold text-cosmic-gold'>
              Progress & Feedback
            </h2>

            {/* Smooth Progress */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Smooth Progress</h3>
              <SmoothProgress
                value={progress}
                showLabel
                animated
                color='cosmic'
                size='lg'
              />
              <div className='flex gap-2'>
                <button
                  type='button'
                  className='px-3 py-1 bg-cosmic-purple rounded text-sm'
                  onClick={() => setProgress(Math.max(0, progress - 10))}
                >
                  -10%
                </button>
                <button
                  type='button'
                  className='px-3 py-1 bg-cosmic-purple rounded text-sm'
                  onClick={() => setProgress(Math.min(100, progress + 10))}
                >
                  +10%
                </button>
              </div>
            </div>

            {/* Animated Tooltips */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Animated Tooltips</h3>
              <div className='flex gap-4'>
                <AnimatedTooltip
                  content='Top tooltip with delay'
                  position='top'
                >
                  <button
                    type='button'
                    className='px-4 py-2 bg-cosmic-silver/20 rounded hover:bg-cosmic-silver/30'
                  >
                    Top
                  </button>
                </AnimatedTooltip>

                <AnimatedTooltip
                  content='Bottom tooltip'
                  position='bottom'
                  delay={200}
                >
                  <button
                    type='button'
                    className='px-4 py-2 bg-cosmic-silver/20 rounded hover:bg-cosmic-silver/30'
                  >
                    Bottom
                  </button>
                </AnimatedTooltip>

                <AnimatedTooltip content='Right tooltip' position='right'>
                  <button
                    type='button'
                    className='px-4 py-2 bg-cosmic-silver/20 rounded hover:bg-cosmic-silver/30'
                  >
                    Right
                  </button>
                </AnimatedTooltip>
              </div>
            </div>
          </div>
        </section>

        {/* Performance Note */}
        <section className='bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-cosmic-gold mb-2'>
            ⚡ Performance Optimized
          </h3>
          <p className='text-cosmic-silver/80'>
            All animations are hardware-accelerated and use Intersection
            Observer for optimal performance. They respect user preferences for
            reduced motion and are fully accessible.
          </p>
        </section>

        {/* Floating Action Button */}
        <FloatingActionButton
          icon='+'
          label='Add New Item'
          position='bottom-right'
          onClick={() => setCounter(prev => prev + 10)}
        />
      </div>
    </div>
  );
};
