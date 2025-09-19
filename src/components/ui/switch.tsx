import * as React from 'react';

import { cn } from '@/lib/utils';

export interface SwitchProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
}

// A styled, accessible toggle switch that preserves input props
const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, disabled, ...props }, ref) => {
    return (
      <label className={cn('inline-flex items-center gap-2 select-none', disabled && 'opacity-60')}>
        <input
          type="checkbox"
          className={cn('peer sr-only')}
          ref={ref}
          checked={checked}
          disabled={disabled}
          {...props}
        />
        <span
          aria-hidden="true"
          className={cn(
            // Track
            'relative inline-flex h-6 w-11 rounded-full border-2 border-transparent transition-colors',
            'bg-gray-200 peer-checked:bg-gray-900 dark:bg-gray-700 dark:peer-checked:bg-gray-200',
            'focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gray-400',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer',
            className
          )}
        >
          <span
            className={cn(
              // Thumb
              'pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
              'translate-x-0 peer-checked:translate-x-5'
            )}
          />
        </span>
      </label>
    );
  }
);
Switch.displayName = 'Switch';

export { Switch };
