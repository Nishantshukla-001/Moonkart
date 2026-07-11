"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface MonthlySalesPoint {
  label: string;
  revenue: number;
  orders: number;
}

export function OrdersTrendChart({ data }: { data: MonthlySalesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} allowDecimals={false} width={30} />
        <Tooltip
          formatter={(value) => [value, "Orders"]}
          contentStyle={{ borderRadius: 8, borderColor: "var(--border-light)", fontSize: 13 }}
        />
        <Bar dataKey="orders" fill="var(--sage-hover)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
