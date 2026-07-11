"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface CategoryDatum {
  name: string;
  productCount: number;
}

export function CategoryDistributionChart({ data }: { data: CategoryDatum[] }) {
  if (data.length === 0) {
    return <p className="flex h-[240px] items-center justify-center text-sm text-text-muted">No categorized products yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(240, data.length * 40)}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={110}
          tick={{ fontSize: 12, fill: "var(--text-primary)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value) => [value, "Products"]}
          contentStyle={{ borderRadius: 8, borderColor: "var(--border-light)", fontSize: 13 }}
        />
        <Bar dataKey="productCount" fill="var(--blush-hover)" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
