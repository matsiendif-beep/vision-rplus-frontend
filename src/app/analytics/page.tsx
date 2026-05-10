'use client';
import { useEffect, useState } from 'react';
import {
  TrendingUp, TrendingDown, Wallet, Target,
  BarChart3, AlertTriangle, CheckCircle2, Minus,
} from 'lucide-react';
import Header  from '@/components/layout/Header';
import { Card, Spinner, ErrorMessage, Badge } from '@/components/ui';
import { analyticsApi, extractApiError } from '@/lib/api/client';
import { useCompanyStore } from '@/lib/store';
import { formatAmount, cn } from '@/lib/utils';

export default function AnalyticsPage() {
  const { activeCompany, activeFiscalYear } = useCompanyStore();
  const [data, setData]     = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!activeCompany || !activeFiscalYear) return;
    setLoading(true);
    analyticsApi.dashboard(activeCompany.id, activeFiscalYear.id)
      .then(setData)
      .catch(e => setError(extractApiError(e)))
      .finally(() => setLoading(false));
  }, [activeCompany, activeFiscalYear]);

  if (!activeCompany || !activeFiscalYear) {
    return (
      <div className="flex-1 min-w-0 flex flex-col">
        <Header title="Analyse financière & KPIs" subtitle="—" />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center max-w-xs">
            <BarChart3 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="font-semibold text-brand-navy mb-1">Aucun exercice sélectionné</p>
            <p className="text-sm text-slate-400">Sélectionnez une entreprise et un exercice fiscal pour afficher les analytics.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <Header
        title="Analyse financière & KPIs"
        subtitle={activeFiscalYear?.label ?? '—'}
      />

      <div className="flex-1 p-6 space-y-6 animate-fade-in">
        {error   && <ErrorMessage message={error} />}
        {loading && <div className="flex items-center justify-center py-24"><Spinner size="lg" /></div>}

        {!activeCompany && !loading && (
          <div className="flex items-center justify-center py-24">
            <p className="text-slate-400 text-sm">Sélectionnez une entreprise et un exercice.</p>
          </div>
        )}

        {data && !loading && (
          <>
            {/* ── Résultat net banner ─────────────────────── */}
            <div className={cn(
              'rounded-2xl p-6 flex items-center justify-between border',
              data.synthese.resultat_net >= 0
                ? 'bg-emerald-50 border-emerald-100'
                : 'bg-red-50 border-red-100',
            )}>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Résultat net de l'exercice
                </p>
                <p className={cn(
                  'text-3xl font-black',
                  data.synthese.resultat_net >= 0 ? 'text-emerald-600' : 'text-red-600',
                )}>
                  {data.synthese.resultat_net < 0 ? '− ' : ''}
                  {formatAmount(Math.abs(data.synthese.resultat_net), activeCompany?.currency)}
                </p>
              </div>
              <div className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center',
                data.synthese.resultat_net >= 0 ? 'bg-emerald-100' : 'bg-red-100',
              )}>
                {data.synthese.resultat_net >= 0
                  ? <TrendingUp   className="w-7 h-7 text-emerald-600" />
                  : <TrendingDown className="w-7 h-7 text-red-600" />
                }
              </div>
            </div>

            {/* ── KPIs ──────────────────────────────────────── */}
            <div>
              <h2 className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-3">
                Indicateurs clés
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <KpiCard
                  label="CAF"
                  value={formatAmount(data.kpis.caf, activeCompany?.currency)}
                  subtitle="Capacité d'autofinancement"
                  icon={Wallet}
                  positive={data.kpis.caf >= 0}
                />
                <KpiCard
                  label="Trésorerie nette"
                  value={formatAmount(data.kpis.tresorerie_nette, activeCompany?.currency)}
                  subtitle="Disponibilités"
                  icon={Wallet}
                  positive={data.kpis.tresorerie_nette >= 0}
                />
                <KpiCard
                  label="Rentabilité nette"
                  value={`${data.kpis.rentabilite_nette_pct} %`}
                  subtitle="Résultat / CA"
                  icon={TrendingUp}
                  positive={data.kpis.rentabilite_nette_pct >= 0}
                />
                <KpiCard
                  label="Taux endettement"
                  value={`${data.kpis.endettement} %`}
                  subtitle="Dettes / Actif total"
                  icon={BarChart3}
                  positive={data.kpis.endettement < 70}
                />
                <KpiCard
                  label="Seuil de rentabilité"
                  value={formatAmount(data.kpis.seuil_rentabilite, activeCompany?.currency)}
                  subtitle="CA minimum à atteindre"
                  icon={Target}
                  positive={Math.abs(data.synthese.total_produits) >= data.kpis.seuil_rentabilite}
                />
              </div>
            </div>

            {/* ── Synthèse produits/charges ─────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="p-5">
                <p className="text-xs text-slate-400 mb-1">Produits</p>
                <p className="font-bold text-emerald-600 font-mono text-lg">
                  {formatAmount(Math.abs(data.synthese.total_produits), activeCompany?.currency)}
                </p>
              </Card>
              <Card className="p-5">
                <p className="text-xs text-slate-400 mb-1">Charges</p>
                <p className="font-bold text-red-500 font-mono text-lg">
                  {formatAmount(data.synthese.total_charges, activeCompany?.currency)}
                </p>
              </Card>
              <Card className="p-5">
                <p className="text-xs text-slate-400 mb-1">Trésorerie</p>
                <p className={cn(
                  'font-bold font-mono text-lg',
                  data.synthese.tresorerie >= 0 ? 'text-blue-600' : 'text-red-500',
                )}>
                  {formatAmount(data.synthese.tresorerie, activeCompany?.currency)}
                </p>
              </Card>
            </div>

            {/* ── Évolution mensuelle ───────────────────────── */}
            {data.evolution?.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold text-brand-navy text-sm mb-4">Évolution mensuelle</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        <th className="table-header">Mois</th>
                        <th className="table-header text-right text-emerald-600">Produits</th>
                        <th className="table-header text-right text-red-500">Charges</th>
                        <th className="table-header text-right">Résultat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.evolution.map((row: any) => {
                        const res = row.produits - row.charges;
                        return (
                          <tr key={row.mois} className="border-b border-slate-50">
                            <td className="table-cell font-mono">{row.mois}</td>
                            <td className="table-cell text-right font-mono text-emerald-600">
                              {formatAmount(row.produits, activeCompany?.currency)}
                            </td>
                            <td className="table-cell text-right font-mono text-red-500">
                              {formatAmount(row.charges, activeCompany?.currency)}
                            </td>
                            <td className={cn('table-cell text-right font-mono font-semibold', res >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                              {formatAmount(res, activeCompany?.currency)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* ── Alertes ───────────────────────────────────── */}
            {data.alertes?.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold text-brand-navy text-sm mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Alertes détectées
                </h3>
                <div className="space-y-2">
                  {data.alertes.map((alerte: any, i: number) => (
                    <div key={i} className={cn(
                      'flex items-start gap-3 p-3 rounded-xl border text-sm',
                      alerte.severity === 'critique'
                        ? 'bg-red-50 border-red-100 text-red-700'
                        : 'bg-amber-50 border-amber-100 text-amber-700',
                    )}>
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{alerte.message}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function KpiCard({ label, value, subtitle, icon: Icon, positive }: any) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center',
          positive ? 'bg-emerald-100' : 'bg-red-100',
        )}>
          <Icon className={cn('w-4 h-4', positive ? 'text-emerald-600' : 'text-red-500')} />
        </div>
        {positive
          ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          : <AlertTriangle className="w-4 h-4 text-amber-400" />
        }
      </div>
      <p className="font-bold text-brand-navy font-mono text-base">{value}</p>
      <p className="text-xs font-semibold text-slate-600 mt-0.5">{label}</p>
      <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>
    </Card>
  );
}
