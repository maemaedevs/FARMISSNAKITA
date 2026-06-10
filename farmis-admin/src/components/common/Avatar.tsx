import { initials } from '@/utils/format';
import { cn } from '@/lib/cn';

interface AvatarProps {
  name: string;
  src?: string;
  size?: number;
  className?: string;
  /** When true, picks a deterministic color from `name`. */
  colorful?: boolean;
}

const PALETTE = [
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-orange-100 text-orange-700',
  'bg-teal-100 text-teal-700',
  'bg-fuchsia-100 text-fuchsia-700',
  'bg-lime-100 text-lime-700',
  'bg-indigo-100 text-indigo-700',
] as const;

function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function Avatar({
  name,
  src,
  size = 36,
  className,
  colorful = false,
}: AvatarProps) {
  const tone = colorful ? colorFor(name) : 'bg-brand-100 text-brand-800';

  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold',
        tone,
        className,
      )}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-xs">{initials(name) || '?'}</span>
      )}
    </div>
  );
}
