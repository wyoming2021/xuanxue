'use client';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export function FormInput({
  label,
  error,
  hint,
  required,
  className = '',
  ...props
}: FormInputProps) {
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);

  const hasError = touched && error;
  const isValid = touched && !error && props.value;

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="flex items-center gap-1 text-sm font-medium">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          {...props}
          className={`h-12 w-full rounded-xl border bg-white px-4 pr-10 text-sm transition-all dark:bg-white/5 ${
            hasError
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-red-700'
              : isValid
                ? 'border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-green-700'
                : 'border-black/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:focus:border-indigo-400'
          } ${className}`}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            setTouched(true);
          }}
        />
        {touched && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {hasError ? (
              <AlertCircle size={16} className="text-red-500" />
            ) : isValid ? (
              <CheckCircle size={16} className="text-green-500" />
            ) : null}
          </div>
        )}
      </div>
      {(hasError || hint) && (
        <p className={`text-xs ${hasError ? 'text-red-500' : 'text-[#a3a3a3]'}`}>
          {hasError ? error : hint}
        </p>
      )}
    </div>
  );
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  options: { value: string; label: string }[];
}

export function FormSelect({
  label,
  error,
  hint,
  required,
  options,
  className = '',
  ...props
}: FormSelectProps) {
  const [touched, setTouched] = useState(false);

  const hasError = touched && error;
  const isValid = touched && !error && props.value;

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="flex items-center gap-1 text-sm font-medium">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          {...props}
          className={`h-12 w-full appearance-none rounded-xl border bg-white px-4 pr-10 text-sm transition-all dark:bg-white/5 ${
            hasError
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-red-700'
              : isValid
                ? 'border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-green-700'
                : 'border-black/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:focus:border-indigo-400'
          } ${className}`}
          onBlur={() => setTouched(true)}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <svg
            className="h-4 w-4 text-[#a3a3a3]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {(hasError || hint) && (
        <p className={`text-xs ${hasError ? 'text-red-500' : 'text-[#a3a3a3]'}`}>
          {hasError ? error : hint}
        </p>
      )}
    </div>
  );
}
