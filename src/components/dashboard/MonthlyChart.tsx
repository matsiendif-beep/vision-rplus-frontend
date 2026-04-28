'use client';
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardHeader, Skeleton } from '@/components/ui';
import { formatAmount } from '@/lib/utils';
import type { MonthlyPoint } from '@/types';

interface MonthlyChartProps {
  data:      MonthlyPoint[];
  currency?: string;
  loading:   boolean;
}

const CustomTooltip = ({ active, payload, label, currency }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-brand-navy text-white rounded-xl p-3 shadow-xl text-xs space-y-1.5 min-w-44">
      <p className="font-semibold text-slate-300 pb-1 border-b border-white/10">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.color }} />
            <span className="text-slate-300">{entry.name}</span>
          </span>
          <span className="font-semibold">{formatAmount(entry.value, currency)}</span>
        </div>
      ))}
    </div>
  );
};

export default function MonthlyChart({ data, currency = 'EUR', loading }: MonthlyChartProps) {
  if (loading) {
    return (
      <Card className="p-5">
        <Skeleton className="h-4 w-48 mb-4" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </Card>
    );
  }

  // Formater les labels des mois
  const formattedData = data.map((d) => ({
    ...d,
    monthLabel: (() => {
      try {
        return format(new Date(d.month + '-01'), 'MMM yy', { locale: fr });
      } catch {
        return d.month;
      }
    })(),
  }));

  if (!data.length) {
    return (
      <Card className="p-5">
        <CardHeader title="Évolution mensuelle" subtitle="Produits · Charges · Résultat" />
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
          Aucune donnée disponible pour cet exercice
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <CardHeader
        title="Évolution mensuelle"
        subtitle="Produits · Charges · Résultat net"
      />
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="produits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#059669" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="charges" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#dc2626" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="resultat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#e07b2a" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#e07b2a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="monthLabel"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false} tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip currency={currency} />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '12px', color: '#64748b' }}
            />
            <Area
              type="monotone" dataKey="produits" name="Produits"
              stroke="#059669" strokeWidth={2}
              fill="url(#produits)"
              dot={{ r: 3, fill: '#059669', strokeWidth: 0 }}
              activeDot={{ r: 4 }}
            />
            <Area
              type="monotone" dataKey="charges" name="Charges"
              stroke="#dc2626" strokeWidth={2}
              fill="url(#charges)"
              dot={{ r: 3, fill: '#dc2626', strokeWidth: 0 }}
              activeDot={{ r: 4 }}
            />
            <Area
              type="monotone" dataKey="resultat" name="Résultat net"
              stroke="#e07b2a" strokeWidth={2.5}
              fill="url(#resultat)"
              dot={{ r: 3, fill: '#e07b2a', strokeWidth: 0 }}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
