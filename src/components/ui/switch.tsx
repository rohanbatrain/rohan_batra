import * as React from 'react';
import * as RadixSwitch from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

export type SwitchProps = Omit<
  React.ComponentPropsWithoutRef<typeof RadixSwitch.Root>,
  'onChange'
> & {
  onChange?: (event: { currentTarget: { checked: boolean } }) => void;
};

const Switch = React.forwardRef<
  React.ElementRef<typeof RadixSwitch.Root>,
  SwitchProps
>(
  (
    { className, onCheckedChange, onChange, disabled, checked, ...props },
    ref
  ) => {
    const isChecked = Boolean(checked);
    const handleCheckedChange = React.useCallback(
      (checked: boolean) => {
        onCheckedChange?.(checked);
        if (onChange) {
          onChange({ currentTarget: { checked } });
        }
      },
      [onCheckedChange, onChange]
    );

    return (
      <RadixSwitch.Root
        ref={ref}
        disabled={disabled}
        onCheckedChange={handleCheckedChange}
        className={cn(
          'peer relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors overflow-hidden',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50',
          // Unchecked track
          'data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700 border-transparent',
          // Checked track: vibrant in light, brand accent in dark
          'data-[state=checked]:bg-blue-600 data-[state=checked]:hover:bg-blue-600/90 data-[state=checked]:border-blue-600/60',
          'dark:data-[state=checked]:bg-sidebar-primary dark:data-[state=checked]:hover:bg-sidebar-primary/90 dark:data-[state=checked]:border-sidebar-primary/60',
          isChecked
            ? 'bg-blue-600 hover:bg-blue-600/90 border-blue-600/60 dark:bg-sidebar-primary dark:hover:bg-sidebar-primary/90 dark:border-sidebar-primary/60'
            : 'bg-gray-200 dark:bg-gray-700 border-transparent',
          className
        )}
        checked={checked}
        {...props}
      >
        <RadixSwitch.Thumb
          className={cn(
            'pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ease-out will-change-transform',
            'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
            isChecked ? 'translate-x-5' : 'translate-x-0'
          )}
          style={{
            transform: isChecked ? 'translateX(20px)' : 'translateX(0px)',
          }}
        />
      </RadixSwitch.Root>
    );
  }
);
Switch.displayName = 'Switch';

export { Switch };
