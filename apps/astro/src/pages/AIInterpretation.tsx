// apps/astro/src/components/AIInterpretations.tsx

import React, { lazy, Suspense, useEffect, useState, memo } from 'react';
import { isDefined, isNonEmptyString, isNonEmptyArray } from '../utils/guards';
import { useQuery } from '@tanstack/react-query';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@cosmichub/config/firebase';
import { useAuth } from '@cosmichub/auth';
import { useParams } from 'react-router-dom';
import { Card, Button } from '@cosmichub/ui';
import type { Interpretation } from '../components/AIInterpretation/types';
import {
  fetchAIInterpretations,
  fetchSavedCharts,
  type SavedChart,
} from '../services/api';
import type { ChartId, UserId } from '../services/api.types';
import styles from './AIInterpretations.module.css';

// Simple Spinner component
const Spinner = () => (
  <div className='flex items-center justify-center p-4'>
    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
  </div>
);

// Lazy-load heavy components for performance
const InterpretationCard = lazy(
  () => import('../components/AIInterpretation/InterpretationCard')
);
const InterpretationForm = lazy(
  () => import('../components/AIInterpretation/InterpretationForm')
);

interface AIInterpretationsProps {
  chartId?: string;
  userId?: string;
}

const AIInterpretations: React.FC<AIInterpretationsProps> = ({
  chartId: propChartId,
  userId,
}) => {
  const { user } = useAuth();
  const { chartId: urlChartId } = useParams<{ chartId?: string }>();
  // auth instance currently unused; retained if future auth-specific operations are added
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const auth = getAuth();
  // Compute effective user id with explicit string guard chain
  const firebaseUid: string | undefined = isNonEmptyString(user?.uid)
    ? user?.uid
    : undefined;
  const effectiveUserId: string | undefined = isNonEmptyString(userId)
    ? userId
    : firebaseUid;
  // Use nullish coalescing for initial chart id; only fall back when left side is null/undefined
  const initialChartId = isNonEmptyString(propChartId)
    ? propChartId
    : isNonEmptyString(urlChartId)
      ? urlChartId
      : undefined;
  const [selectedChartId, setSelectedChartId] = useState<string | undefined>(
    initialChartId
  );
  const [interpretations, setInterpretations] = useState<Interpretation[]>([]);

  // Fetch saved charts for selection
  const {
    data: savedCharts = [],
    isLoading: chartsLoading,
    error: chartsError,
  } = useQuery({
    queryKey: ['savedCharts'],
    queryFn: fetchSavedCharts,
    enabled:
      user !== null && user !== undefined && initialChartId === undefined, // explicit undefined check retained
    staleTime: 30 * 1000,
  });

  // Helper function to format date display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Chart Selector Component
  const ChartSelector = () => {
    if (chartsLoading) {
      return (
        <div className='flex items-center justify-center p-8'>
          <Spinner />
          <span className='ml-3 text-cosmic-silver'>
            Loading your saved charts...
          </span>
        </div>
      );
    }

    if (chartsError !== null && chartsError !== undefined) {
      return (
        <div className='text-center p-8'>
          <div className='text-red-400 mb-4'>Error loading saved charts</div>
          <p className='text-cosmic-silver'>
            Please try again later or contact support.
          </p>
        </div>
      );
    }

    if (!isNonEmptyArray<SavedChart>(savedCharts)) {
      return (
        <div className='text-center py-16'>
          <div className='w-24 h-24 bg-cosmic-purple/20 rounded-full flex items-center justify-center mx-auto mb-6'>
            <span className='text-4xl'>📊</span>
          </div>
          <h3 className='text-2xl font-semibold text-cosmic-gold mb-4 font-playfair'>
            No Saved Charts Found
          </h3>
          <p className='text-cosmic-silver/80 mb-8 max-w-md mx-auto'>
            You need to create and save some charts first to get AI
            interpretations.
          </p>
          <Button
            onClick={() => (window.location.href = '/calculator')}
            className='bg-gradient-to-r from-cosmic-purple to-cosmic-blue hover:from-cosmic-purple/80 hover:to-cosmic-blue/80'
          >
            Create Your First Chart
          </Button>
        </div>
      );
    }

    return (
      <div className='space-y-6'>
        <div className='text-center mb-8'>
          <h2 className='text-3xl font-bold text-cosmic-gold mb-4 font-playfair'>
            Select a Chart for AI Interpretation
          </h2>
          <p className='text-cosmic-silver/80 max-w-2xl mx-auto'>
            Choose one of your saved charts to get personalized AI-powered
            astrological insights.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {savedCharts.map((chart: SavedChart) => (
            <Card key={chart.id} title=''>
              <div className='space-y-4'>
                {/* Chart Header */}
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <h3 className='text-lg font-semibold text-cosmic-gold mb-1'>
                      {isNonEmptyString(chart.name)
                        ? chart.name
                        : `${chart.birth_location} Chart`}
                    </h3>
                    <div className='flex items-center gap-2'>
                      <span className='px-2 py-1 text-xs bg-cosmic-purple/20 text-cosmic-purple rounded'>
                        {isNonEmptyString(chart.chart_type)
                          ? chart.chart_type
                          : 'Natal'}
                      </span>
                      <span className='text-cosmic-silver/70 text-sm'>
                        {formatDate(chart.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Chart Details */}
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-cosmic-silver/70'>Birth Date:</span>
                    <span className='text-cosmic-silver'>
                      {chart.birth_date}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-cosmic-silver/70'>Birth Time:</span>
                    <span className='text-cosmic-silver'>
                      {chart.birth_time}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-cosmic-silver/70'>Location:</span>
                    <span className='text-cosmic-silver'>
                      {chart.birth_location}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className='pt-4 border-t border-cosmic-silver/10'>
                  <Button
                    onClick={() => setSelectedChartId(chart.id)}
                    className='w-full bg-cosmic-gold hover:bg-cosmic-gold/80 text-cosmic-dark font-semibold'
                  >
                    Get AI Interpretation
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const noChartSelected = !isNonEmptyString(selectedChartId);

  // Fetch AI interpretations from backend with caching
  const { data, isLoading, error } = useQuery({
    queryKey: ['interpretations', selectedChartId, effectiveUserId],
    queryFn: async () => {
      if (
        !isNonEmptyString(effectiveUserId) ||
        !isNonEmptyString(selectedChartId)
      ) {
        throw new Error('User not authenticated or no chart selected');
      }
      const response = await fetchAIInterpretations(
        selectedChartId as ChartId,
        effectiveUserId as UserId
      );
      return response.data ?? [];
    },
    enabled:
      isNonEmptyString(effectiveUserId) && isNonEmptyString(selectedChartId),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  // Fetch stored interpretations from Firestore
  // Shared parsing helper to normalize raw interpretation objects
  const normalizeInterpretation = (
    raw: unknown,
    fallbackChartId: string | undefined,
    fallbackUserId: string | undefined
  ): Interpretation => {
    if (raw !== null && raw !== undefined && typeof raw === 'object') {
      const obj = raw as Record<string, unknown>;
      const tagsUnknown = (obj as { tags?: unknown }).tags;
      const confidenceUnknown = (obj as { confidence?: unknown }).confidence;
      return {
        id: typeof obj.id === 'string' ? obj.id : crypto.randomUUID(),
        chartId:
          typeof obj.chartId === 'string'
            ? obj.chartId
            : (fallbackChartId ?? 'unknown-chart'),
        userId:
          typeof obj.userId === 'string'
            ? obj.userId
            : (fallbackUserId ?? 'unknown-user'),
        type: typeof obj.type === 'string' ? obj.type : 'general',
        title:
          typeof obj.title === 'string' ? obj.title : 'Untitled Interpretation',
        content: typeof obj.content === 'string' ? obj.content : '',
        summary: typeof obj.summary === 'string' ? obj.summary : '',
        tags: Array.isArray(tagsUnknown) ? (tagsUnknown as string[]) : [],
        confidence:
          typeof confidenceUnknown === 'number' ? confidenceUnknown : 0,
        createdAt:
          typeof obj.createdAt === 'string'
            ? obj.createdAt
            : new Date().toISOString(),
        updatedAt:
          typeof obj.updatedAt === 'string'
            ? obj.updatedAt
            : new Date().toISOString(),
      };
    }
    return {
      id: crypto.randomUUID(),
      chartId: fallbackChartId ?? 'unknown-chart',
      userId: fallbackUserId ?? 'unknown-user',
      type: 'general',
      title: 'Untitled Interpretation',
      content: '',
      summary: '',
      tags: [],
      confidence: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  useEffect(() => {
    const fetchStoredInterpretations = async () => {
      if (
        !isNonEmptyString(effectiveUserId) ||
        !isNonEmptyString(selectedChartId)
      ) {
        return;
      }
      try {
        const q = query(
          collection(db, 'interpretations'),
          where('chartId', '==', selectedChartId as ChartId),
          where('userId', '==', effectiveUserId as UserId)
        );
        const snapshot = await getDocs(q);
        const fetchedInterpretations: Interpretation[] = snapshot.docs.map(
          doc =>
            normalizeInterpretation(
              { id: doc.id, ...doc.data() },
              selectedChartId,
              effectiveUserId
            )
        );
        setInterpretations(fetchedInterpretations);
      } catch {
        // Swallow fetch errors for now; could integrate a toast / telemetry system
      }
    };

    if (
      isNonEmptyString(effectiveUserId) &&
      isNonEmptyString(selectedChartId)
    ) {
      void fetchStoredInterpretations(); // explicit void to mark intentionally un-awaited promise
    }
  }, [selectedChartId, effectiveUserId]);

  // Combine API and Firestore data
  useEffect(() => {
    if (!isDefined(data) || !Array.isArray(data)) {
      return;
    }
    setInterpretations(prev => {
      const mapped: Interpretation[] = data.map(item =>
        normalizeInterpretation(item, selectedChartId, effectiveUserId)
      );
      return [...prev, ...mapped];
    });
  }, [data, selectedChartId, effectiveUserId]);

  if (noChartSelected) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <ChartSelector />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        {/* Header with Back Button */}
        <div className='flex items-center gap-4 mb-6'>
          <Button
            onClick={() => setSelectedChartId(undefined)}
            variant='secondary'
            className='flex items-center gap-2 text-cosmic-silver hover:text-cosmic-gold'
          >
            <svg
              className='w-4 h-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M15 19l-7-7 7-7'
              />
            </svg>
            Back to Chart Selection
          </Button>
        </div>

        <div
          className={styles.loading}
          role='status'
          aria-label='Loading interpretations'
        >
          <Spinner />
        </div>
      </div>
    );
  }

  if (error instanceof Error) {
    return (
      <div className='container mx-auto px-4 py-8'>
        {/* Header with Back Button */}
        <div className='flex items-center gap-4 mb-6'>
          <Button
            onClick={() => setSelectedChartId(undefined)}
            variant='secondary'
            className='flex items-center gap-2 text-cosmic-silver hover:text-cosmic-gold'
          >
            <svg
              className='w-4 h-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M15 19l-7-7 7-7'
              />
            </svg>
            Back to Chart Selection
          </Button>
        </div>

        <div className={styles.error} role='alert' aria-live='assertive'>
          Error loading interpretations: {error.message}
        </div>
      </div>
    );
  }

  const hasInterpretations = isNonEmptyArray<Interpretation>(interpretations);
  if (!hasInterpretations) {
    return (
      <div className='container mx-auto px-4 py-8'>
        {/* Header with Back Button */}
        <div className='flex items-center gap-4 mb-6'>
          <Button
            onClick={() => setSelectedChartId(undefined)}
            variant='secondary'
            className='flex items-center gap-2 text-cosmic-silver hover:text-cosmic-gold'
          >
            <svg
              className='w-4 h-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M15 19l-7-7 7-7'
              />
            </svg>
            Back to Chart Selection
          </Button>
        </div>

        <section
          className={styles.container}
          aria-labelledby='interpretations-heading'
        >
          <h2 id='interpretations-heading' className={styles.heading}>
            AI-Powered Astrological Insights
          </h2>

          {/* Generate First Interpretation */}
          <div className='mb-8'>
            <Suspense fallback={<Spinner />}>
              <InterpretationForm
                chartId={selectedChartId}
                mode='chart'
                onInterpretationGenerated={interpretation => {
                  setInterpretations(prev => [
                    ...prev,
                    interpretation as Interpretation,
                  ]);
                }}
              />
            </Suspense>
          </div>

          <div className={styles.empty} role='status' aria-live='polite'>
            <div className='text-center py-8'>
              <div className='w-16 h-16 bg-cosmic-purple/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl'>🔮</span>
              </div>
              <h3 className='text-xl font-semibold text-cosmic-gold mb-2'>
                No Interpretations Yet
              </h3>
              <p className='text-cosmic-silver/80'>
                Generate your first AI interpretation using the form above.
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Header with Back Button */}
      <div className='flex items-center gap-4 mb-6'>
        <Button
          onClick={() => setSelectedChartId(undefined)}
          variant='secondary'
          className='flex items-center gap-2 text-cosmic-silver hover:text-cosmic-gold'
        >
          <svg
            className='w-4 h-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M15 19l-7-7 7-7'
            />
          </svg>
          Back to Chart Selection
        </Button>
      </div>

      <section
        className={styles.container}
        aria-labelledby='interpretations-heading'
      >
        <h2 id='interpretations-heading' className={styles.heading}>
          AI-Powered Astrological Insights
        </h2>

        {/* Generate New Interpretation */}
        <div className='mb-8'>
          <Suspense fallback={<Spinner />}>
            <InterpretationForm
              chartId={selectedChartId}
              mode='chart'
              onInterpretationGenerated={interpretation => {
                // Refresh interpretations after generation
                setInterpretations(prev => [
                  ...prev,
                  interpretation as Interpretation,
                ]);
              }}
            />
          </Suspense>
        </div>

        {/* Existing Interpretations */}
        <Suspense fallback={<Spinner />}>
          <div className={styles.grid}>
            {interpretations.map(interpretation => (
              <InterpretationCard
                key={interpretation.id}
                interpretation={interpretation}
                aria-label={`Interpretation for ${interpretation.type}`}
              />
            ))}
          </div>
        </Suspense>
      </section>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export default memo(AIInterpretations);
