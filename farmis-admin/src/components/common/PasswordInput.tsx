import { forwardRef, useState } from 'react';

import { Eye, EyeOff } from 'lucide-react';

import { Input, type InputProps } from './Input';

export type PasswordInputProps = Omit<InputProps, 'type'>;

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ trailingIcon, ...rest }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <Input
        ref={ref}
        {...rest}
        type={visible ? 'text' : 'password'}
        trailingIcon={
          <span className="inline-flex shrink-0 items-center gap-1">
            {trailingIcon}
            <button
              type="button"
              className="-mr-1 rounded p-1 text-ink-400 outline-none hover:text-ink-600 focus-visible:ring-2 focus-visible:ring-brand-500/40"
              aria-label={visible ? 'Hide password' : 'Show password'}
              aria-pressed={visible}
              onClick={() => setVisible((v) => !v)}
            >
              {visible ? (
                <EyeOff className="h-4 w-4" aria-hidden />
              ) : (
                <Eye className="h-4 w-4" aria-hidden />
              )}
            </button>
          </span>
        }
      />
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
