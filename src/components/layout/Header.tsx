'use client';
import { useState } from 'react';
import { Bell, ChevronDown, Calendar } from 'lucide-react';
import { useCompanyStore } from '@/lib/store';
import { cn, formatDate }  from '@/lib/utils';
import type { FiscalYear } from '@/types';

interface HeaderProps {
  title:     string;
  subtitle?: string;
  actions?:  React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  const { activeFiscalYear, activeCompany, setActiveFiscalYear } = useCompanyStore();
  const [showFYPicker, setShowFYPicker] = useState(false);
  const fiscalYears = activeCompany?.fiscal_years ?? [];

  return (
    <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between
                       sticky top-0 z-30 shadow-sm">
      {/* ── Titre de la page ──────────────────────────────── */}
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>

      {/* ── Actions droite ───────────────────────────────── */}
      <div className="flex items-center gap-3">

        {/* Sélecteur exercice fiscal */}
        {activeFiscalYear && (
          <div className="relative">
            <button
              onClick={() => setShowFYPicker((v) => !v)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium',
                'border-slate-200 bg-surface-secondary text-brand-navy',
                'hover:border-brand-orange/40 transition-colors duration-150',
              )}
            >
              <Calendar className="w-3.5 h-3.5 text-brand-orange" />
              <span>{activeFiscalYear.label}</span>
              {fiscalYears.length > 1 && (
                <ChevronDown className={cn(
                  'w-3.5 h-3.5 text-slate-400 transition-transform duration-150',
                  showFYPicker && 'rotate-180',
                )} />
              )}
            </button>

            {showFYPicker && fiscalYears.length > 1 && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl
                              border border-slate-100 shadow-card-hover overflow-hidden z-50 min-w-48">
                {fiscalYears.map((fy: FiscalYear) => (
                  <button
                    key={fy.id}
                    onClick={() => { setActiveFiscalYear(fy); setShowFYPicker(false); }}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-2.5 text-sm',
                      'hover:bg-surface-secondary transition-colors text-left',
                      activeFiscalYear.id === fy.id && 'bg-brand-orange/5 text-brand-orange font-medium',
                    )}
                  >
                    <span>{fy.label}</span>
                    {fy.is_closed && (
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full ml-2">
                        Clôturé
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl
                           bg-surface-secondary hover:bg-surface-tertiary transition-colors">
          <Bell className="w-4 h-4 text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-orange rounded-full" />
        </button>

        {/* Actions custom */}
        {actions}
      </div>
    </header>
  );
}
