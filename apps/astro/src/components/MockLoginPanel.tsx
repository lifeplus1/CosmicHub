import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastProvider';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '@cosmichub/config/firebase';
import { FaSignInAlt } from 'react-icons/fa';

interface MockUser {
  email: string;
  password: string;
  tier: 'free' | 'premium' | 'elite';
  displayName: string;
  description: string;
  features: string[];
}

const mockUsers: MockUser[] = [
  {
    email: 'free@cosmichub.test',
    password: 'demo123',
    tier: 'free',
    displayName: 'Free User',
    description: 'Basic astrology features',
    features: [
      'Basic birth chart calculation',
      'Western tropical astrology',
      'Limited saved charts (3)',
      'Basic interpretations',
    ],
  },
  {
    email: 'premium@cosmichub.test',
    password: 'demo123',
    tier: 'premium',
    displayName: 'Premium User',
    description: 'Enhanced astrology experience',
    features: [
      'Multi-system analysis',
      'Synastry compatibility',
      'PDF chart exports',
      'Unlimited saved charts',
      'Advanced interpretations',
    ],
  },
  {
    email: 'elite@cosmichub.test',
    password: 'demo123',
    tier: 'elite',
    displayName: 'Elite User',
    description: 'Complete cosmic toolkit',
    features: [
      'All Premium features',
      'AI interpretations',
      'Transit analysis & predictions',
      'Priority support',
      'Early access to new features',
    ],
  },
];

const MockLoginPanel: React.FC = React.memo(() => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleMockLogin = useCallback(
    async (mockUser: MockUser): Promise<void> => {
      try {
        await signInWithEmailAndPassword(
          auth,
          mockUser.email,
          mockUser.password
        );

        toast({
          title: `Logged in as ${mockUser.displayName}`,
          description: `You now have ${mockUser.tier} tier access`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        navigate('/chart');
      } catch (error: unknown) {
        // Narrow firebase auth error shape
        const err = error as { code?: string } | null;
        if (err && err.code === 'auth/user-not-found') {
          try {
            await createUserWithEmailAndPassword(
              auth,
              mockUser.email,
              mockUser.password
            );
            toast({
              title: 'Mock Account Created',
              description: `Created and logged in as ${mockUser.displayName}`,
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
            navigate('/chart');
          } catch {
            toast({
              title: 'Error',
              description: 'Failed to create mock account',
              status: 'error',
              duration: 3000,
              isClosable: true,
            });
          }
        } else {
          toast({
            title: 'Error',
            description: 'Failed to log in with mock account',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      }
    },
    [navigate, toast]
  );

  const getTierColor = (tier: MockUser['tier']): string => {
    switch (tier) {
      case 'free':
        return 'gray-500';
      case 'premium':
        return 'purple-500';
      case 'elite':
        return 'orange-500';
      default:
        return 'gray-500';
    }
  };

  return (
    <div className='max-w-3xl p-6 mx-auto'>
      <div className='flex flex-col space-y-6'>
        <div className='space-y-2 text-center'>
          <h2 className='text-2xl font-bold text-cosmic-gold'>
            Mock Login Panel
          </h2>
          <p className='text-cosmic-silver'>
            Use demo accounts for testing different tiers
          </p>
        </div>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
          {mockUsers.map(mockUser => (
            <div key={mockUser.email} className='cosmic-card'>
              <div className='p-4'>
                <div className='flex items-start justify-between space-x-4'>
                  <div className='flex flex-col flex-1 space-y-2'>
                    <h3 className='font-bold text-md text-cosmic-gold'>
                      {mockUser.displayName}
                    </h3>
                    <p className='text-sm text-cosmic-silver'>
                      {mockUser.description}
                    </p>
                  </div>
                  <div className='flex flex-col items-end space-y-2'>
                    <span
                      className={`bg-${getTierColor(mockUser.tier)}/20 text-${getTierColor(mockUser.tier)} px-2 py-1 rounded text-xs`}
                    >
                      {mockUser.tier}
                    </span>
                    <button
                      className='cosmic-button'
                      onClick={() => {
                        void handleMockLogin(mockUser);
                      }}
                      aria-label={`Login as ${mockUser.displayName}`}
                    >
                      <FaSignInAlt className='mr-2' />
                      Login
                    </button>
                  </div>
                </div>

                <div className='mt-4'>
                  <p className='mb-2 text-sm font-bold text-cosmic-silver'>
                    Available Features:
                  </p>
                  <div className='flex flex-col space-y-1'>
                    {mockUser.features.map((feature, index) => (
                      <p key={index} className='text-xs text-cosmic-silver/80'>
                        • {feature}
                      </p>
                    ))}
                  </div>
                </div>

                <div className='p-3 mt-4 rounded-md bg-gray-50/30'>
                  <p className='text-xs text-cosmic-silver/60'>
                    <strong>Email:</strong> {mockUser.email} <br />
                    <strong>Password:</strong> {mockUser.password}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <hr className='my-6 border-cosmic-silver/30' />

        <p className='text-sm text-center text-cosmic-silver/60'>
          These are mock accounts for testing purposes only. In production,
          subscription tiers would be managed through Stripe integration.
        </p>
      </div>
    </div>
  );
});

MockLoginPanel.displayName = 'MockLoginPanel';

export default MockLoginPanel;
