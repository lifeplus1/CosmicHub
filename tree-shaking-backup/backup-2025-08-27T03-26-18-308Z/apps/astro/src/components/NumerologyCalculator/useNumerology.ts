import {
  useState,
  type FormEvent,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { useToast } from '../ToastProvider';
import type { NumerologyData, NumerologyResult } from './types';

interface NumerologyApiResponse {
  numerology: NumerologyResult;
}

export const useNumerology = (): {
  formData: NumerologyData;
  setFormData: Dispatch<SetStateAction<NumerologyData>>;
  result: NumerologyResult | null;
  loading: boolean;
  handleSubmit: (e: FormEvent) => Promise<void>;
} => {
  const [formData, setFormData] = useState<NumerologyData>({
    name: '',
    year: new Date().getFullYear() - 30,
    month: 1,
    day: 1,
  });
  const [result, setResult] = useState<NumerologyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    const trimmedName = formData.name.trim();
    if (trimmedName.length === 0) {
      toast({
        description: 'Please enter your full name',
        status: 'error',
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
          Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
        },
        body: JSON.stringify({
          name: trimmedName,
          birth_date: birthDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate numerology');
      }

      const data: unknown = await response.json();
      if (data !== null && typeof data === 'object' && 'numerology' in data) {
        setResult((data as NumerologyApiResponse).numerology);
      } else {
        throw new Error('Malformed numerology response');
      }
      toast({
        description: 'Numerology Calculated',
        status: 'success',
      });
    } catch (err) {
      toast({
        description: err instanceof Error ? err.message : 'Unknown error',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return { formData, setFormData, result, loading, handleSubmit };
};
