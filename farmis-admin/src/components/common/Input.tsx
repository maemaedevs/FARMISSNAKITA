import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, hint, leadingIcon, trailingIcon, className, id, ...rest },
    ref,
  ) => {
    const inputId =
      id ?? `input-${Math.random().toString(36).slice(2, 8)}`;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label ? (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-ink-500"
          >
            {label}
          </label>
        ) : null}

        <div
          className={cn(
            'flex items-center gap-2 rounded-lg border border-ink-100 bg-white px-3 transition focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20',
            error && 'border-red-400 focus-within:border-red-500 focus-within:ring-red-500/20',
          )}
        >
          {leadingIcon ? (
            <span className="text-ink-400">{leadingIcon}</span>
          ) : null}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              'h-10 w-full bg-transparent text-sm text-ink-800 placeholder:text-ink-300 focus:outline-none',
              className,
            )}
            {...rest}
          />

          {trailingIcon ? (
            <span className="text-ink-400">{trailingIcon}</span>
          ) : null}
        </div>

        {error ? (
          <span className="text-xs text-red-600">{error}</span>
        ) : hint ? (
          <span className="text-xs text-ink-400">{hint}</span>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
