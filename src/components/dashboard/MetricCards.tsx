'use client';
import {
  TrendingUp, TrendingDown, Minus,
  Wallet, BarChart3, ArrowUpRight, ArrowDownRight, Clock,
} from 'lucide-react';
import { cn, formatAmount, getResultatColor } from '@/lib/utils';
import { MetricSkeleton } from '@/components/ui';
import type { Dashboard } from '@/types';

interface MetricCardsProps {
  data:     Dashboard;
  currency?: string;
  loading:  boolean;
}

export default function MetricCards({ data, currency = 'EUR', loading }: MetricCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <MetricSkeleton key={i} />)}
      </div>
    );
  }

  const isPositive = data.nature_resultat === 'benefice';
  const isNegative = data.nature_resultat === 'perte';

  const metrics = [
    {
      label:    'Trésorerie',
      value:    formatAmount(data.cash_balance, currency),
      icon:     Wallet,
      iconBg:   'bg-blue-50',
      iconColor: 'text-blue-600',
      sub:      data.cash_balance >= 0 ? 'Solde positif' : 'Découvert bancaire',
      subColor: data.cash_balance >= 0 ? 'text-emerald-600' : 'text-red-600',
    },
    {
      label:    'Produits (CA)',
      value:    formatAmount(Math.abs(data.total_produits), currency),
      icon:     ArrowUpRight,
      iconBg:   'bg-emerald-50',
      iconColor: 'text-emerald-600',
      sub:      'Exercice en cours',
      subColor: 'text-slate-400',
    },
    {
      label:    'Charges totales',
      value:    formatAmount(data.total_charges, currency),
      icon:     ArrowDownRight,
      iconBg:   'bg-red-50',
      iconColor: 'text-red-500',
      sub:      'Exercice en cours',
      subColor: 'text-slate-400',
    },
    {
      label: 'Résultat net',
      value: formatAmount(Math.abs(data.resultat_net), currency),
      icon:  isPositive ? TrendingUp : isNegative ? TrendingDown : Minus,
      iconBg:
        isPositive ? 'bg-emerald-50' :
        isNegative ? 'bg-red-50' : 'bg-slate-50',
      iconColor:
        isPositive ? 'text-emerald-600' :
        isNegative ? 'text-red-600' : 'text-slate-400',
      sub:      isPositive ? 'Bénéfice' : isNegative ? 'Perte' : 'À l\'équilibre',
      subColor: getResultatColor(data.nature_resultat),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {metrics.map(({ label, value, icon: Icon, iconBg, iconColor, sub, subColor }) => (
        <div key={label} className="metric-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {label}
            </span>
            <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', iconBg)}>
              <Icon className={cn('w-4 h-4', iconColor)} />
            </div>
          </div>
          <p className="text-2xl font-bold text-brand-navy tracking-tight">{value}</p>
          <span className={cn('text-xs font-medium', subColor)}>{sub}</span>
        </div>
      ))}

      {/* Carte "écritures en attente" */}
      {data.pending_entries > 0 && (
        <div className="metric-card border-amber-100 bg-amber-50/50 sm:col-span-2 xl:col-span-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">
                {data.pending_entries} écriture{data.pending_entries > 1 ? 's' : ''} en brouillon
              </p>
              <p className="text-xs text-amber-600">
                Ces écritures ne sont pas encore comptabilisées dans les états financiers.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
