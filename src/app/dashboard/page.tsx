'use client';
import { useEffect } from 'react';
import { useRouter }  from 'next/navigation';
import { RefreshCw, Plus, AlertTriangle } from 'lucide-react';
import Header         from '@/components/layout/Header';
import MetricCards    from '@/components/dashboard/MetricCards';
import MonthlyChart   from '@/components/dashboard/MonthlyChart';
import RecentEntries  from '@/components/dashboard/RecentEntries';
import { Card, CardHeader, Spinner, ErrorMessage } from '@/components/ui';
import { useDashboard, useJournal } from '@/lib/hooks';
import { useAuthStore, useCompanyStore } from '@/lib/store';
import { formatDate, formatAmount, SYSTEM_LABELS } from '@/lib/utils';

export default function DashboardPage() {
  const router                               = useRouter();
  const { isAuthenticated }                  = useAuthStore();
  const { activeCompany, activeFiscalYear }  = useCompanyStore();
  const { data: dashboard, loading: dashLoading, error: dashError, refetch } = useDashboard();
  const { data: journalData, loading: journalLoading } = useJournal({ limit: 6, status: 'validee' });

  // Rediriger si non authentifié
  useEffect(() => {
    if (!isAuthenticated) router.push('/auth/login');
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  // ── Aucune entreprise ────────────────────────────────────
  if (!activeCompany) {
    return (
      <div className="flex flex-col">
        <Header title="Dashboard" />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 bg-brand-orange/10 rounded-2xl flex items-center
                            justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-brand-orange" />
            </div>
            <h2 className="text-xl font-bold text-brand-navy mb-2">
              Aucune entreprise sélectionnée
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Créez votre premier dossier comptable ou sélectionnez une entreprise existante
              depuis le menu latéral.
            </p>
            <button
              onClick={() => router.push('/companies')}
              className="btn-orange"
            >
              <Plus className="w-4 h-4" /> Créer une entreprise
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── En-tête ─────────────────────────────────────── */}
      <Header
        title="Dashboard"
        subtitle={`${activeCompany.name} · ${SYSTEM_LABELS[activeCompany.accounting_system]}`}
        actions={
          <button
            onClick={refetch}
            disabled={dashLoading}
            className="btn-secondary"
          >
            {dashLoading
              ? <Spinner size="sm" />
              : <RefreshCw className="w-3.5 h-3.5" />
            }
            Actualiser
          </button>
        }
      />

      {/* ── Contenu ─────────────────────────────────────── */}
      <div className="flex-1 p-6 space-y-6 animate-fade-in">

        {/* Erreur API */}
        {dashError && <ErrorMessage message={dashError} />}

        {/* ── Exercice actif info bar ───────────────────── */}
        {activeFiscalYear && (
          <div className="flex items-center gap-3 bg-brand-navy/5 rounded-xl px-4 py-3
                          border border-brand-navy/10">
            <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" />
            <p className="text-xs font-medium text-brand-navy">
              <span className="font-semibold">{activeFiscalYear.label}</span>
              {' · '}
              {formatDate(activeFiscalYear.start_date, true)}
              {' → '}
              {formatDate(activeFiscalYear.end_date, true)}
              {activeFiscalYear.is_closed && (
                <span className="ml-2 text-amber-600 font-semibold">· Clôturé</span>
              )}
            </p>
          </div>
        )}

        {/* ── KPI Cards ─────────────────────────────────── */}
        {dashboard ? (
          <MetricCards
            data={dashboard}
            currency={activeCompany.currency}
            loading={dashLoading}
          />
        ) : dashLoading ? (
          <MetricCards data={{} as any} currency={activeCompany.currency} loading />
        ) : null}

        {/* ── Graphique + Résultat rapide ───────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Graphique évolution (2/3) */}
          <div className="xl:col-span-2">
            <MonthlyChart
              data={dashboard?.monthly_evolution ?? []}
              currency={activeCompany.currency}
              loading={dashLoading}
            />
          </div>

          {/* Résumé résultat (1/3) */}
          <div>
            <Card className="p-5 h-full">
              <CardHeader title="Résultat de l'exercice" />

              {dashLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Spinner size="md" />
                </div>
              ) : dashboard ? (
                <div className="space-y-4">
                  {/* Jauge visuelle Produits / Charges */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-emerald-600 font-semibold">Produits</span>
                      <span className="font-mono text-emerald-600">
                        {formatAmount(dashboard.total_produits, activeCompany.currency)}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div className="flex justify-between text-xs mt-3 mb-1">
                      <span className="text-red-500 font-semibold">Charges</span>
                      <span className="font-mono text-red-500">
                        {formatAmount(dashboard.total_charges, activeCompany.currency)}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-400 rounded-full transition-all duration-700"
                        style={{
                          width: dashboard.total_produits > 0
                            ? `${Math.min(100, (dashboard.total_charges / dashboard.total_produits) * 100).toFixed(1)}%`
                            : '0%',
                        }}
                      />
                    </div>
                  </div>

                  {/* Résultat net */}
                  <div className={`rounded-xl p-4 text-center border ${
                    dashboard.nature_resultat === 'benefice'
                      ? 'bg-emerald-50 border-emerald-100'
                      : dashboard.nature_resultat === 'perte'
                      ? 'bg-red-50 border-red-100'
                      : 'bg-slate-50 border-slate-100'
                  }`}>
                    <p className="text-xs text-slate-500 mb-1">Résultat net</p>
                    <p className={`text-xl font-bold ${
                      dashboard.nature_resultat === 'benefice' ? 'text-emerald-600' :
                      dashboard.nature_resultat === 'perte'    ? 'text-red-600' :
                      'text-slate-500'
                    }`}>
                      {dashboard.nature_resultat === 'perte' ? '−' : ''}
                      {formatAmount(Math.abs(dashboard.resultat_net), activeCompany.currency)}
                    </p>
                    <p className={`text-xs font-semibold mt-1 capitalize ${
                      dashboard.nature_resultat === 'benefice' ? 'text-emerald-600' :
                      dashboard.nature_resultat === 'perte'    ? 'text-red-600' :
                      'text-slate-500'
                    }`}>
                      {dashboard.nature_resultat === 'benefice' ? 'Bénéfice' :
                       dashboard.nature_resultat === 'perte'    ? 'Perte' :
                       'À l\'équilibre'}
                    </p>
                  </div>

                  {/* Quick links */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => router.push('/income-statement')}
                      className="btn-secondary text-xs py-2 justify-center"
                    >
                      Compte de résultat
                    </button>
                    <button
                      onClick={() => router.push('/balance-sheet')}
                      className="btn-secondary text-xs py-2 justify-center"
                    >
                      Bilan
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-sm text-center py-8">
                  Sélectionnez un exercice pour voir les résultats
                </p>
              )}
            </Card>
          </div>
        </div>

        {/* ── Dernières écritures ───────────────────────── */}
        <RecentEntries
          entries={journalData?.data ?? []}
          currency={activeCompany.currency}
          loading={journalLoading}
        />
      </div>
    </div>
  );
}
