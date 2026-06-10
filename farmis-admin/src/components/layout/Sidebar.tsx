import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, LogOut } from 'lucide-react';
import {
  NAV_ITEMS,
  SECONDARY_NAV_ITEMS,
  type NavEntry,
  type NavLinkItem,
} from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/cn';
import { Logo } from './Logo';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { logout } = useAuth();
  const { pathname } = useLocation();
  const [expandedOverride, setExpandedOverride] = useState<
    Record<string, boolean>
  >({});

  const isGroupExpanded = (basePath: string) => {
    if (basePath in expandedOverride) return expandedOverride[basePath];
    return pathname.startsWith(basePath);
  };

  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-30 bg-ink-800/40 backdrop-blur-sm transition lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-ink-100 bg-white transition-transform lg:static',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex h-14 shrink-0 items-center border-b border-ink-100 px-4">
          <Logo compact={false} className="min-w-0" />
        </div>

        <nav className="flex min-h-0 flex-1 flex-col justify-between px-2 py-2">
          <ul className="flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.type === 'link' ? item.to : item.basePath}>
                {item.type === 'link' ? (
                  <SidebarLink item={item} onClick={onClose} />
                ) : (
                  <SidebarGroup
                    item={item}
                    expanded={isGroupExpanded(item.basePath)}
                    onToggle={() =>
                      setExpandedOverride((prev) => ({
                        ...prev,
                        [item.basePath]: !isGroupExpanded(item.basePath),
                      }))
                    }
                    onNavigate={onClose}
                  />
                )}
              </li>
            ))}
          </ul>

          <ul className="flex flex-col gap-0.5 border-t border-ink-100 pt-2">
            {SECONDARY_NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <SidebarLink item={item} onClick={onClose} />
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => void logout()}
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-ink-500 transition hover:bg-ink-50 hover:text-ink-800"
              >
                <LogOut className="h-3.5 w-3.5 shrink-0" />
                Log Out
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}

function SidebarLink({
  item,
  onClick,
}: {
  item: NavLinkItem;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      onClick={onClick}
      title={item.label}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition',
          isActive
            ? 'bg-brand-50 text-brand-700'
            : 'text-ink-500 hover:bg-ink-50 hover:text-ink-800',
        )
      }
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {typeof item.badge === 'number' && item.badge > 0 ? (
        <span className="inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold text-white">
          {item.badge}
        </span>
      ) : null}
    </NavLink>
  );
}

function SidebarGroup({
  item,
  expanded,
  onToggle,
  onNavigate,
}: {
  item: Extract<NavEntry, { type: 'group' }>;
  expanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  const { pathname } = useLocation();
  const Icon = item.icon;
  const isGroupActive = pathname.startsWith(item.basePath);

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        title={item.label}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition',
          isGroupActive
            ? 'bg-brand-50 text-brand-700'
            : 'text-ink-500 hover:bg-ink-50 hover:text-ink-800',
        )}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 shrink-0 transition-transform',
            expanded && 'rotate-180',
          )}
        />
      </button>

      {expanded ? (
        <ul className="mt-0.5 space-y-0.5 pl-4">
          {item.children.map((child) => (
            <li key={child.to}>
              <NavLink
                to={child.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-md py-1.5 pl-5 pr-2.5 text-xs font-medium transition',
                    isActive
                      ? 'text-brand-700'
                      : 'text-ink-500 hover:bg-ink-50 hover:text-ink-800',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'h-1.5 w-1.5 shrink-0 rounded-full',
                        isActive ? 'bg-brand-500' : 'bg-transparent',
                      )}
                    />
                    <span className="truncate">{child.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
