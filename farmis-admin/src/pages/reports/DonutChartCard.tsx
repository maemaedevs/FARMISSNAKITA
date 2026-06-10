import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export interface ChartSlice {
  name: string;
  value: number;
  color: string;
}

interface DonutChartCardProps {
  title: string;
  data: ChartSlice[];
  mode?: 'percent' | 'count';
}

export function DonutChartCard({
  title,
  data,
  mode = 'percent',
}: DonutChartCardProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="rounded-[var(--radius-card)] border border-ink-100 bg-white p-4 shadow-[var(--shadow-soft)]">
      <h3 className="mb-3 text-sm font-semibold text-ink-800">{title}</h3>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={72}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => {
                const n = Number(value ?? 0);
                return [
                  mode === 'count'
                    ? `${n} (${Math.round((n / total) * 100)}%)`
                    : `${n}%`,
                  String(name ?? ''),
                ];
              }}
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #E5E7EB',
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-2 space-y-1.5">
        {data.map((item) => (
          <li
            key={item.name}
            className="flex items-center justify-between text-xs"
          >
            <span className="flex items-center gap-2 text-ink-600">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.name}
            </span>
            <span className="font-medium text-ink-800">
              {mode === 'count'
                ? `${item.value} (${Math.round((item.value / total) * 100)}%)`
                : `${item.value}%`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
