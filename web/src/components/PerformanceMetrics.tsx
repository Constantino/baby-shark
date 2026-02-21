import type { PerformanceMetricsProps } from "@/types/performance-metrics";
import { formatCurrency } from "@/utils/currency";

function MetricCard({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: number;
  variant?: "default" | "positive" | "negative";
}) {
  const valueColor =
    variant === "positive"
      ? "text-emerald-600 dark:text-emerald-400"
      : variant === "negative"
        ? "text-red-600 dark:text-red-400"
        : "text-zinc-900 dark:text-zinc-100";

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900/50">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className={`text-lg font-semibold tabular-nums ${valueColor}`}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}

export function PerformanceMetrics({
  deposits,
  withdrawals,
  realizedPnl,
  unrealizedPnl,
  portfolioValue,
}: PerformanceMetricsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <MetricCard label="Deposits" value={deposits} />
      <MetricCard label="Withdrawals" value={withdrawals} />
      <MetricCard
        label="Realized PnL"
        value={realizedPnl}
        variant={realizedPnl >= 0 ? "positive" : "negative"}
      />
      <MetricCard
        label="Unrealized PnL"
        value={unrealizedPnl}
        variant={unrealizedPnl >= 0 ? "positive" : "negative"}
      />
      <MetricCard label="Portfolio Value" value={portfolioValue} />
    </div>
  );
}
