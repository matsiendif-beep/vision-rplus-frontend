'use client';
import { TrendingUp, TrendingDown, Minus, Download } from 'lucide-react';
import Header  from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardHeader, Spinner, ErrorMessage, Badge } from '@/components/ui';
import { useIncomeStatement } from '@/lib/hooks';
import { useCompanyStore }    from '@/lib/store';
import { formatAmount, getResultatColor, cn } from '@/lib/utils';
import type { AccountBalance } from '@/types';

export default function IncomeStatementPage() {
  const { activeCompany, activeFiscalYear } = useCompanyStore();
  const { data, loading, error }            = useIncomeStatement();

  return (
    <div className="flex min-h-screen bg-surface-secondary">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header
          title="Compte de résultat"
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
            <div className="flex items-center justify-center py-24">
              <Spinner size="lg" />
            </div>
          )}

          {!activeCompany && !loading && (
            <div className="flex items-center justify-center py-24">
              <p className="text-slate-400 text-sm">
                Sélectionnez une entreprise et un exercice fiscal.
              </p>
            </div>
          )}

          {data && !loading && (
            <div className="space-y-6 max-w-4xl">

              {/* ── Banner résultat ─────────────────────── */}
              <div className={cn(
                'rounded-2xl p-6 flex items-center justify-between',
                data.nature_resultat === 'benefice'
                  ? 'bg-emerald-50 border border-emerald-100'
                  : data.nature_resultat === 'perte'
                  ? 'bg-red-50 border border-red-100'
                  : 'bg-slate-50 border border-slate-100',
              )}>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                    Résultat net de l'exercice
                  </p>
                  <p className={cn('text-3xl font-black', getResultatColor(data.nature_resultat))}>
                    {data.nature_resultat === 'perte' ? '− ' : ''}
                    {formatAmount(Math.abs(data.resultat_net), activeCompany?.currency)}
                  </p>
                </div>
                <div className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center',
                  data.nature_resultat === 'benefice' ? 'bg-emerald-100' :
                  data.nature_resultat === 'perte'    ? 'bg-red-100'     : 'bg-slate-100',
                )}>
                  {data.nature_resultat === 'benefice'
                    ? <TrendingUp   className="w-7 h-7 text-emerald-600" />
                    : data.nature_resultat === 'perte'
                    ? <TrendingDown className="w-7 h-7 text-red-600" />
                    : <Minus        className="w-7 h-7 text-slate-400" />
                  }
                </div>
              </div>

              {/* ── Grille Produits / Charges ─────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Produits */}
                <Card className="overflow-hidden">
                  <div className="p-5">
                    <CardHeader
                      title="Produits"
                      subtitle="Comptes classe 7"
                      action={
                        <Badge variant="green">
                          {formatAmount(data.total_produits, activeCompany?.currency)}
                        </Badge>
                      }
                    />
                  </div>
                  <AccountTable
                    rows={data.produits}
                    currency={activeCompany?.currency}
                    colorClass="text-emerald-600"
                    total={data.total_produits}
                    totalLabel="Total produits"
                  />
                </Card>

                {/* Charges */}
                <Card className="overflow-hidden">
                  <div className="p-5">
                    <CardHeader
                      title="Charges"
                      subtitle="Comptes classe 6"
                      action={
                        <Badge variant="red">
                          {formatAmount(data.total_charges, activeCompany?.currency)}
                        </Badge>
                      }
                    />
                  </div>
                  <AccountTable
                    rows={data.charges}
                    currency={activeCompany?.currency}
                    colorClass="text-red-600"
                    total={data.total_charges}
                    totalLabel="Total charges"
                  />
                </Card>
              </div>

              {/* ── Synthèse calcul ───────────────────── */}
              <Card className="p-6">
                <h3 className="font-semibold text-brand-navy text-sm mb-4">Synthèse</h3>
                <div className="space-y-3">
                  <SynthesisRow
                    label="Total des produits"
                    value={formatAmount(data.total_produits, activeCompany?.currency)}
                    className="text-emerald-600"
                  />
                  <SynthesisRow
                    label="Total des charges"
                    value={`− ${formatAmount(data.total_charges, activeCompany?.currency)}`}
                    className="text-red-600"
                  />
                  <div className="h-px bg-slate-100 my-2" />
                  <SynthesisRow
                    label={
                      data.nature_resultat === 'benefice' ? 'Bénéfice net' :
                      data.nature_resultat === 'perte'    ? 'Perte nette'  : 'Résultat à l\'équilibre'
                    }
                    value={`${data.nature_resultat === 'perte' ? '− ' : ''}${formatAmount(Math.abs(data.resultat_net), activeCompany?.currency)}`}
                    className={cn('font-bold text-base', getResultatColor(data.nature_resultat))}
                    bold
                  />
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AccountTable({
  rows, currency, colorClass, total, totalLabel,
}: {
  rows:       AccountBalance[];
  currency?:  string;
  colorClass: string;
  total:      number;
  totalLabel: string;
}) {
  if (!rows.length) {
    return (
      <div className="px-5 pb-5 text-xs text-slate-400 text-center py-6">
        Aucun mouvement sur cet exercice
      </div>
    );
  }
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th className="table-header">Compte</th>
          <th className="table-header text-right">Montant</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.account_id} className="hover:bg-surface-secondary/40">
            <td className="table-cell">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-slate-500 w-12 flex-shrink-0">
                  {row.account_code}
                </span>
                <span className="text-brand-navy text-xs line-clamp-1">{row.account_label}</span>
              </div>
            </td>
            <td className={cn('table-cell text-right font-mono text-xs font-semibold', colorClass)}>
              {formatAmount(row.solde, currency)}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="bg-surface-secondary">
          <td className="table-cell font-bold text-xs text-slate-600 uppercase tracking-wide">
            {totalLabel}
          </td>
          <td className={cn('table-cell text-right font-bold font-mono text-sm', colorClass)}>
            {formatAmount(total, currency)}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}

function SynthesisRow({
  label, value, className, bold,
}: { label: string; value: string; className?: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn('text-sm text-slate-600', bold && 'font-semibold text-brand-navy')}>
        {label}
      </span>
      <span className={cn('font-mono text-sm', className)}>{value}</span>
    </div>
  );
}
