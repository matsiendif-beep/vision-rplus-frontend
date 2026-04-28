import { clsx, type ClassValue } from 'clsx';
import { twMerge }               from 'tailwind-merge';
import type { AccountingSystem, JournalType, EntryStatus, Plan } from '@/types';

// ── Tailwind class merger ─────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Formatage monétaire ───────────────────────────────────────
export function formatAmount(
  value:    number | string,
  currency: string = 'EUR',
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '—';

  const currencyMap: Record<string, string> = {
    EUR: 'fr-FR', XAF: 'fr-FR', XOF: 'fr-FR',
    USD: 'en-US', GBP: 'en-GB', MAD: 'fr-MA', TND: 'fr-TN',
  };

  return new Intl.NumberFormat(currencyMap[currency] ?? 'fr-FR', {
    style:                 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

// ── Formatage nombre simple ───────────────────────────────────
export function formatNumber(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '—';
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

// ── Formatage date ────────────────────────────────────────────
export function formatDate(date: string | Date, short = false): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', {
    day:   '2-digit',
    month: short ? '2-digit' : 'long',
    year:  'numeric',
  });
}

// ── Labels ────────────────────────────────────────────────────
export const JOURNAL_TYPE_LABELS: Record<JournalType, string> = {
  achats:   'Achats',
  ventes:   'Ventes',
  banque:   'Banque',
  caisse:   'Caisse',
  od:       'OD',
  salaires: 'Salaires',
  actif:    'Actif',
};

export const STATUS_LABELS: Record<EntryStatus, string> = {
  brouillon: 'Brouillon',
  validee:   'Validée',
  annulee:   'Annulée',
};

export const SYSTEM_LABELS: Record<AccountingSystem, string> = {
  ohada:      'OHADA',
  pcg_france: 'PCG France',
};

export const PLAN_LABELS: Record<Plan, string> = {
  free:    'Gratuit',
  pro:     'Pro',
  cabinet: 'Cabinet',
};

// ── Couleurs par statut ───────────────────────────────────────
export function getStatusColor(status: EntryStatus): string {
  return {
    brouillon: 'bg-amber-50 text-amber-700 border-amber-200',
    validee:   'bg-emerald-50 text-emerald-700 border-emerald-200',
    annulee:   'bg-red-50 text-red-600 border-red-200',
  }[status];
}

// ── Signe du résultat ─────────────────────────────────────────
export function getResultatColor(nature: string): string {
  if (nature === 'benefice') return 'text-emerald-600';
  if (nature === 'perte')    return 'text-red-600';
  return 'text-slate-500';
}

// ── Variation en % ────────────────────────────────────────────
export function calcVariation(current: number, previous: number): string {
  if (previous === 0) return '—';
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)} %`;
}
