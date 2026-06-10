import type { StockCategory, StockItem } from '@/types';

export const TOTAL_STOCK_ITEMS = 256;
export const TOTAL_QUANTITY = 5842;
export const TOTAL_INVENTORY_VALUE = 1_485_230;
export const LAST_INVENTORY_UPDATE = '2025-05-10T17:30:00';

export const STOCK_ITEMS: StockItem[] = [
  {
    id: '1',
    stockCode: 'STK-001',
    name: 'Rice Seeds (Inbred)',
    description: 'Certified inbred rice seeds — NSIC Rc 222',
    category: 'Seeds',
    unit: 'kg',
    quantity: 420,
    unitValuePeso: 45,
    status: 'in_stock',
    updatedAt: '2025-05-10T14:20:00',
    icon: 'seed',
  },
  {
    id: '2',
    stockCode: 'STK-002',
    name: 'Organic Fertilizer',
    description: '50kg bags — vermicompost blend',
    category: 'Fertilizers',
    unit: 'bags (50kg)',
    quantity: 85,
    unitValuePeso: 1250,
    status: 'in_stock',
    updatedAt: '2025-05-10T11:00:00',
    icon: 'fertilizer',
  },
  {
    id: '3',
    stockCode: 'STK-003',
    name: 'Hand Tractor',
    description: 'Shared farm equipment unit #HT-04',
    category: 'Equipment',
    unit: 'unit',
    quantity: 3,
    unitValuePeso: 185_000,
    status: 'in_stock',
    updatedAt: '2025-05-09T16:45:00',
    icon: 'equipment',
  },
  {
    id: '4',
    stockCode: 'STK-004',
    name: 'Hybrid Corn Seeds',
    description: 'High-yield hybrid corn — 2kg packs',
    category: 'Seeds',
    unit: 'pack',
    quantity: 28,
    unitValuePeso: 320,
    status: 'low_stock',
    updatedAt: '2025-05-09T09:30:00',
    icon: 'seed',
  },
  {
    id: '5',
    stockCode: 'STK-005',
    name: 'Dried Palay (Crop Stock)',
    description: 'Community warehouse — Grade A palay',
    category: 'Crops',
    unit: 'kg',
    quantity: 1200,
    unitValuePeso: 22,
    status: 'in_stock',
    updatedAt: '2025-05-08T15:10:00',
    icon: 'crop',
  },
  {
    id: '6',
    stockCode: 'STK-006',
    name: 'Insecticide (Organic)',
    description: 'Neem-based pest control — 1L bottles',
    category: 'Pesticides',
    unit: 'bottle',
    quantity: 64,
    unitValuePeso: 185,
    status: 'in_stock',
    updatedAt: '2025-05-08T10:00:00',
    icon: 'pesticide',
  },
  {
    id: '7',
    stockCode: 'STK-007',
    name: 'Vegetable Seed Starter Kit',
    description: 'Assorted leafy vegetable packets',
    category: 'Seeds',
    unit: 'kit',
    quantity: 12,
    unitValuePeso: 95,
    status: 'low_stock',
    updatedAt: '2025-05-07T13:25:00',
    icon: 'seed',
  },
  {
    id: '8',
    stockCode: 'STK-008',
    name: 'Irrigation Hose & Fittings',
    description: 'Miscellaneous supplies — assorted sizes',
    category: 'Others',
    unit: 'set',
    quantity: 45,
    unitValuePeso: 850,
    status: 'in_stock',
    updatedAt: '2025-05-07T08:50:00',
    icon: 'box',
  },
];

export const CATEGORY_ROUTES: Record<
  string,
  { label: string; category: StockCategory | 'all' }
> = {
  overview: { label: 'All Stocks', category: 'all' },
  crops: { label: 'Crops', category: 'Crops' },
  fertilizers: { label: 'Fertilizers', category: 'Fertilizers' },
  equipment: { label: 'Equipment', category: 'Equipment' },
  seeds: { label: 'Seeds', category: 'Seeds' },
  pesticides: { label: 'Pesticides', category: 'Pesticides' },
  others: { label: 'Others', category: 'Others' },
};

export const CATEGORY_TABS = Object.entries(CATEGORY_ROUTES).map(
  ([slug, meta]) => ({
    slug,
    to: `/inventory/${slug}`,
    ...meta,
  }),
);
