import * as React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Optional icon to show left of input */
  iconLeft?: React.ReactNode;
  /** Optional icon to show right of input */
  iconRight?: React.ReactNode;
  /** Optional prefix text */
  prefix?: string;
  /** Optional suffix text */
  suffix?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ iconLeft, iconRight, prefix, suffix, className = '', ...props }, ref) => (
    <div className="relative w-full">
      {iconLeft && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center pointer-events-none">
          {iconLeft}
        </div>
      )}
      {prefix && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center pointer-events-none">
          {prefix}
        </div>
      )}
      <input
        ref={ref}
        className={`
          pl-10 pr-4
          ${iconLeft || prefix ? 'pl-10' : 'pl-4'}
          ${iconRight || suffix ? 'pr-10' : 'pr-4'}
          w-full
          ${className}
        `}
        {...props}
      />
      {iconRight && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center pointer-events-none">
          {iconRight}
        </div>
      )}
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center pointer-events-none">
          {suffix}
        </div>
      )}
    </div>
  ),
);

Input.displayName = 'Input';
