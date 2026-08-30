import * as React from 'react';

export const LoadingSpinner = () => (
  <span className="flex items-center gap-2">
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l4 2-4 4V8z" />
    </svg>
    <span>Loading...</span>
  </span>
);

LoadingSpinner.displayName = 'LoadingSpinner';
