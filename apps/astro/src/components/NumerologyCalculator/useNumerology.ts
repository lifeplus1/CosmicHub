import { useState } from 'react';
import { useToast } from '../ToastProvider';
import type { NumerologyData, NumerologyResult } from './types';

export const useNumerology = () => {
  const [formData, setFormData] = useState<NumerologyData>({
    name: '',
    year: new Date().getFullYear() - 30,
    month: 1,
    day: 1,
  });
  const [result, setResult] = useState<NumerologyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        description: 'Please enter your full name',
        status: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const birthDate = `${formData.year}-${String(formData.month).padStart(2, '0')}-${String(formData.day).padStart(2, '0')}`;
      const response = await fetch('/api/calculate-numerology', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          name: formData.name,
          birth_date: birthDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate numerology');
      }

      const data = await response.json();
      setResult(data.numerology);
      toast({
        description: 'Numerology Calculated',
        status: 'success'
      });
    } catch (err) {
      toast({
        description: err instanceof Error ? err.message : 'Unknown error',
        status: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return { formData, setFormData, result, loading, handleSubmit };
};