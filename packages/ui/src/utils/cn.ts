import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind classes with clsx and tailwind-merge
 * This ensures that conflicting Tailwind classes are properly merged
 * and prevents duplication of classes.
 * 
 * @example
 * cn('px-4 py-2', 'bg-blue-500', { 'text-white': true })
 * // Returns: 'px-4 py-2 bg-blue-500 text-white'
 * 
 * @example
 * cn('px-4 py-2 bg-blue-500', 'bg-red-500')
 * // Returns: 'px-4 py-2 bg-red-500' (bg-red-500 overrides bg-blue-500)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
