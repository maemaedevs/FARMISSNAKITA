import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes intelligently. Last conflicting class wins,
 * conditional classes can be passed as arrays/objects.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
