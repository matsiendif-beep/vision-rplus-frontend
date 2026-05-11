'use client';
import { useEffect, useState } from 'react';
import { Scale, Download, Search, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import Header  from '@/components/layout/Header';
import { Card, Spinner, ErrorMessage } from '@/components/ui';
import { analyticsApi, extractApiError } from '@/lib/api/client';
import { useCompanyStore } from '@/lib/store';
import { formatAmount, cn } from '@/lib/utils';

const CLASSES = [
  { prefix: '1', label: 'Classe 1 — Comptes de capitaux' },
  { prefix: '2', label: 'Classe 2 — Comptes d\'immobilisations' },
  { prefix: '3', label: 'Classe 3 — Comptes de stocks' },
  { prefix: '4', label: 'Classe 4 — Comptes de tiers' },
  { prefix: '5', label: 'Classe 5 — Comptes financiers' },
  { prefix: '6', label: 'Classe 6 — Comptes de charges' },
  { prefix: '7', label: 'Classe 7 — Comptes de produits' },
  { prefix: '8', label: 'Classe 8 — Comptes spéciaux' },
];

export default function BalancePage() {
  const { activeCompany, activeFiscalYear } = useCompanyStore();
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');
  const [classFilter, setClassFilter] = useState('');

  useEffect(() => {
    if (!activeCompany || !activeFiscalYear) return;
    setLoading(true);
    analyticsApi.balance(activeCompany.id, activeFiscalYear.id)
      .then(setData)
      .catch(e => setError(extractApiError(e)))
      .finally(() => setLoading(false));
  }, [activeCompany, activeFiscalYear]);

  const comptes: any[] = data?.comptes ?? [];
  const filtered = comptes.filter(c => {
    const matchClass  = !classFilter || c.account_code.startsWith(classFilter);
    const matchSearch = !search || c.account_code.includes(search) || c.account_label.toLowerCase().includes(search.toLowerCase());
    return matchClass && matchSearch;
  });

  const isBalanced = data
    ? Math.abs(data.total_debit - data.total_credit) < 0.01
    : false;

  const handleExportCsv = () => {
    if (!data || !activeCompany || !activeFiscalYear) return;
    const header = 'Code;Libellé;Débit;Crédit;Solde\n';
    const rows = filtered.map(c =>
      `${c.account_code};"${c.account_label}";${c.debit_total.toFixed(2)};${c.credit_total.toFixed(2)};${c.solde.toFixed(2)}`
    ).join('\n');
    const totals = `TOTAL;;${data.total_debit.toFixed(2)};${data.total_credit.toFixed(2)};${(data.total_debit - data.total_credit).toFixed(2)}`;
    const csv  = header + rows + '\n' + totals;
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `balance_${activeCompany.id.slice(0, 8)}_${activeFiscalYear.label}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Balance exportée');
  };

  if (!activeCompany || !activeFiscalYear) {
    return (
      <div className="flex-1 min-w-0 flex flex-col">
        <Header title="Balance des comptes" subtitle="—" />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center max-w-xs">
            <Scale className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="font-semibold text-brand-navy mb-1">Aucun exercice sélectionné</p>
            <p className="text-sm text-slate-400">Sélectionnez une entreprise et un exercice fiscal.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <Header
        title="Balance des comptes"
        subtitle={activeFiscalYear.label}
        actions={
          data && (
            <button onClick={handleExportCsv} className="btn-secondary text-sm">
              <Download className="w-4 h-4" /> Exporter CSV
            </button>
          )
        }
      />

      <div className="flex-1 p-6 space-y-4 animate-fade-in">
        {error && <ErrorMessage message={error} />}

        {/* ── Indicateur équilibre ──────────────────────── */}
        {data && (
          <div className={cn(
            'rounded-2xl p-4 flex items-center gap-3 border',
            isBalanced
              ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
              : 'bg-amber-50 border-amber-100 text-amber-700',
          )}>
            {isBalanced
              ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              : <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            }
            <div className="flex-1">
              <span className="font-semibold text-sm">
                {isBalanced ? 'Balance équilibrée' : 'Balance déséquilibrée'}
              </span>
              <span className="text-sm ml-3">
                Total Débit : <strong>{formatAmount(data.total_debit, activeCompany.currency)}</strong>
                {' · '}
                Total Crédit : <strong>{formatAmount(data.total_credit, activeCompany.currency)}</strong>
              </span>
            </div>
            <span className="text-xs font-medium">{comptes.length} compte(s)</span>
          </div>
        )}

        {/* ── Filtres ───────────────────────────────────── */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Code ou libellé de compte…"
                className="input pl-9 text-xs py-2"
              />
            </div>
            <select
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
              className="input text-xs py-2 w-56"
            >
              <option value="">Toutes les classes</option>
              {CLASSES.map(c => (
                <option key={c.prefix} value={c.prefix}>{c.label}</option>
              ))}
            </select>
          </div>
        </Card>

        {/* ── Table ─────────────────────────────────────── */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-24"><Spinner size="lg" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center py-24">
              <p className="text-slate-400 text-sm">Aucun compte trouvé pour cet exercice.</p>
            </div>
          ) : (
            <>
              {/* Group by class */}
              {CLASSES.filter(cl =>
                !classFilter || cl.prefix === classFilter
              ).map(cl => {
                const rows = filtered.filter(c => c.account_code.startsWith(cl.prefix));
                if (rows.length === 0) return null;
                const subtotalD = rows.reduce((s: number, c: any) => s + c.debit_total, 0);
                const subtotalC = rows.reduce((s: number, c: any) => s + c.credit_total, 0);
                const subtotalS = subtotalD - subtotalC;
                return (
                  <div key={cl.prefix}>
                    {/* Class header */}
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        {cl.label}
                      </span>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <th className="table-header w-24">Code</th>
                          <th className="table-header">Libellé</th>
                          <th className="table-header text-right">Débit</th>
                          <th className="table-header text-right">Crédit</th>
                          <th className="table-header text-right">Solde</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((c: any) => (
                          <tr key={c.account_code} className="hover:bg-surface-secondary/40 transition-colors">
                            <td className="table-cell font-mono text-xs text-slate-500">{c.account_code}</td>
                            <td className="table-cell text-brand-navy">{c.account_label}</td>
                            <td className="table-cell text-right font-mono text-xs text-blue-600">
                              {formatAmount(c.debit_total, activeCompany.currency)}
                            </td>
                            <td className="table-cell text-right font-mono text-xs text-emerald-600">
                              {formatAmount(c.credit_total, activeCompany.currency)}
                            </td>
                            <td className={cn(
                              'table-cell text-right font-mono text-xs font-semibold',
                              c.solde > 0 ? 'text-blue-700' : c.solde < 0 ? 'text-red-600' : 'text-slate-400',
                            )}>
                              {c.solde !== 0
                                ? (c.solde > 0 ? '' : '− ') + formatAmount(Math.abs(c.solde), activeCompany.currency)
                                : '—'
                              }
                            </td>
                          </tr>
                        ))}
                        {/* Subtotal */}
                        <tr className="bg-slate-50 border-t border-slate-200 font-semibold text-xs">
                          <td className="table-cell text-slate-500 font-mono" colSpan={2}>
                            Sous-total {cl.label.split(' — ')[0]}
                          </td>
                          <td className="table-cell text-right font-mono text-blue-700">
                            {formatAmount(subtotalD, activeCompany.currency)}
                          </td>
                          <td className="table-cell text-right font-mono text-emerald-700">
                            {formatAmount(subtotalC, activeCompany.currency)}
                          </td>
                          <td className={cn(
                            'table-cell text-right font-mono',
                            subtotalS > 0 ? 'text-blue-700' : subtotalS < 0 ? 'text-red-600' : 'text-slate-400',
                          )}>
                            {subtotalS !== 0
                              ? (subtotalS > 0 ? '' : '− ') + formatAmount(Math.abs(subtotalS), activeCompany.currency)
                              : '—'
                            }
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              })}

              {/* Total général */}
              {data && (
                <div className="border-t-2 border-slate-200 bg-brand-navy/5 px-4 py-3 flex items-center justify-between">
                  <span className="font-bold text-brand-navy text-sm">TOTAL GÉNÉRAL</span>
                  <div className="flex gap-8 text-sm font-bold font-mono">
                    <span className="text-blue-700">{formatAmount(data.total_debit, activeCompany.currency)}</span>
                    <span className="text-emerald-700">{formatAmount(data.total_credit, activeCompany.currency)}</span>
                    <span className={isBalanced ? 'text-emerald-600' : 'text-red-600'}>
                      {isBalanced ? '✓ Équilibré' : formatAmount(Math.abs(data.total_debit - data.total_credit), activeCompany.currency)}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
