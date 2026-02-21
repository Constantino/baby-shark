"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DepositDataPoint } from "@/types/deposit";

const LIGHT_BLUE = "#7dd3fc";

type PerformanceChartProps = {
  data: DepositDataPoint[];
};

export function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <div className="p-4">
      <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Performance
      </h2>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id="performanceGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={LIGHT_BLUE} stopOpacity={0.5} />
                <stop offset="100%" stopColor={LIGHT_BLUE} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => {
                const d = new Date(value);
                return `${d.getMonth() + 1}/${d.getDate()}`;
              }}
              stroke="#71717a"
            />
            <YAxis
              tick={{ fontSize: 10 }}
              tickFormatter={(value) =>
                value >= 1000 ? `${value / 1000}k` : String(value)
              }
              stroke="#71717a"
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 6,
                border: "1px solid #e4e4e7",
              }}
              formatter={(value: number | undefined) => [
                value != null
                  ? new Intl.NumberFormat("en-US").format(value)
                  : "—",
                "Performance",
              ]}
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
            />
            <Area
              type="monotone"
              dataKey="deposits"
              stroke={LIGHT_BLUE}
              strokeWidth={2}
              fill="url(#performanceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
