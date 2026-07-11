"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { ORDER_STATUS_LABELS } from "@/features/orders/components/OrderStatusBadge";
import type { OrderStatusValue } from "@/features/orders/validation/order.schema";

const COLORS = [
  "var(--blush-hover)",
  "var(--sage-hover)",
  "var(--warning)",
  "var(--success)",
  "var(--danger)",
  "#a78bfa",
  "#60a5fa",
  "#f59e0b",
  "#94a3b8",
];

interface OrderStatusCount {
  status: OrderStatusValue;
  _count: number;
}

export function OrderStatusPieChart({ data }: { data: OrderStatusCount[] }) {
  const chartData = data
    .filter((row) => row._count > 0)
    .map((row) => ({ name: ORDER_STATUS_LABELS[row.status], value: row._count }));

  if (chartData.length === 0) {
    return <p className="flex h-[240px] items-center justify-center text-sm text-text-muted">No orders yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
          {chartData.map((entry, index) => (
            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 8, borderColor: "var(--border-light)", fontSize: 13 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
