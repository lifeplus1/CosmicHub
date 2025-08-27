import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cva, type VariantProps } from 'class-variance-authority';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Card variants using CVA
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// Badge variants using CVA
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// Button variants using CVA
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
