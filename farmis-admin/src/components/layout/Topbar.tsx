import { Bell, ChevronDown, Menu, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user } = useAuth();
  const displayName = user?.name ?? 'Barangay Official';

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-ink-100 bg-white px-4 lg:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-md p-2 text-ink-500 hover:bg-ink-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="ml-auto flex items-center gap-4">
        <div className="hidden text-sm text-ink-600 sm:block">
          Welcome, <span className="font-semibold text-ink-800">{displayName}</span>
        </div>

        <button
          type="button"
          className="relative rounded-full p-2 text-ink-500 hover:bg-ink-100"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            8
          </span>
        </button>

        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full border border-ink-100 bg-white px-1.5 py-1 text-ink-500 hover:bg-ink-50"
          aria-label="Account menu"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-ink-100 text-ink-600">
            <User className="h-4 w-4" />
          </span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
