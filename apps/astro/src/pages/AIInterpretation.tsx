// apps/astro/src/components/AIInterpretations.tsx

import React, { lazy, Suspense, useEffect, useState, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@cosmichub/config/firebase';
import { useAuth } from '@cosmichub/auth';
import type { Interpretation } from '../components/AIInterpretation/types';
import { fetchAIInterpretations } from '../services/api';
import styles from './AIInterpretations.module.css';

// Simple Spinner component
const Spinner = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

// Lazy-load heavy components for performance
const InterpretationCard = lazy(() => import('../components/AIInterpretation/InterpretationCard'));

interface AIInterpretationsProps {
  chartId?: string;
  userId?: string;
}

const AIInterpretations: React.FC<AIInterpretationsProps> = ({ chartId, userId }) => {
  const { user } = useAuth();
  const auth = getAuth();
  const effectiveUserId = userId || user?.uid;

  // Early return if no chartId provided
  if (!chartId) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold mb-4">AI Interpretations</h2>
        <p className="text-gray-600">Please select a chart to view AI interpretations.</p>
      </div>
    );
  }

  const [interpretations, setInterpretations] = useState<Interpretation[]>([]);

  // Fetch AI interpretations from backend with caching
  const { data, isLoading, error } = useQuery({
    queryKey: ['interpretations', chartId, effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) throw new Error('User not authenticated');
      const response = await fetchAIInterpretations(chartId, effectiveUserId);
      return response.data;
    },
    enabled: !!effectiveUserId && !!chartId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 10, // Retain cache for 10 minutes
  });

  // Fetch stored interpretations from Firestore
  useEffect(() => {
    const fetchStoredInterpretations = async () => {
      if (!effectiveUserId || !chartId) return;
      try {
        const q = query(collection(db, 'interpretations'), where('chartId', '==', chartId), where('userId', '==', effectiveUserId));
        const snapshot = await getDocs(q);
        const fetchedInterpretations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Interpretation));
        setInterpretations(fetchedInterpretations);
      } catch (err) {
        console.error('Error fetching interpretations:', err);
      }
    };
    fetchStoredInterpretations();
  }, [chartId, effectiveUserId]);

  // Combine API and Firestore data
  useEffect(() => {
    if (data) {
      setInterpretations(prev => [...prev, ...data]);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className={styles.loading} role="status" aria-label="Loading interpretations">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error} role="alert" aria-live="assertive">
        Error loading interpretations: {error.message}
      </div>
    );
  }

  if (!interpretations.length) {
    return (
      <div className={styles.empty} role="status" aria-live="polite">
        No interpretations available for this chart.
      </div>
    );
  }

  return (
    <section className={styles.container} aria-labelledby="interpretations-heading">
      <h2 id="interpretations-heading" className={styles.heading}>AI-Powered Astrological Insights</h2>
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
  );
};

// Memoize to prevent unnecessary re-renders
export default memo(AIInterpretations);