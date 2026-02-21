"use client";

import {
  Area,
  AreaChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DepositDataPoint } from "@/types/deposit";

const DARK_BLUE = "#1d4ed8";
const GREEN = "#22c55e";
const YELLOW = "#eab308";
const RED = "#ef4444";

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
                <stop offset="0%" stopColor={DARK_BLUE} stopOpacity={0.5} />
                <stop offset="100%" stopColor={DARK_BLUE} stopOpacity={0} />
              </linearGradient>
              <linearGradient
                id="realizedPnlGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={GREEN} stopOpacity={0.5} />
                <stop offset="100%" stopColor={GREEN} stopOpacity={0} />
              </linearGradient>
              <linearGradient
                id="unrealizedPnlGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={YELLOW} stopOpacity={0.5} />
                <stop offset="100%" stopColor={YELLOW} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => {
                const d = new Date(value);
                const hours = d.getHours();
                const minutes = d.getMinutes();
                return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
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
              labelStyle={{ color: "#000" }}
              formatter={(value: number | undefined, name?: string) => [
                value != null
                  ? new Intl.NumberFormat("en-US").format(value)
                  : "—",
                name ?? "Value",
              ]}
              labelFormatter={(label) => {
                const d = new Date(label);
                return d.toLocaleString(undefined, {
                  dateStyle: "short",
                  timeStyle: "medium",
                  hour12: false,
                });
              }}
            />
            <Area
              type="monotone"
              dataKey="realizedPnl"
              name="Realized Profit/Loss"
              stroke={GREEN}
              strokeWidth={2}
              fill="url(#realizedPnlGradient)"
            />
            <Area
              type="monotone"
              dataKey="unrealizedPnl"
              name="Unrealized Profit/Loss"
              stroke={YELLOW}
              strokeWidth={2}
              fill="url(#unrealizedPnlGradient)"
            />
            <Area
              type="monotone"
              dataKey="deposits"
              name="Deposits"
              stroke={DARK_BLUE}
              strokeWidth={2}
              fill="url(#performanceGradient)"
            />
            <Line
              type="monotone"
              dataKey="portfolioValue"
              name="Portfolio Value"
              stroke={RED}
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
