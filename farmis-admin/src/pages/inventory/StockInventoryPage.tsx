import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Box,
  Clock,
  Download,
  Filter,
  FlaskConical,
  Layers,
  MoreVertical,
  Package,
  Plus,
  Search,
  Sprout,
  Tractor,
  Wheat,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button, Input, Select } from '@/components/common';
import { Pagination, StatCard } from '@/components/list';
import { cn } from '@/lib/cn';
import { formatDateTime, formatNumber, formatPeso } from '@/utils/format';
import type { StockCategory, StockItem, StockStatus } from '@/types';
import {
  CATEGORY_ROUTES,
  CATEGORY_TABS,
  STOCK_ITEMS,
  TOTAL_INVENTORY_VALUE,
  TOTAL_QUANTITY,
  TOTAL_STOCK_ITEMS,
} from './stocks.data';

const ITEM_ICONS: Record<StockItem['icon'], LucideIcon> = {
  seed: Sprout,
  fertilizer: FlaskConical,
  equipment: Tractor,
  crop: Wheat,
  pesticide: FlaskConical,
  box: Box,
};

const CATEGORY_STYLES: Record<StockCategory, string> = {
  Seeds: 'bg-violet-50 text-violet-700',
  Fertilizers: 'bg-sky-50 text-sky-700',
  Equipment: 'bg-amber-50 text-amber-700',
  Crops: 'bg-emerald-50 text-emerald-700',
  Pesticides: 'bg-orange-50 text-orange-700',
  Others: 'bg-ink-100 text-ink-600',
};

const STATUS_STYLES: Record<
  StockStatus,
  { pill: string; dot: string; label: string }
> = {
  in_stock: {
    pill: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
    label: 'In Stock',
  },
  low_stock: {
    pill: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
    label: 'Low Stock',
  },
  out_of_stock: {
    pill: 'bg-red-50 text-red-700',
    dot: 'bg-red-500',
    label: 'Out of Stock',
  },
};

