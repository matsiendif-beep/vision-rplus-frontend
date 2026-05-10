'use client';
import { useState, useCallback, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  Plus, Search, Filter, CheckCircle2,
  RotateCcw, ChevronLeft, ChevronRight,
  Loader2, Trash2, X, AlertCircle, Upload, Download, Pencil, AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import Header  from '@/components/layout/Header';
import {
  Card, Badge, EmptyState, TableSkeleton, ErrorMessage,
} from '@/components/ui';
import { journalApi, accountsApi, extractApiError } from '@/lib/api/client';
import { useJournal }      from '@/lib/hooks';
import { useCompanyStore } from '@/lib/store';
import {
  cn, formatDate, formatAmount,
  JOURNAL_TYPE_LABELS, STATUS_LABELS,
} from '@/lib/utils';
import type { JournalType, Account, CreateEntryForm } from '@/types';

const JOURNAL_TYPES: JournalType[] = ['achats', 'ventes', 'banque', 'caisse', 'od', 'salaires', 'actif'];

export default function JournalPage() {
  const { activeCompany, activeFiscalYear } = useCompanyStore();
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState('');
  const [filterType, setFilter] = useState('');
  const [showModal, setShowModal]       = useState(false);
  const [editingEntry, setEditingEntry] = useState<any | null>(null);
  const [importing, setImporting]         = useState(false);
  const [exporting, setExporting]         = useState(false);
  const [cleaning, setCleaning]           = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleCleanUnbalanced = async () => {
    if (!activeCompany) return;
    setCleaning(true);
    try {
      const result = await journalApi.deleteUnbalancedDrafts(activeCompany.id);
      if (result.deleted === 0) {
        toast.info('Aucun brouillon déséquilibré trouvé');
      } else {
        toast.success(`${result.deleted} brouillon(s) déséquilibré(s) supprimé(s)`);
        refetch();
      }
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setCleaning(false);
    }
  };

  const handleExportCsv = async () => {
    if (!activeCompany || !activeFiscalYear) return;
    setExporting(true);
    try {
      const blob = await journalApi.exportCsv(activeCompany.id, activeFiscalYear.id);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `journal_${activeCompany.id.slice(0, 8)}_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setExporting(false);
    }
  };

  const handleImportCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeCompany) return;
    e.target.value = '';
    setImporting(true);
    try {
      const result = await journalApi.importCsv(activeCompany.id, file);
      toast.success(`Import : ${result.created} écriture(s) créée(s)${result.skipped > 0 ? ` · ${result.skipped} ignorée(s)` : ''}`);
      if (result.errors.length > 0) {
        result.errors.slice(0, 3).forEach((e: string) => toast.warning(e));
        if (result.errors.length > 3) {
          toast.warning(`… et ${result.errors.length - 3} autre(s) avertissement(s)`);
        }
      }
      refetch();
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setImporting(false);
    }
  };

  const { data, loading, error, refetch } = useJournal({
    page,
    ...(search     && { search }),
    ...(filterType && { journal_type: filterType }),
  });

  return (
    <>
    <div className="flex-1 min-w-0 flex flex-col">
        <Header
          title="Journal comptable"
          subtitle={activeFiscalYear?.label ?? 'Sélectionnez un exercice'}
          actions={
            activeCompany && activeFiscalYear && (
              <div className="flex items-center gap-2">
                <input
                  ref={importInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleImportCsv}
                />
                <button
                  onClick={handleExportCsv}
                  disabled={exporting}
                  className="btn-secondary text-sm"
                  title="Exporter le journal en CSV"
                >
                  {exporting
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Download className="w-4 h-4" />
                  }
                  {exporting ? 'Export…' : 'Exporter CSV'}
                </button>
                <button
                  onClick={() => importInputRef.current?.click()}
                  disabled={importing}
                  className="btn-secondary text-sm"
                  title="Importer un fichier CSV Vision R+"
                >
                  {importing
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Upload className="w-4 h-4" />
                  }
                  {importing ? 'Import…' : 'Importer CSV'}
                </button>
                <button
                  onClick={handleCleanUnbalanced}
                  disabled={cleaning}
                  className="btn-secondary text-sm text-amber-600 border-amber-200 hover:bg-amber-50"
                  title="Supprimer tous les brouillons déséquilibrés (< 2 lignes ou débit ≠ crédit)"
                >
                  {cleaning
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <AlertTriangle className="w-4 h-4" />
                  }
                  Nettoyer
                </button>
                <button onClick={() => setShowModal(true)} className="btn-orange">
                  <Plus className="w-4 h-4" /> Saisir une écriture
                </button>
              </div>
            )
          }
        />

        <div className="flex-1 p-6 space-y-4 animate-fade-in">
          {error && <ErrorMessage message={error} />}

          {/* ── Barre de filtres ─────────────────────── */}
          <Card className="p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Libellé, référence…"
                  className="input pl-9 text-xs py-2"
                />
              </div>
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
                          currency={activeCompany?.currency ?? 'XAF'}
                          onValidate={async () => {
                            try {
                              await journalApi.validateEntry(activeCompany!.id, entry.id);
                              toast.success('Écriture validée');
                              refetch();
                            } catch (e) { toast.error(extractApiError(e)); }
                          }}
                          onEdit={() => setEditingEntry(entry)}
                          onDelete={async () => {
                            if (!confirm('Supprimer cette écriture en brouillon ?')) return;
                            try {
                              await journalApi.deleteEntry(activeCompany!.id, entry.id);
                              toast.success('Écriture supprimée');
                              refetch();
                            } catch (e) { toast.error(extractApiError(e)); }
                          }}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
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

      {/* Modal création */}
      {showModal && activeCompany && activeFiscalYear && (
        <EntryModal
          companyId={activeCompany.id}
          fiscalYearId={activeFiscalYear.id}
          currency={activeCompany.currency}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); refetch(); }}
        />
      )}

      {/* Modal édition brouillon */}
      {editingEntry && activeCompany && activeFiscalYear && (
        <EntryModal
          companyId={activeCompany.id}
          fiscalYearId={activeFiscalYear.id}
          currency={activeCompany.currency}
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSuccess={() => { setEditingEntry(null); refetch(); }}
        />
      )}
    </>
  );
}

// ── Ligne du tableau ──────────────────────────────────────────
function EntryRow({
  entry, currency, onValidate, onEdit, onDelete,
}: {
  entry:       any;
  currency:    string;
  onValidate:  () => void;
  onEdit:      () => void;
  onDelete:    () => void;
}) {
  const isUnbalanced = entry.status === 'brouillon' && (
    entry.lines?.length < 2 ||
    Math.abs(parseFloat(entry.total_debit) - parseFloat(entry.total_credit)) > 0.01
  );

  return (
    <tr className={cn(
      'hover:bg-surface-secondary/40 transition-colors group',
      isUnbalanced && 'bg-amber-50/60',
    )}>
      <td className="table-cell font-mono text-xs text-slate-500 whitespace-nowrap">
        {formatDate(entry.entry_date, true)}
      </td>
      <td className="table-cell text-xs text-slate-400 font-mono">
        {entry.reference ?? '—'}
      </td>
      <td className="table-cell font-medium text-brand-navy max-w-xs">
        <div>
          <span className="line-clamp-1 flex items-center gap-1.5">
            {entry.libelle}
            {isUnbalanced && (
              <span title="Écriture déséquilibrée — modifier ou supprimer">
                <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
              </span>
            )}
          </span>
          {entry.lines && entry.lines.length > 0 && (
            <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap gap-1">
              {entry.lines.slice(0, 3).map((line: any, i: number) => (
                <span key={i} className="font-mono">
                  {line.account?.code} {line.account?.label ? `- ${line.account.label.slice(0, 20)}` : ''}
                </span>
              ))}
              {entry.lines.length > 3 && <span>+{entry.lines.length - 3}</span>}
            </div>
          )}
        </div>
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
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={onValidate}
              title="Valider l'écriture"
              className="inline-flex items-center text-xs text-emerald-600
                         hover:text-emerald-700 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
            <button
              onClick={onEdit}
              title="Modifier l'écriture"
              className="inline-flex items-center text-xs text-slate-400
                         hover:text-blue-600 transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              title="Supprimer l'écriture"
              className="inline-flex items-center text-xs text-slate-300
                         hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

// ── Modal saisie / édition d'écriture ────────────────────────
function EntryModal({
  companyId, fiscalYearId, currency, entry, onClose, onSuccess,
}: {
  companyId:    string;
  fiscalYearId: string;
  currency:     string;
  entry?:       any;         // si défini → mode édition
  onClose:      () => void;
  onSuccess:    () => void;
}) {
  const isEdit = !!entry;
  const [saving, setSaving]     = useState(false);
  const [accountSuggestions, setAccountSuggestions] = useState<Account[]>([]);
  const [activeLineIndex, setActiveLineIndex]        = useState<number | null>(null);

  // Pré-remplir les affichages de comptes si mode édition
  const initialDisplays = isEdit
    ? (entry.lines ?? []).map((l: any) =>
        l.account ? `${l.account.code} — ${l.account.label}` : ''
      )
    : ['', ''];

  const [accountDisplays, setAccountDisplays] = useState<string[]>(initialDisplays);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Valeurs par défaut : création ou édition
  const defaultLines = isEdit
    ? (entry.lines ?? []).map((l: any) => ({
        account_id: l.account_id,
        libelle:    l.libelle ?? '',
        debit:      parseFloat(l.debit)  || (undefined as any),
        credit:     parseFloat(l.credit) || (undefined as any),
      }))
    : [
        { account_id: '', libelle: '', debit: undefined as any, credit: undefined as any },
        { account_id: '', libelle: '', debit: undefined as any, credit: undefined as any },
      ];

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<CreateEntryForm>({
      defaultValues: {
        fiscal_year_id: fiscalYearId,
        journal_type:   isEdit ? entry.journal_type : 'od',
        entry_date:     isEdit
          ? new Date(entry.entry_date).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        reference:      isEdit ? (entry.reference ?? '') : '',
        libelle:        isEdit ? entry.libelle : '',
        lines:          defaultLines,
      },
    });

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });
  const lines = watch('lines');

  const totalDebit  = lines.reduce((s, l) => s + (parseFloat(String(l.debit))  || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (parseFloat(String(l.credit)) || 0), 0);
  const isBalanced  = totalDebit > 0 && Math.abs(totalDebit - totalCredit) < 0.01;

  const searchAccounts = useCallback(async (q: string, lineIndex: number) => {
    setActiveLineIndex(lineIndex);
    if (q.length < 1) { setAccountSuggestions([]); return; }
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await accountsApi.search(companyId, q);
        setAccountSuggestions(res);
      } catch {}
    }, 200);
  }, [companyId]);

  const selectAccount = (acc: Account, lineIndex: number) => {
    setValue(`lines.${lineIndex}.account_id`, acc.id);
    const newDisplays = [...accountDisplays];
    while (newDisplays.length <= lineIndex) newDisplays.push('');
    newDisplays[lineIndex] = `${acc.code} — ${acc.label}`;
    setAccountDisplays(newDisplays);
    setAccountSuggestions([]);
    setActiveLineIndex(null);
  };

  const onSubmit = async (data: CreateEntryForm) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        lines: data.lines.map((l) => ({
          ...l,
          debit:  parseFloat(String(l.debit))  || 0,
          credit: parseFloat(String(l.credit)) || 0,
        })),
      };
      if (isEdit) {
        const result = await journalApi.updateEntry(companyId, entry.id, payload) as any;
        toast.success('Écriture mise à jour');
        if (result?.warnings?.length) {
          result.warnings.forEach((w: string) => toast.warning(w));
        }
      } else {
        const result = await journalApi.createEntry(companyId, payload) as any;
        toast.success('Écriture enregistrée en brouillon');
        if (result?.warnings?.length) {
          result.warnings.forEach((w: string) => toast.warning(w));
        }
      }
      onSuccess();
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleAddLine = () => {
    append({ account_id: '', libelle: '', debit: undefined as any, credit: undefined as any });
    setAccountDisplays([...accountDisplays, '']);
  };

  const handleRemoveLine = (index: number) => {
    remove(index);
    const newDisplays = [...accountDisplays];
    newDisplays.splice(index, 1);
    setAccountDisplays(newDisplays);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
         onClick={(e) => { if (e.target === e.currentTarget) setAccountSuggestions([]); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto animate-slide-up">

        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4
                        flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="font-bold text-brand-navy">
              {isEdit ? 'Modifier le brouillon' : 'Saisir une écriture'}
            </h2>
            <p className="text-xs text-slate-400">Partie double · Débit = Crédit</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center
                                               rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">

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

          <div>
            <label className="label">Libellé *</label>
            <input
              {...register('libelle', { required: 'Requis' })}
              placeholder="Description de l'opération"
              className="input"
            />
            {errors.libelle && <p className="text-red-500 text-xs mt-1">{errors.libelle.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Lignes d'écriture *</label>
              <button
                type="button"
                onClick={handleAddLine}
                className="text-xs text-brand-orange hover:text-brand-orange-400 font-medium
                           flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter une ligne
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-visible">
              <div className="grid gap-0 bg-surface-secondary px-3 py-2
                              text-xs font-semibold text-slate-500 uppercase tracking-wide
                              border-b border-slate-200"
                   style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr auto' }}>
                <div>Compte</div>
                <div>Libellé ligne</div>
                <div className="text-right text-blue-600">Débit</div>
                <div className="text-right text-emerald-600">Crédit</div>
                <div className="w-6"></div>
              </div>

              {fields.map((field, index) => (
                <div key={field.id}
                  className="grid gap-2 px-3 py-2 items-center
                             border-b border-slate-100 last:border-0 hover:bg-surface-secondary/30"
                  style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr auto' }}>

                  <div className="relative">
                    <input
                      value={accountDisplays[index] || ''}
                      placeholder="Tapez code ou libellé…"
                      className={cn(
                        "input text-xs py-1.5 w-full",
                        accountDisplays[index] && "font-mono text-brand-navy font-semibold"
                      )}
                      onChange={(e) => {
                        setValue(`lines.${index}.account_id`, '');
                        const newDisplays = [...accountDisplays];
                        newDisplays[index] = e.target.value;
                        setAccountDisplays(newDisplays);
                        searchAccounts(e.target.value, index);
                      }}
                      onFocus={() => {
                        if (accountDisplays[index]) {
                          const newDisplays = [...accountDisplays];
                          newDisplays[index] = '';
                          setAccountDisplays(newDisplays);
                          setValue(`lines.${index}.account_id`, '');
                        }
                        setActiveLineIndex(index);
                      }}
                      autoComplete="off"
                    />
                    {activeLineIndex === index && accountSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-0.5 bg-white
                                      border border-slate-200 rounded-xl shadow-lg z-50
                                      max-h-48 overflow-y-auto">
                        {accountSuggestions.map((acc) => (
                          <button
                            key={acc.id}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              selectAccount(acc, index);
                            }}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50
                                       flex items-center gap-2 transition-colors border-b
                                       border-slate-50 last:border-0"
                          >
                            <span className="font-mono font-bold text-brand-navy w-12 flex-shrink-0
                                             bg-slate-100 px-1.5 py-0.5 rounded text-xs">
                              {acc.code}
                            </span>
                            <span className="text-slate-600 line-clamp-1 flex-1">{acc.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {watch(`lines.${index}.account_id`) && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                    )}
                  </div>

                  <div>
                    <input
                      {...register(`lines.${index}.libelle`)}
                      placeholder="—"
                      className="input text-xs py-1.5 w-full"
                    />
                  </div>

                  <div>
                    <input
                      {...register(`lines.${index}.debit`, {
                        setValueAs: (v) => v === '' ? undefined : parseFloat(v) || 0
                      })}
                      type="number"
                      step="any"
                      min="0"
                      placeholder=""
                      className="input text-xs py-1.5 text-right font-mono text-blue-600 w-full"
                      onFocus={(e) => e.target.select()}
                    />
                  </div>

                  <div>
                    <input
                      {...register(`lines.${index}.credit`, {
                        setValueAs: (v) => v === '' ? undefined : parseFloat(v) || 0
                      })}
                      type="number"
                      step="any"
                      min="0"
                      placeholder=""
                      className="input text-xs py-1.5 text-right font-mono text-emerald-600 w-full"
                      onFocus={(e) => e.target.select()}
                    />
                  </div>

                  <div className="flex justify-end">
                    {fields.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(index)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg
                                   hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="grid gap-2 px-3 py-2.5 bg-surface-secondary border-t border-slate-200"
                   style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr auto' }}>
                <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase
                                tracking-wide flex items-center gap-2">
                  Total
                  {isBalanced
                    ? <span className="text-emerald-600 text-xs font-normal flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Équilibré
                      </span>
                    : totalDebit > 0 && <span className="text-red-500 text-xs font-normal flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Écart : {Math.abs(totalDebit - totalCredit).toLocaleString('fr-FR', { maximumFractionDigits: 2 })}
                      </span>
                  }
                </div>
                <div className="text-right font-mono font-bold text-blue-600 text-xs">
                  {totalDebit > 0 ? totalDebit.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '—'}
                </div>
                <div className="text-right font-mono font-bold text-emerald-600 text-xs">
                  {totalCredit > 0 ? totalCredit.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '—'}
                </div>
                <div className="w-6"></div>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Tapez le code ou le nom du compte, puis cliquez sur la suggestion pour le sélectionner.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 justify-center"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {saving ? 'Enregistrement…' : isEdit ? 'Enregistrer les modifications' : 'Enregistrer en brouillon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
