'use client';
// Compteur du quota d'écritures du plan Gratuit (10 par mois).
// N'affiche rien pour les formules payantes et l'entreprise de démonstration.
import { useEffect, useState } from 'react';
import { Gauge } from 'lucide-react';
import { companiesApi } from '@/lib/api/client';
import { cn } from '@/lib/utils';

export default function EntryQuota({ companyId, refreshKey }: { companyId: string; refreshKey?: unknown }) {
  const [usage, setUsage] = useState<{ used: number; limit: number; remaining: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    companiesApi.usage(companyId)
      .then((u) => {
        if (cancelled) return;
        setUsage(u.limited ? { used: u.used!, limit: u.limit!, remaining: u.remaining! } : null);
      })
      .catch(() => { if (!cancelled) setUsage(null); });
    return () => { cancelled = true; };
  }, [companyId, refreshKey]);

  if (!usage) return null;
  const full = usage.remaining === 0;

  return (
    <div className={cn(
      'flex flex-wrap items-center gap-2 rounded-xl px-4 py-2.5 text-sm border',
      full ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-white border-slate-100 text-slate-600',
    )}>
      <Gauge className="w-4 h-4 shrink-0" />
      <span>
        Plan Gratuit : <b>{usage.used} / {usage.limit}</b> écritures ce mois-ci.
        {full
          ? ' Limite atteinte : passez au plan Pro pour des écritures illimitées (14 jours d\'essai gratuit).'
          : ` Il vous en reste ${usage.remaining}.`}
      </span>
    </div>
  );
}