export default function StockInventoryPage() {
  const { segment = 'overview' } = useParams<{ segment: string }>();
  const routeMeta = CATEGORY_ROUTES[segment] ?? CATEGORY_ROUTES.overview;
  const categoryFilter = routeMeta.category;

  const [query, setQuery] = useState('');
  const [categorySelect, setCategorySelect] = useState<'all' | StockCategory>(
    categoryFilter === 'all' ? 'all' : categoryFilter,
  );
  const [status, setStatus] = useState<'all' | StockStatus>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const activeCategory =
    categoryFilter !== 'all' ? categoryFilter : categorySelect;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return STOCK_ITEMS.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory)
        return false;
      if (status !== 'all' && item.status !== status) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.stockCode.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    });
  }, [query, activeCategory, status]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const pageTitle =
    segment === 'overview' ? 'STOCK INVENTORY' : routeMeta.label.toUpperCase();

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-ink-800">{pageTitle}</h1>
            <p className="mt-0.5 text-sm text-ink-400">
              View and manage inventory stocks for crops, equipment,
              fertilizers, and other supplies
            </p>
          </div>
        </div>

        <Button className="self-start sm:self-center">
          <Plus className="h-4 w-4" />
          Add New Stock
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Stock Items"
          value={formatNumber(TOTAL_STOCK_ITEMS)}
          hint="Across 6 categories"
          icon={Package}
          tone="brand"
        />
        <StatCard
          label="Total Quantity"
          value={formatNumber(TOTAL_QUANTITY)}
          hint="Total items in stock"
          icon={Layers}
          tone="emerald"
        />
        <StatCard
          label="Total Value"
          value={formatPeso(TOTAL_INVENTORY_VALUE)}
          hint="Total inventory value"
          icon={Box}
          tone="amber"
        />
        <StatCard
          label="Last Updated"
          value="May 10, 2025"
          hint="05:30 PM"
          icon={Clock}
          tone="violet"
        />
      </div>

      <div
        key={segment}
        className="overflow-hidden rounded-[var(--radius-card)] border border-ink-100 bg-white shadow-[var(--shadow-soft)]"
      >
        <div className="flex flex-col gap-3 border-b border-ink-100 p-4">
          <div className="flex flex-wrap gap-1 overflow-x-auto">
            {CATEGORY_TABS.map((tab) => (
              <Link
                key={tab.slug}
                to={tab.to}
                onClick={() => setPage(1)}
                className={cn(
                  'whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition',
                  segment === tab.slug
                    ? 'bg-brand-500 text-white'
                    : 'text-ink-500 hover:bg-ink-50',
                )}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1">
              <Input
                placeholder="Search stock name or type..."
                leadingIcon={<Search className="h-4 w-4" />}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {categoryFilter === 'all' ? (
                <div className="w-full sm:w-44">
                  <Select
                    value={categorySelect}
                    onChange={(e) => {
                      setCategorySelect(
                        e.target.value as 'all' | StockCategory,
                      );
                      setPage(1);
                    }}
                    options={[
                      { value: 'all', label: 'All Categories' },
                      { value: 'Crops', label: 'Crops' },
                      { value: 'Fertilizers', label: 'Fertilizers' },
                      { value: 'Equipment', label: 'Equipment' },
                      { value: 'Seeds', label: 'Seeds' },
                      { value: 'Pesticides', label: 'Pesticides' },
                      { value: 'Others', label: 'Others' },
                    ]}
                  />
                </div>
              ) : null}

              <div className="w-full sm:w-36">
                <Select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value as 'all' | StockStatus);
                    setPage(1);
                  }}
                  options={[
                    { value: 'all', label: 'All Status' },
                    { value: 'in_stock', label: 'In Stock' },
                    { value: 'low_stock', label: 'Low Stock' },
                    { value: 'out_of_stock', label: 'Out of Stock' },
                  ]}
                />
              </div>

              <Button variant="secondary" size="md">
                <Filter className="h-4 w-4" />
                Filter
              </Button>

              <Button variant="secondary" size="md">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-50 text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Item Name</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Unit</th>
                <th className="px-4 py-3 font-semibold">Quantity</th>
                <th className="px-4 py-3 font-semibold">Unit Value</th>
                <th className="px-4 py-3 font-semibold">Total Value</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Last Updated</th>
                <th className="px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {paginated.map((item) => (
                <StockRow key={item.id} item={item} />
              ))}
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-12 text-center text-sm text-ink-400"
                  >
                    No stock items match the current filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          pageSize={pageSize}
          total={TOTAL_STOCK_ITEMS}
          itemCount={paginated.length}
          entityLabel="items"
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>
    </>
  );
}

function StockRow({ item }: { item: StockItem }) {
  const Icon = ITEM_ICONS[item.icon];
  const statusStyle = STATUS_STYLES[item.status];
  const totalValue = item.quantity * item.unitValuePeso;

  return (
    <tr className="hover:bg-ink-50/60">
      <td className="px-4 py-3">
        <span className="font-medium text-brand-600">{item.stockCode}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-ink-800">{item.name}</div>
            <div className="line-clamp-1 text-xs text-ink-400">
              {item.description}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_STYLES[item.category]}`}
        >
          {item.category}
        </span>
      </td>
      <td className="px-4 py-3 text-ink-500">{item.unit}</td>
      <td className="px-4 py-3 font-medium text-ink-800">
        {formatNumber(item.quantity)}
      </td>
      <td className="px-4 py-3 text-ink-700">{formatPeso(item.unitValuePeso)}</td>
      <td className="px-4 py-3 font-medium text-ink-800">
        {formatPeso(totalValue)}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle.pill}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
          {statusStyle.label}
        </span>
      </td>
      <td className="px-4 py-3 text-ink-500">
        {formatDateTime(item.updatedAt)}
      </td>
      <td className="px-4 py-3 text-center">
        <button
          type="button"
          className="rounded-md p-1.5 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
          aria-label={`Actions for ${item.name}`}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}
