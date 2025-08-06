import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cva, type VariantProps } from 'class-variance-authority';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Card variants using CVA
export const cardVariants = cva(
  'rounded-lg border p-6 shadow-sm transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-slate-900/80 backdrop-blur-sm border-slate-700/50',
        secondary: 'bg-slate-800/50 backdrop-blur-sm border-slate-600/50',
        cosmic: 'bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border-purple-500/30',
        glass: 'bg-slate-900/50 backdrop-blur-sm border-slate-700/50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// Badge variants using CVA
export const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-slate-700 text-slate-100',
        secondary: 'bg-slate-600/50 text-slate-200',
        outline: 'border border-slate-600 text-slate-300 bg-transparent',
        fire: 'bg-red-500/20 text-red-300 border border-red-500/30',
        earth: 'bg-green-500/20 text-green-300 border border-green-500/30',
        air: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
        water: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
        purple: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
        orange: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
        pink: 'bg-pink-500/20 text-pink-300 border border-pink-500/30',
        gray: 'bg-slate-500/20 text-slate-300 border border-slate-500/30',
        teal: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// Button variants using CVA
export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-slate-900 text-slate-50 hover:bg-slate-800',
        secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
        ghost: 'hover:bg-slate-700/50 hover:text-slate-100 text-slate-400',
        outline: 'border border-slate-600 text-slate-300 hover:bg-slate-700/50',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export type CardVariants = VariantProps<typeof cardVariants>;
export type BadgeVariants = VariantProps<typeof badgeVariants>;
export type ButtonVariants = VariantProps<typeof buttonVariants>;
