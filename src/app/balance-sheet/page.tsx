'use client';
import { Scale, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import Header  from '@/components/layout/Header';
import { Card, CardHeader, Spinner, ErrorMessage } from '@/components/ui';
import { useBalanceSheet }  from '@/lib/hooks';
import { useCompanyStore }  from '@/lib/store';
import { formatAmount, cn } from '@/lib/utils';
import type { AccountBalance } from '@/types';

export default function BalanceSheetPage() {
  const { activeCompany, activeFiscalYear } = useCompanyStore();
  const { data, loading, error }            = useBalanceSheet();

  if (!activeCompany || !activeFiscalYear) {
    return (
      <div className="flex-1 min-w-0 flex flex-col">
        <Header title="Bilan comptable" subtitle="—" />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center max-w-xs">
            <Scale className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="font-semibold text-brand-navy mb-1">Aucun exercice sélectionné</p>
            <p className="text-sm text-slate-400">Sélectionnez une entreprise et un exercice fiscal pour afficher le bilan.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 flex flex-col">
        <Header
          title="Bilan comptable"
          subtitle={activeFiscalYear?.label ?? '—'}
          actions={
            data && (
              <button className="btn-secondary text-xs">
                <Download className="w-3.5 h-3.5" /> Exporter PDF
              </button>
            )
          }
        />

        <div className="flex-1 p-6 animate-fade-in">
          {error   && <ErrorMessage message={error} />}
          {loading && (
            <div className="flex items-center justify-center py-24"><Spinner size="lg" /></div>
          )}
          {!activeCompany && !loading && (
            <div className="flex items-center justify-center py-24">
              <p className="text-slate-400 text-sm">Sélectionnez une entreprise et un exercice.</p>
            </div>
          )}

          {data && !loading && (
            <div className="space-y-5 max-w-5xl">

              {/* ── Équilibre banner ─────────────────── */}
              <div className={cn(
                'rounded-2xl p-5 flex items-center gap-4 border',
                data.is_balanced
                  ? 'bg-emerald-50 border-emerald-100'
                  : 'bg-amber-50 border-amber-100',
              )}>
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  data.is_balanced ? 'bg-emerald-100' : 'bg-amber-100',
                )}>
                  {data.is_balanced
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    : <AlertTriangle className="w-5 h-5 text-amber-600" />
                  }
                </div>
                <div>
                  <p className={cn(
                    'text-sm font-bold',
                    data.is_balanced ? 'text-emerald-700' : 'text-amber-700',
                  )}>
                    {data.is_balanced
                      ? 'Bilan équilibré — Actif = Passif ✓'
                      : `Bilan déséquilibré — Écart : ${formatAmount(data.ecart_bilan, activeCompany?.currency)}`
                    }
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Actif total : {formatAmount(data.actif.total_actif, activeCompany?.currency)}
                    {' · '}
                    Passif total : {formatAmount(data.passif.total_passif, activeCompany?.currency)}
                  </p>
                </div>
                <div className="ml-auto hidden sm:flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-xs text-slate-400">ACTIF</p>
                    <p className="font-bold text-blue-600 font-mono text-sm">
                      {formatAmount(data.actif.total_actif, activeCompany?.currency)}
                    </p>
                  </div>
                  <Scale className="w-5 h-5 text-slate-300" />
                  <div className="text-center">
                    <p className="text-xs text-slate-400">PASSIF</p>
                    <p className="font-bold text-emerald-600 font-mono text-sm">
                      {formatAmount(data.passif.total_passif, activeCompany?.currency)}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Grille Actif / Passif ─────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ── ACTIF ──────────────────────────── */}
                <div className="space-y-4">
                  <h2 className="text-sm font-bold text-blue-700 uppercase tracking-widest px-1">
                    Actif
                  </h2>

                  <BilanSection
                    title="Actif immobilisé"
                    subtitle="Classe 2"
                    rows={data.actif.immobilisations}
                    currency={activeCompany?.currency}
                    colorClass="text-blue-600"
                  />
                  <BilanSection
                    title="Stocks"
                    subtitle="Classe 3"
                    rows={data.actif.stocks}
                    currency={activeCompany?.currency}
                    colorClass="text-blue-600"
                  />
                  <BilanSection
                    title="Créances"
                    subtitle="Clients, TVA déductible…"
                    rows={data.actif.creances}
                    currency={activeCompany?.currency}
                    colorClass="text-blue-600"
                  />
                  <BilanSection
                    title="Trésorerie"
                    subtitle="Banque, Caisse"
                    rows={data.actif.tresorerie}
                    currency={activeCompany?.currency}
                    colorClass="text-blue-600"
                  />

                  {/* Total actif */}
                  <TotalRow
                    label="TOTAL ACTIF"
                    value={formatAmount(data.actif.total_actif, activeCompany?.currency)}
                    className="bg-blue-50 border border-blue-100 text-blue-700"
                  />
                </div>

                {/* ── PASSIF ─────────────────────────── */}
                <div className="space-y-4">
                  <h2 className="text-sm font-bold text-emerald-700 uppercase tracking-widest px-1">
                    Passif
                  </h2>

                  <BilanSection
                    title="Capitaux propres"
                    subtitle="Capital, Réserves, Report à nouveau"
                    rows={data.passif.capitaux_propres}
                    currency={activeCompany?.currency}
                    colorClass="text-emerald-600"
                  />
                  <BilanSection
                    title="Dettes fournisseurs"
                    subtitle="Comptes 401…"
                    rows={data.passif.dettes_fournisseurs}
                    currency={activeCompany?.currency}
                    colorClass="text-emerald-600"
                  />
                  <BilanSection
                    title="Dettes fiscales & sociales"
                    subtitle="TVA, charges sociales…"
                    rows={data.passif.dettes_fiscales_sociales}
                    currency={activeCompany?.currency}
                    colorClass="text-emerald-600"
                  />
                  <BilanSection
                    title="Emprunts"
                    subtitle="Dettes financières"
                    rows={data.passif.emprunts}
                    currency={activeCompany?.currency}
                    colorClass="text-emerald-600"
                  />

                  {/* Résultat exercice */}
                  <Card className="overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-100 bg-surface-secondary">
                      <p className="text-xs font-semibold text-slate-600">Résultat de l'exercice</p>
                    </div>
                    <div className="px-5 py-3 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {data.passif.resultat_exercice >= 0 ? 'Bénéfice' : 'Perte'}
                      </span>
                      <span className={cn(
                        'font-mono text-xs font-bold',
                        data.passif.resultat_exercice >= 0 ? 'text-emerald-600' : 'text-red-600',
                      )}>
                        {data.passif.resultat_exercice < 0 ? '− ' : ''}
                        {formatAmount(Math.abs(data.passif.resultat_exercice), activeCompany?.currency)}
                      </span>
                    </div>
                  </Card>

                  {/* Total passif */}
                  <TotalRow
                    label="TOTAL PASSIF"
                    value={formatAmount(data.passif.total_passif, activeCompany?.currency)}
                    className="bg-emerald-50 border border-emerald-100 text-emerald-700"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  );
}

function BilanSection({
  title, subtitle, rows, currency, colorClass,
}: {
  title:      string;
  subtitle:   string;
  rows:       AccountBalance[];
  currency?:  string;
  colorClass: string;
}) {
  if (!rows.length) return null;
  return (
    <Card className="overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 bg-surface-secondary">
        <p className="text-xs font-semibold text-slate-700">{title}</p>
        <p className="text-[10px] text-slate-400">{subtitle}</p>
      </div>
      <table className="w-full">
        <tbody>
          {rows.map((row) => (
            <tr key={row.account_id} className="hover:bg-surface-secondary/30 border-b border-slate-50 last:border-0">
              <td className="px-5 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold text-slate-400 w-10 flex-shrink-0">
                    {row.account_code}
                  </span>
                  <span className="text-xs text-brand-navy line-clamp-1">{row.account_label}</span>
                </div>
              </td>
              <td className={cn('px-5 py-2.5 text-right font-mono text-xs font-semibold', colorClass)}>
                {formatAmount(row.solde, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function TotalRow({ label, value, className }: { label: string; value: string; className: string }) {
  return (
    <div className={cn('rounded-xl px-5 py-3.5 flex items-center justify-between', className)}>
      <span className="text-xs font-black uppercase tracking-widest">{label}</span>
      <span className="font-mono font-black text-sm">{value}</span>
    </div>
  );
}
