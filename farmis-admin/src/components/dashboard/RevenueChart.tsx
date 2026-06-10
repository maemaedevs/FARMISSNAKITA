import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '@/components/common';

const data = [
  { month: 'Jan', value: 4200 },
  { month: 'Feb', value: 5100 },
  { month: 'Mar', value: 4800 },
  { month: 'Apr', value: 6200 },
  { month: 'May', value: 7400 },
  { month: 'Jun', value: 6900 },
  { month: 'Jul', value: 8200 },
  { month: 'Aug', value: 9100 },
];

export function RevenueChart() {
  return (
    <Card
      title="Revenue overview"
      description="Monthly gross revenue across all farms"
      padding="md"
    >
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
          >
            <defs>
              <linearGradient id="brandFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22C55E" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              stroke="#9BA6AE"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#9BA6AE"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #E5E7EB',
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#22C55E"
              strokeWidth={2}
              fill="url(#brandFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
