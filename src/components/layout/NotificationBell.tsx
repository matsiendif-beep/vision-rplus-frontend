'use client';
// ============================================================
//  Cloche de notifications (en-tête de chaque page)
//  Alertes financières, brouillons, reclassements, quota du plan
//  Gratuit, abonnement — chaque notification mène à la page utile.
// ============================================================
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { analyticsApi, type AppNotification } from '@/lib/api/client';
import { useCompanyStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const STYLE = {
  critique:  { icon: AlertTriangle, color: 'text-red-500',   dot: 'bg-red-500' },
  attention: { icon: AlertCircle,   color: 'text-amber-500', dot: 'bg-brand-orange' },
  info:      { icon: Info,          color: 'text-blue-500',  dot: 'bg-blue-500' },
} as const;

export default function NotificationBell() {
  const { activeCompany, activeFiscalYear } = useCompanyStore();
  const pathname = usePathname();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [open, setOpen]   = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    if (!activeCompany) { setItems([]); return; }
    analyticsApi.notifications(activeCompany.id, activeFiscalYear?.id)
      .then(setItems)
      .catch(() => setItems([]));
  }, [activeCompany?.id, activeFiscalYear?.id]);

  // Actualisée à chaque changement de page, d'entreprise ou d'exercice
  useEffect(() => { load(); }, [load, pathname]);

  // Fermeture au clic extérieur / touche Échap
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const top = items[0]?.severity;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen((v) => !v); if (!open) load(); }}
        aria-label={items.length ? `${items.length} notification(s)` : 'Aucune notification'}
        aria-expanded={open}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl
                   bg-surface-secondary hover:bg-surface-tertiary transition-colors"
      >
        <Bell className="w-4 h-4 text-slate-500" />
        {items.length > 0 && (
          <span className={cn('absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center',
            STYLE[top!].dot)}>
            {items.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl border border-slate-100
                        shadow-card-hover z-50 overflow-hidden">
          <p className="px-4 py-3 text-sm font-semibold text-brand-navy border-b border-slate-100">Notifications</p>
          {items.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-slate-500">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              Tout est en ordre : aucune action en attente.
            </div>
          ) : (
            <ul className="max-h-96 overflow-auto divide-y divide-slate-50">
              {items.map((n) => {
                const S = STYLE[n.severity];
                return (
                  <li key={n.id}>
                    <Link href={n.href} onClick={() => setOpen(false)} className="flex gap-3 px-4 py-3 hover:bg-slate-50">
                      <S.icon className={cn('w-4 h-4 shrink-0 mt-0.5', S.color)} />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-brand-navy">{n.title}</span>
                        <span className="block text-xs text-slate-500 mt-0.5">{n.message}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
