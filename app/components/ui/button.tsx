import * as React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Optional loading state to show spinner inside */
  loading?: boolean;
  /** Optional icon to show left of children */
  iconLeft?: React.ReactNode;
  /** Optional icon to show right of children */
  iconRight?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ loading = false, iconLeft, iconRight, children, className = '', ...props }, ref) => (
    <button ref={ref} className={className} disabled={props.disabled || loading} {...props}>
      {iconLeft && <span className="mr-2 h-4 w-4">{iconLeft}</span>}
      {loading ? (
        <span className="flex items-center gap-2">
          {/* Loader2 icon from lucide-react */}
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l4 2-4 4V8z"
            />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        <>
          {children}
          {iconRight && <span className="ml-2 h-4 w-4">{iconRight}</span>}
        </>
      )}
    </button>
  ),
);

Button.displayName = 'Button';
