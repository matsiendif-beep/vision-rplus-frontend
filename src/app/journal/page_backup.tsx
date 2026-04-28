'use client';
import { useState, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  Plus, Search, Filter, CheckCircle2, XCircle,
  RotateCcw, ChevronLeft, ChevronRight,
  Loader2, Trash2, X, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import Header  from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import {
  Card, Badge, EmptyState, TableSkeleton, ErrorMessage, Spinner,
} from '@/components/ui';
import { journalApi, accountsApi, extractApiError } from '@/lib/api/client';
import { useJournal }      from '@/lib/hooks';
import { useCompanyStore } from '@/lib/store';
import {
  cn, formatDate, formatAmount,
  JOURNAL_TYPE_LABELS, STATUS_LABELS,
} from '@/lib/utils';
import type { JournalType, Account, CreateEntryForm } from '@/types';

const JOURNAL_TYPES: JournalType[] = ['achats', 'ventes', 'banque', 'caisse', 'od', 'salaires'];

export default function JournalPage() {
  const { activeCompany, activeFiscalYear } = useCompanyStore();
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState('');
  const [filterType, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  const { data, loading, error, refetch } = useJournal({
    page, limit: 20,
    ...(search     && { search }),
    ...(filterType && { journal_type: filterType }),
  });

  return (
    <div className="flex min-h-screen bg-surface-secondary">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header
          title="Journal comptable"
          subtitle={activeFiscalYear?.label ?? 'Sélectionnez un exercice'}
          actions={
            activeCompany && activeFiscalYear && (
              <button onClick={() => setShowModal(true)} className="btn-orange">
                <Plus className="w-4 h-4" /> Saisir une écriture
              </button>
            )
          }
        />

        <div className="flex-1 p-6 space-y-4 animate-fade-in">
          {error && <ErrorMessage message={error} />}

          {/* ── Barre de filtres ─────────────────────── */}
          <Card className="p-4">
            <div className="flex flex-wrap gap-3 items-center">
              {/* Recherche */}
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Libellé, référence…"
                  className="input pl-9 text-xs py-2"
                />
              </div>

              {/* Filtre journal */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <select
                  value={filterType}
                  onChange={(e) => { setFilter(e.target.value); setPage(1); }}
                  className="input text-xs py-2 w-36"
                >
                  <option value="">Tous les journaux</option>
                  {JOURNAL_TYPES.map((t) => (
                    <option key={t} value={t}>{JOURNAL_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>

              {/* Reset */}
              {(search || filterType) && (
                <button
                  onClick={() => { setSearch(''); setFilter(''); setPage(1); }}
                  className="btn-secondary text-xs py-2"
                >
                  <X className="w-3.5 h-3.5" /> Réinitialiser
                </button>
              )}

              <div className="ml-auto text-xs text-slate-400">
                {data?.pagination.total ?? 0} écriture(s)
              </div>
            </div>
          </Card>

          {/* ── Table ────────────────────────────────── */}
          <Card className="overflow-hidden">
            {loading ? (
              <TableSkeleton rows={8} />
            ) : (data?.data.length ?? 0) === 0 ? (
              <EmptyState
                title="Aucune écriture trouvée"
                description="Saisissez votre première opération comptable."
                action={
                  activeCompany && activeFiscalYear && (
                    <button onClick={() => setShowModal(true)} className="btn-orange text-xs">
                      <Plus className="w-4 h-4" /> Saisir une écriture
                    </button>
                  )
                }
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="table-header">Date</th>
                        <th className="table-header">Réf.</th>
                        <th className="table-header">Libellé</th>
                        <th className="table-header">Journal</th>
                        <th className="table-header text-right">Débit</th>
                        <th className="table-header text-right">Crédit</th>
                        <th className="table-header text-center">Statut</th>
                        <th className="table-header text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data!.data.map((entry) => (
                        <EntryRow
                          key={entry.id}
                          entry={entry}
                          currency={activeCompany?.currency ?? 'EUR'}
                          onValidate={async () => {
                            try {
                              await journalApi.validateEntry(activeCompany!.id, entry.id);
                              toast.success('Écriture validée');
                              refetch();
                            } catch (e) { toast.error(extractApiError(e)); }
                          }}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {data && data.pagination.total_pages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                    <p className="text-xs text-slate-400">
                      Page {data.pagination.page} / {data.pagination.total_pages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="btn-secondary text-xs py-1.5 px-3"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setPage((p) => Math.min(data.pagination.total_pages, p + 1))}
                        disabled={page === data.pagination.total_pages}
                        className="btn-secondary text-xs py-1.5 px-3"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      </div>

      {/* ── Modal saisie ─────────────────────────────── */}
      {showModal && activeCompany && activeFiscalYear && (
        <EntryModal
          companyId={activeCompany.id}
          fiscalYearId={activeFiscalYear.id}
          currency={activeCompany.currency}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); refetch(); }}
        />
      )}
    </div>
  );
}

// ── Ligne du tableau ──────────────────────────────────────────
function EntryRow({
  entry, currency, onValidate,
}: {
  entry:       any;
  currency:    string;
  onValidate:  () => void;
}) {
  return (
    <tr className="hover:bg-surface-secondary/40 transition-colors group">
      <td className="table-cell font-mono text-xs text-slate-500 whitespace-nowrap">
        {formatDate(entry.entry_date, true)}
      </td>
      <td className="table-cell text-xs text-slate-400 font-mono">
        {entry.reference ?? '—'}
      </td>
      <td className="table-cell font-medium text-brand-navy max-w-xs">
        <span className="line-clamp-1">{entry.libelle}</span>
      </td>
      <td className="table-cell">
        <span className="text-xs bg-surface-tertiary text-slate-600 px-2 py-0.5 rounded-lg font-medium">
          {JOURNAL_TYPE_LABELS[entry.journal_type as JournalType]}
        </span>
      </td>
      <td className="table-cell text-right font-mono text-xs text-blue-600 font-semibold whitespace-nowrap">
        {formatAmount(parseFloat(entry.total_debit), currency)}
      </td>
      <td className="table-cell text-right font-mono text-xs text-emerald-600 font-semibold whitespace-nowrap">
        {formatAmount(parseFloat(entry.total_credit), currency)}
      </td>
      <td className="table-cell text-center">
        <Badge variant={
          entry.status === 'validee' ? 'green' :
          entry.status === 'brouillon' ? 'amber' : 'red'
        }>
          {STATUS_LABELS[entry.status as keyof typeof STATUS_LABELS]}
        </Badge>
      </td>
      <td className="table-cell text-center">
        {entry.status === 'brouillon' && (
          <button
            onClick={onValidate}
            title="Valider l'écriture"
            className="inline-flex items-center gap-1 text-xs text-emerald-600
                       hover:text-emerald-700 font-medium transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
        )}
      </td>
    </tr>
  );
}

// ── Modal saisie d'écriture ───────────────────────────────────
function EntryModal({
  companyId, fiscalYearId, currency, onClose, onSuccess,
}: {
  companyId:    string;
  fiscalYearId: string;
  currency:     string;
  onClose:      () => void;
  onSuccess:    () => void;
}) {
  const [saving, setSaving]       = useState(false);
  const [accounts, setAccounts]   = useState<Account[]>([]);
  const [searchAcc, setSearchAcc] = useState('');

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<CreateEntryForm>({
      defaultValues: {
        fiscal_year_id: fiscalYearId,
        journal_type:   'banque',
        entry_date:     new Date().toISOString().slice(0, 10),
        lines: [
          { account_id: '', debit: 0, credit: 0 },
          { account_id: '', debit: 0, credit: 0 },
        ],
      },
    });

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });
  const lines = watch('lines');

  const totalDebit  = lines.reduce((s, l) => s + (Number(l.debit)  || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const isBalanced  = Math.abs(totalDebit - totalCredit) < 0.01;

  // Recherche compte (autocomplete)
  const searchAccounts = useCallback(async (q: string) => {
    if (q.length < 1) return;
    try {
      const res = await accountsApi.search(companyId, q);
      setAccounts(res);
    } catch {}
  }, [companyId]);

  const onSubmit = async (data: CreateEntryForm) => {
    setSaving(true);
    try {
      await journalApi.createEntry(companyId, {
        ...data,
        lines: data.lines.map((l) => ({
          ...l,
          debit:  Number(l.debit)  || 0,
          credit: Number(l.credit) || 0,
        })),
      });
      toast.success('Écriture enregistrée en brouillon');
      onSuccess();
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto animate-slide-up">

        {/* Header modal */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4
                        flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="font-bold text-brand-navy">Saisir une écriture</h2>
            <p className="text-xs text-slate-400">Partie double · Débit = Crédit</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center
                                               rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">

          {/* Ligne 1 : journal + date + référence */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Journal *</label>
              <select {...register('journal_type')} className="input text-sm">
                {JOURNAL_TYPES.map((t) => (
                  <option key={t} value={t}>{JOURNAL_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Date *</label>
              <input {...register('entry_date', { required: true })} type="date" className="input" />
            </div>
            <div>
              <label className="label">Référence</label>
              <input {...register('reference')} placeholder="FAC-2025-001" className="input" />
            </div>
          </div>

          {/* Libellé */}
          <div>
            <label className="label">Libellé *</label>
            <input
              {...register('libelle', { required: 'Requis' })}
              placeholder="Description de l'opération"
              className="input"
            />
            {errors.libelle && <p className="text-red-500 text-xs mt-1">{errors.libelle.message}</p>}
          </div>

          {/* Lignes d'écriture */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Lignes d'écriture *</label>
              <button
                type="button"
                onClick={() => append({ account_id: '', debit: 0, credit: 0 })}
                className="text-xs text-brand-orange hover:text-brand-orange-400 font-medium
                           flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter une ligne
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-0 bg-surface-secondary px-3 py-2
                              text-xs font-semibold text-slate-500 uppercase tracking-wide
                              border-b border-slate-200">
                <div className="col-span-5">Compte</div>
                <div className="col-span-3">Libellé ligne</div>
                <div className="col-span-2 text-right">Débit</div>
                <div className="col-span-2 text-right pr-7">Crédit</div>
              </div>

              {fields.map((field, index) => (
                <div key={field.id}
                  className="grid grid-cols-12 gap-2 px-3 py-2 items-center
                             border-b border-slate-100 last:border-0 hover:bg-surface-secondary/30">
                  {/* Compte */}
                  <div className="col-span-5 relative">
                    <input
                      {...register(`lines.${index}.account_id`, { required: true })}
                      placeholder="Code ou libellé…"
                      className="input text-xs py-1.5"
                      onChange={(e) => {
                        setValue(`lines.${index}.account_id`, e.target.value);
                        searchAccounts(e.target.value);
                      }}
                    />
                    {accounts.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-0.5 bg-white
                                      border border-slate-200 rounded-xl shadow-card z-10
                                      max-h-40 overflow-y-auto">
                        {accounts.map((acc) => (
                          <button
                            key={acc.id}
                            type="button"
                            onClick={() => {
                              setValue(`lines.${index}.account_id`, acc.id);
                              setAccounts([]);
                            }}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-surface-secondary
                                       flex items-center gap-2 transition-colors"
                          >
                            <span className="font-mono font-semibold text-brand-navy w-10 flex-shrink-0">
                              {acc.code}
                            </span>
                            <span className="text-slate-600 line-clamp-1">{acc.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Libellé ligne */}
                  <div className="col-span-3">
                    <input
                      {...register(`lines.${index}.libelle`)}
                      placeholder="—"
                      className="input text-xs py-1.5"
                    />
                  </div>

                  {/* Débit */}
                  <div className="col-span-2">
                    <input
                      {...register(`lines.${index}.debit`)}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="input text-xs py-1.5 text-right font-mono text-blue-600"
                    />
                  </div>

                  {/* Crédit */}
                  <div className="col-span-1">
                    <input
                      {...register(`lines.${index}.credit`)}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="input text-xs py-1.5 text-right font-mono text-emerald-600"
                    />
                  </div>

                  {/* Supprimer */}
                  <div className="col-span-1 flex justify-end">
                    {fields.length > 2 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg
                                   hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Totaux */}
              <div className="grid grid-cols-12 gap-2 px-3 py-2.5 bg-surface-secondary
                              border-t border-slate-200">
                <div className="col-span-8 text-xs font-semibold text-slate-500 uppercase
                                tracking-wide flex items-center gap-2">
                  Total
                  {isBalanced
                    ? <span className="text-emerald-600 text-xs font-normal flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Équilibré
                      </span>
                    : <span className="text-red-500 text-xs font-normal flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Écart : {Math.abs(totalDebit - totalCredit).toFixed(2)}
                      </span>
                  }
                </div>
                <div className="col-span-2 text-right font-mono font-bold text-blue-600 text-xs">
                  {totalDebit.toFixed(2)}
                </div>
                <div className="col-span-2 text-right font-mono font-bold text-emerald-600 text-xs pr-7">
                  {totalCredit.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving || !isBalanced}
              className="btn-primary flex-1 justify-center"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving ? 'Enregistrement…' : 'Enregistrer en brouillon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
