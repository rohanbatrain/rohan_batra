import * as React from 'react';

import { cn } from '@/lib/utils';

export interface SwitchProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  // This interface extends base input props and can have additional properties added as needed
  checked?: boolean;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type='checkbox'
        className={cn('peer sr-only', className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Switch.displayName = 'Switch';

export { Switch };
