'use client';
import { useEffect, useState, useRef } from 'react';
import { BookMarked, Search, Download, ChevronDown, ChevronRight, FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Header  from '@/components/layout/Header';
import { Card, Spinner, ErrorMessage } from '@/components/ui';
import { analyticsApi, extractApiError } from '@/lib/api/client';
import { useCompanyStore } from '@/lib/store';
import { formatAmount, formatDate, cn, JOURNAL_TYPE_LABELS } from '@/lib/utils';
import type { JournalType } from '@/types';

export default function GrandLivrePage() {
  const { activeCompany, activeFiscalYear } = useCompanyStore();
  const [data, setData]           = useState<any[]>([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [accountFilter, setAccountFilter] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [exportingFec, setExportingFec] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = (accountCode?: string) => {
    if (!activeCompany || !activeFiscalYear) return;
    setLoading(true);
    analyticsApi.grandLivre(activeCompany.id, activeFiscalYear.id, accountCode || undefined)
      .then((d: any) => setData(Array.isArray(d) ? d : []))
      .catch(e => setError(extractApiError(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [activeCompany, activeFiscalYear]);

  const handleAccountFilter = (val: string) => {
    setAccountFilter(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchData(val), 400);
  };

  const filtered = data.filter(compte =>
    !search ||
    compte.code.includes(search) ||
    compte.label.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (code: string) =>
    setCollapsed(prev => ({ ...prev, [code]: !prev[code] }));

  const handleExportFec = async () => {
    if (!activeCompany || !activeFiscalYear) return;
    setExportingFec(true);
    try {
      const blob = await analyticsApi.exportFec(activeCompany.id, activeFiscalYear.id);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = `FEC_${activeCompany.id.slice(0, 8)}_${activeFiscalYear.label}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('FEC exporté');
    } catch (e) {
      toast.error(extractApiError(e));
    } finally {
      setExportingFec(false);
    }
  };

  const handleExportCsv = () => {
    if (!activeCompany || !activeFiscalYear || filtered.length === 0) return;
    const lines: string[] = ['Code;Libellé;Date;Référence;Journal;Libellé ligne;Débit;Crédit;Solde progressif'];
    for (const compte of filtered) {
      let solde = 0;
      for (const m of compte.mouvements) {
        solde += m.debit - m.credit;
        lines.push([
          compte.code,
          `"${compte.label}"`,
          m.date?.slice(0, 10) ?? '',
          m.reference ?? '',
          m.journal ?? '',
          `"${m.libelle ?? ''}"`,
          m.debit.toFixed(2),
          m.credit.toFixed(2),
          solde.toFixed(2),
        ].join(';'));
      }
      lines.push(`${compte.code};"Sous-total";;;;;;;${compte.debit_total.toFixed(2)};${compte.credit_total.toFixed(2)};${compte.solde.toFixed(2)}`);
    }
    const csv  = lines.join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `grand-livre_${activeCompany.id.slice(0, 8)}_${activeFiscalYear.label}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Grand livre exporté');
  };

  if (!activeCompany || !activeFiscalYear) {
    return (
      <div className="flex-1 min-w-0 flex flex-col">
        <Header title="Grand Livre" subtitle="—" />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center max-w-xs">
            <BookMarked className="w-10 h-10 text-slate-200 mx-auto mb-3" />
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
        title="Grand Livre"
        subtitle={activeFiscalYear.label}
        actions={
          filtered.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleExportFec}
                disabled={exportingFec}
                className="btn-secondary text-sm"
                title="Exporter au format FEC (DGFiP France)"
              >
                {exportingFec ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                Export FEC
              </button>
              <button onClick={handleExportCsv} className="btn-secondary text-sm">
                <Download className="w-4 h-4" /> Exporter CSV
              </button>
            </div>
          )
        }
      />

      <div className="flex-1 p-6 space-y-4 animate-fade-in">
        {error && <ErrorMessage message={error} />}

        {/* ── Filtres ───────────────────────────────────── */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filtrer par code ou libellé…"
                className="input pl-9 text-xs py-2"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                value={accountFilter}
                onChange={e => handleAccountFilter(e.target.value)}
                placeholder="Préfixe compte (ex: 411)"
                className="input pl-9 text-xs py-2 w-52"
              />
            </div>
            <div className="ml-auto text-xs text-slate-400">
              {filtered.length} compte(s) · {filtered.reduce((s, c) => s + c.mouvements.length, 0)} mouvement(s)
            </div>
          </div>
        </Card>

        {/* ── Comptes ───────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-24"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <Card className="flex items-center justify-center py-24">
            <p className="text-slate-400 text-sm">Aucun mouvement validé pour cet exercice.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((compte) => {
              const isOpen = !collapsed[compte.code];
              let solde    = 0;
              return (
                <Card key={compte.code} className="overflow-hidden">
                  {/* ── En-tête compte ───────────────── */}
                  <button
                    onClick={() => toggle(compte.code)}
                    className="w-full flex items-center justify-between px-4 py-3
                               bg-slate-50 hover:bg-slate-100 transition-colors border-b border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      {isOpen
                        ? <ChevronDown className="w-4 h-4 text-slate-400" />
                        : <ChevronRight className="w-4 h-4 text-slate-400" />
                      }
                      <span className="font-mono text-sm font-bold text-brand-navy">{compte.code}</span>
                      <span className="text-sm text-slate-600">{compte.label}</span>
                      <span className="text-xs text-slate-400 bg-slate-200 px-2 py-0.5 rounded-lg">
                        {compte.mouvements.length} mouvement(s)
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-xs font-mono">
                      <span className="text-blue-600">
                        D : {formatAmount(compte.debit_total, activeCompany.currency)}
                      </span>
                      <span className="text-emerald-600">
                        C : {formatAmount(compte.credit_total, activeCompany.currency)}
                      </span>
                      <span className={cn(
                        'font-bold px-3 py-1 rounded-lg',
                        compte.solde > 0 ? 'bg-blue-50 text-blue-700'
                          : compte.solde < 0 ? 'bg-red-50 text-red-600'
                          : 'bg-slate-100 text-slate-500',
                      )}>
                        Solde : {compte.solde !== 0
                          ? (compte.solde > 0 ? '' : '− ') + formatAmount(Math.abs(compte.solde), activeCompany.currency)
                          : '0'
                        }
                      </span>
                    </div>
                  </button>

                  {/* ── Mouvements ───────────────────── */}
                  {isOpen && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr>
                            <th className="table-header w-28">Date</th>
                            <th className="table-header w-24">Réf.</th>
                            <th className="table-header w-24">Journal</th>
                            <th className="table-header">Libellé</th>
                            <th className="table-header text-right w-28">Débit</th>
                            <th className="table-header text-right w-28">Crédit</th>
                            <th className="table-header text-right w-28">Solde progressif</th>
                          </tr>
                        </thead>
                        <tbody>
                          {compte.mouvements.map((m: any, i: number) => {
                            solde += m.debit - m.credit;
                            return (
                              <tr key={i} className="hover:bg-surface-secondary/40 transition-colors border-b border-slate-50">
                                <td className="table-cell font-mono text-slate-500 whitespace-nowrap">
                                  {m.date ? formatDate(m.date, true) : '—'}
                                </td>
                                <td className="table-cell font-mono text-slate-400">
                                  {m.reference ?? '—'}
                                </td>
                                <td className="table-cell">
                                  <span className="text-xs bg-surface-tertiary text-slate-600 px-1.5 py-0.5 rounded-md font-medium">
                                    {JOURNAL_TYPE_LABELS[m.journal as JournalType] ?? m.journal}
                                  </span>
                                </td>
                                <td className="table-cell text-brand-navy max-w-xs">
                                  <span className="line-clamp-1">{m.libelle ?? '—'}</span>
                                </td>
                                <td className="table-cell text-right font-mono text-blue-600 font-semibold whitespace-nowrap">
                                  {m.debit > 0 ? formatAmount(m.debit, activeCompany.currency) : '—'}
                                </td>
                                <td className="table-cell text-right font-mono text-emerald-600 font-semibold whitespace-nowrap">
                                  {m.credit > 0 ? formatAmount(m.credit, activeCompany.currency) : '—'}
                                </td>
                                <td className={cn(
                                  'table-cell text-right font-mono font-semibold whitespace-nowrap',
                                  solde > 0 ? 'text-blue-700' : solde < 0 ? 'text-red-600' : 'text-slate-400',
                                )}>
                                  {solde !== 0
                                    ? (solde > 0 ? '' : '− ') + formatAmount(Math.abs(solde), activeCompany.currency)
                                    : '—'
                                  }
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        {/* Sous-total */}
                        <tfoot>
                          <tr className="bg-slate-50 border-t border-slate-200 font-semibold text-xs">
                            <td className="table-cell text-slate-500" colSpan={4}>Sous-total {compte.code}</td>
                            <td className="table-cell text-right font-mono text-blue-700">
                              {formatAmount(compte.debit_total, activeCompany.currency)}
                            </td>
                            <td className="table-cell text-right font-mono text-emerald-700">
                              {formatAmount(compte.credit_total, activeCompany.currency)}
                            </td>
                            <td className={cn(
                              'table-cell text-right font-mono font-bold',
                              compte.solde > 0 ? 'text-blue-700' : compte.solde < 0 ? 'text-red-600' : 'text-slate-500',
                            )}>
                              {compte.solde !== 0
                                ? (compte.solde > 0 ? '' : '− ') + formatAmount(Math.abs(compte.solde), activeCompany.currency)
                                : '—'
                              }
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
