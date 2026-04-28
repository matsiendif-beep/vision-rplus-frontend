'use client';
import { cn } from '@/lib/utils';
import { AlertCircle, Inbox, Loader2 } from 'lucide-react';

// ── Card ──────────────────────────────────────────────────────
export function Card({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('card', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title:     string;
  subtitle?: string;
  action?:   React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between mb-4', className)}>
      <div>
        <h3 className="font-semibold text-brand-navy text-sm">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────
type BadgeVariant = 'default' | 'green' | 'amber' | 'red' | 'blue' | 'orange';

const BADGE_STYLES: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-600 border-slate-200',
  green:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber:   'bg-amber-50 text-amber-700 border-amber-200',
  red:     'bg-red-50 text-red-600 border-red-200',
  blue:    'bg-blue-50 text-blue-700 border-blue-200',
  orange:  'bg-orange-50 text-orange-700 border-orange-200',
};

export function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode;
  variant?:  BadgeVariant;
  className?: string;
}) {
  return (
    <span className={cn('badge', BADGE_STYLES[variant], className)}>
      {children}
    </span>
  );
}

// ── Skeleton ──────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton h-4 w-full', className)} />;
}

export function MetricSkeleton() {
  return (
    <div className="metric-card">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3.5 border-b border-slate-50">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-48 flex-1" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: {
  icon?:        React.ElementType;
  title:        string;
  description?: string;
  action?:      React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 bg-surface-tertiary rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-slate-400" />
      </div>
      <h3 className="font-semibold text-brand-navy text-sm mb-1">{title}</h3>
      {description && <p className="text-xs text-slate-400 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ── Error message ─────────────────────────────────────────────
export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-red-700">{message}</p>
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────
export function Spinner({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return <Loader2 className={cn('animate-spin text-brand-orange', sizes[size])} />;
}

// ── Section divider ───────────────────────────────────────────
export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-slate-100', className)} />;
}

// ── Amount display ────────────────────────────────────────────
export function DebitCreditAmount({
  debit,
  credit,
}: {
  debit:  string | number;
  credit: string | number;
}) {
  const d = parseFloat(String(debit));
  const c = parseFloat(String(credit));
  if (d > 0) return <span className="text-debit font-mono text-xs">{d.toFixed(2)}</span>;
  if (c > 0) return <span className="text-credit font-mono text-xs">{c.toFixed(2)}</span>;
  return <span className="text-slate-300 text-xs">—</span>;
}
