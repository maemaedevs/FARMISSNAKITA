import {
  LayoutDashboard,
  UsersRound,
  Wheat,
  HandHeart,
  ClipboardCheck,
  FileText,
  Package,
  ShieldCheck,
  Settings,
  UserCog,
  Bell,
  LogOut,
  type LucideIcon,
} from 'lucide-react';

export interface NavChild {
  label: string;
  to: string;
}

export interface NavLinkItem {
  type: 'link';
  label: string;
  to: string;
  icon: LucideIcon;
  badge?: number;
}

export interface NavGroupItem {
  type: 'group';
  label: string;
  icon: LucideIcon;
  basePath: string;
  children: readonly NavChild[];
}

export type NavEntry = NavLinkItem | NavGroupItem;

export const NAV_ITEMS: readonly NavEntry[] = [
  { type: 'link', label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { type: 'link', label: 'Farmers', to: '/farmers', icon: UsersRound },
  { type: 'link', label: 'Crop & Harvest', to: '/crop-harvest', icon: Wheat },
  {
    type: 'group',
    label: 'Assistance Programs',
    icon: HandHeart,
    basePath: '/assistance-programs',
    children: [
      { label: 'Distributions', to: '/assistance-programs/distributions' },
      { label: 'Programs List', to: '/assistance-programs/programs' },
    ],
  },
  {
    type: 'link',
    label: 'Transactions & Approvals',
    to: '/transactions',
    icon: ClipboardCheck,
  },
  { type: 'link', label: 'Reports', to: '/reports', icon: FileText },
  {
    type: 'group',
    label: 'Inventory & Stocks',
    icon: Package,
    basePath: '/inventory',
    children: [
      { label: 'Overview', to: '/inventory/overview' },
      { label: 'Crops', to: '/inventory/crops' },
      { label: 'Fertilizers', to: '/inventory/fertilizers' },
      { label: 'Equipment', to: '/inventory/equipment' },
      { label: 'Seeds', to: '/inventory/seeds' },
      { label: 'Pesticides', to: '/inventory/pesticides' },
      { label: 'Others', to: '/inventory/others' },
    ],
  },
  {
    type: 'link',
    label: 'Document Verification',
    to: '/document-verification',
    icon: ShieldCheck,
  },
  { type: 'link', label: 'System Settings', to: '/settings', icon: Settings },
  { type: 'link', label: 'Users & Roles', to: '/users', icon: UserCog },
] as const;

export const SECONDARY_NAV_ITEMS: readonly NavLinkItem[] = [
  {
    type: 'link',
    label: 'System Notifications',
    to: '/notifications',
    icon: Bell,
    badge: 3,
  },
] as const;

export { LogOut };
