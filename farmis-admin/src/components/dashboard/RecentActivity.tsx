import { Card, Avatar } from '@/components/common';

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  at: string;
}

const ITEMS: ActivityItem[] = [
  { id: '1', user: 'Jane Cruz', action: 'registered Sunrise Acres', at: '2m ago' },
  { id: '2', user: 'Liam Ortega', action: 'updated stock for Tomatoes', at: '14m ago' },
  { id: '3', user: 'Aiko Tan', action: 'approved a payout request', at: '1h ago' },
  { id: '4', user: 'Marcus Lee', action: 'flagged a delivery issue', at: '3h ago' },
  { id: '5', user: 'Priya Patel', action: 'added a new product (Maize)', at: 'Yesterday' },
];

export function RecentActivity() {
  return (
    <Card title="Recent activity" padding="md">
      <ul className="divide-y divide-ink-100">
        {ITEMS.map((item) => (
          <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <Avatar name={item.user} size={32} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-ink-800">
                <span className="font-medium">{item.user}</span>{' '}
                <span className="text-ink-500">{item.action}</span>
              </p>
              <p className="text-xs text-ink-400">{item.at}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
