'use client';
// ============================================================
//  VISION R+ — Plan comptable
//  Consultation du plan officiel (PCG 2026 ou SYSCOHADA révisé)
//  et création de sous-comptes qui héritent de la classe du parent :
//  classes 1 à 5 → bilan ; classes 6 à 8 → compte de résultat.
// ============================================================
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Search, Loader2, Pencil, Trash2, X, Info, ListTree } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import { Spinner, ErrorMessage, Badge } from '@/components/ui';
import { accountsApi, extractApiError } from '@/lib/api/client';
import { useCompanyStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { Account, AccountingSystem } from '@/types';

const CLASSES: Record<AccountingSystem, Record<string, string>> = {
  ohada: {
    '1': 'Ressources durables', '2': 'Actif immobilisé', '3': 'Stocks', '4': 'Tiers', '5': 'Trésorerie',
    '6': 'Charges des activités ordinaires', '7': 'Produits des activités ordinaires',
    '8': 'Autres charges et autres produits (HAO)', '9': 'Engagements hors bilan et analytique',
  },
  pcg_france: {
    '1': 'Comptes de capitaux', '2': 'Comptes d\'immobilisations', '3': 'Comptes de stocks et en-cours',
    '4': 'Comptes de tiers', '5': 'Comptes financiers', '6': 'Comptes de charges', '7': 'Comptes de produits',
  },
};

/** Place d'un compte dans les états (règle du plan : 1-5 bilan, 6-8 résultat). */
const destination = (code: string) =>
  code[0] >= '1' && code[0] <= '5' ? 'Bilan' : code[0] >= '6' && code[0] <= '8' ? 'Compte de résultat' : 'Hors bilan / analytique';

const LEGACY = '(ancien libellé';

export default function PlanComptablePage() {
  const { activeCompany } = useCompanyStore();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [system, setSystem]     = useState<AccountingSystem>('ohada');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState('');
  const [cls, setCls]           = useState<string>('');
  const [onlyCustom, setOnlyCustom] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing]   = useState<Account | null>(null);

  const load = useCallback(async () => {
    if (!activeCompany) return;
    setLoading(true); setError(null);
    try {
      const res = await accountsApi.list(activeCompany.id);
      setAccounts(res.accounts);
      setSystem(res.system ?? activeCompany.accounting_system);
    } catch (e) {
      setError(extractApiError(e));
    } finally {
      setLoading(false);
    }
  }, [activeCompany]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return accounts.filter((a) =>
      (!cls || a.code[0] === cls) &&
      (!onlyCustom || a.is_custom) &&
      (!q || a.code.startsWith(q) || a.label.toLowerCase().includes(q)));
  }, [accounts, search, cls, onlyCustom]);

  const byClass = useMemo(() => {
    const g: Record<string, Account[]> = {};
    for (const a of filtered) (g[a.code[0]] ??= []).push(a);
    return g;
  }, [filtered]);

  const customCount = accounts.filter((a) => a.is_custom).length;
  const classNames = CLASSES[system];

  const remove = async (a: Account) => {
    if (!activeCompany || !confirm(`Supprimer le sous-compte ${a.code} — ${a.label} ?`)) return;
    try {
      await accountsApi.remove(activeCompany.id, a.id);
      toast.success(`Sous-compte ${a.code} supprimé`);
      load();
    } catch (e) {
      toast.error(extractApiError(e));
    }
  };

  if (!activeCompany) {
    return (
      <div className="flex flex-col">
        <Header title="Plan comptable" />
        <p className="p-8 text-sm text-slate-400">Sélectionnez une entreprise pour afficher son plan comptable.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <Header
        title="Plan comptable"
        subtitle={`${system === 'ohada' ? 'SYSCOHADA révisé' : 'Plan comptable général (PCG 2026)'} · ${accounts.length} comptes${customCount ? ` dont ${customCount} sous-compte${customCount > 1 ? 's' : ''}` : ''}`}
        actions={
          <button onClick={() => setCreating(true)} className="btn-orange">
            <Plus className="w-4 h-4" /> Nouveau sous-compte
          </button>
        }
      />

      <div className="flex-1 p-6 space-y-4 animate-fade-in">
        {error && <ErrorMessage message={error} />}

        <div className="card p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
                   placeholder="Rechercher un numéro (ex. 601) ou un libellé…" className="input pl-9" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setCls('')} className={cn('px-2.5 py-1.5 rounded-lg text-xs font-medium', !cls ? 'bg-brand-navy text-white' : 'bg-slate-100 text-slate-600')}>Toutes</button>
            {Object.keys(classNames).map((c) => (
              <button key={c} onClick={() => setCls(c)} title={classNames[c]}
                      className={cn('px-2.5 py-1.5 rounded-lg text-xs font-medium', cls === c ? 'bg-brand-navy text-white' : 'bg-slate-100 text-slate-600')}>
                Classe {c}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
            <input type="checkbox" checked={onlyCustom} onChange={(e) => setOnlyCustom(e.target.checked)} className="accent-brand-orange" />
            Mes sous-comptes uniquement
          </label>
        </div>

        <div className="flex items-start gap-2 text-xs text-slate-500 bg-blue-50/60 border border-blue-100 rounded-xl p-3">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <span>
            Les comptes des classes 1 à 5 alimentent le <b>bilan</b>, ceux des classes 6 à {system === 'ohada' ? '8' : '7'} le{' '}
            <b>compte de résultat</b>. Un sous-compte prolonge un compte existant (ex. 6011 → 60111) et reste automatiquement
            dans la même rubrique. Les comptes du plan officiel ne sont pas modifiables.
          </span>
        </div>

        {loading && <div className="flex justify-center py-16"><Spinner size="lg" /></div>}

        {!loading && filtered.length === 0 && (
          <div className="card p-10 text-center text-sm text-slate-400">
            <ListTree className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            Aucun compte ne correspond à votre recherche.
          </div>
        )}

        {!loading && Object.keys(byClass).sort().map((c) => (
          <section key={c} className="card overflow-hidden">
            <header className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-brand-navy">Classe {c} — {classNames[c] ?? ''}</h2>
              <span className="text-xs text-slate-400">{destination(c)} · {byClass[c].length} compte{byClass[c].length > 1 ? 's' : ''}</span>
            </header>
            <ul className="divide-y divide-slate-50">
              {byClass[c].map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50/60">
                  <span className={cn('font-mono text-brand-navy shrink-0', !a.is_detail && 'font-bold')}
                        style={{ paddingLeft: `${Math.max(0, a.code.length - 2) * 10}px`, minWidth: 110 }}>
                    {a.code}
                  </span>
                  <span className={cn('flex-1 min-w-0', !a.is_detail ? 'font-semibold text-brand-navy' : 'text-slate-600')}>
                    {a.label}
                  </span>
                  {a.is_custom && <Badge variant="orange" className="text-[10px]">Sous-compte</Badge>}
                  {a.label.includes(LEGACY) && <Badge variant="amber" className="text-[10px]" >À vérifier</Badge>}
                  {!a.is_detail && <Badge variant="default" className="text-[10px]">Regroupement</Badge>}
                  {a.is_custom && (
                    <span className="flex items-center gap-1">
                      <button onClick={() => setEditing(a)} title="Modifier le libellé" className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-brand-navy">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => remove(a)} title="Supprimer" className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {creating && (
        <SubAccountModal
          companyId={activeCompany.id}
          accounts={accounts}
          system={system}
          onClose={() => setCreating(false)}
          onCreated={() => { setCreating(false); load(); }}
        />
      )}
      {editing && (
        <EditLabelModal
          companyId={activeCompany.id}
          account={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

// ── Création d'un sous-compte ────────────────────────────────
function SubAccountModal({ companyId, accounts, system, onClose, onCreated }: {
  companyId: string; accounts: Account[]; system: AccountingSystem; onClose: () => void; onCreated: () => void;
}) {
  const [parentQuery, setParentQuery] = useState('');
  const [parent, setParent] = useState<Account | null>(null);
  const [code, setCode]     = useState('');
  const [label, setLabel]   = useState('');
  const [saving, setSaving] = useState(false);

  const suggestions = useMemo(() => {
    const q = parentQuery.trim().toLowerCase();
    if (!q) return [];
    return accounts
      .filter((a) => !a.label.includes(LEGACY) && (a.code.startsWith(q) || a.label.toLowerCase().includes(q)))
      .slice(0, 12);
  }, [accounts, parentQuery]);

  const pick = (a: Account) => {
    setParent(a);
    setParentQuery('');
    setCode(a.code);
  };

  const codeOk = !!parent && /^\d{3,10}$/.test(code) && code.startsWith(parent.code) && code.length > parent.code.length;
  const exists = accounts.some((a) => a.code === code);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeOk || exists || label.trim().length < 2) return;
    setSaving(true);
    try {
      await accountsApi.create(companyId, { code, label: label.trim() });
      toast.success(`Sous-compte ${code} créé`);
      onCreated();
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="card w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-brand-navy">Nouveau sous-compte</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-brand-navy"><X className="w-5 h-5" /></button>
        </div>

        <label className="label">1. Compte à détailler</label>
        {parent ? (
          <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2.5 mb-4 text-sm">
            <span><b className="font-mono">{parent.code}</b> — {parent.label}</span>
            <button type="button" onClick={() => { setParent(null); setCode(''); }} className="text-xs text-brand-orange">Changer</button>
          </div>
        ) : (
          <div className="relative mb-4">
            <input autoFocus value={parentQuery} onChange={(e) => setParentQuery(e.target.value)}
                   placeholder={system === 'ohada' ? 'Ex. 6011 ou « achats de marchandises »' : 'Ex. 607 ou « achats de marchandises »'}
                   className="input" />
            {suggestions.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-auto">
                {suggestions.map((a) => (
                  <li key={a.id}>
                    <button type="button" onClick={() => pick(a)} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50">
                      <b className="font-mono">{a.code}</b> — {a.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-2">
          <div>
            <label className="label" htmlFor="sc-code">2. Numéro</label>
            <input id="sc-code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 10))}
                   disabled={!parent} className="input font-mono" inputMode="numeric" />
          </div>
          <div className="col-span-2">
            <label className="label" htmlFor="sc-label">3. Libellé</label>
            <input id="sc-label" value={label} onChange={(e) => setLabel(e.target.value)} disabled={!parent}
                   placeholder="Ex. Achats de marchandises — Fournisseur Dupont" className="input" maxLength={255} />
          </div>
        </div>

        {parent && (
          <p className={cn('text-xs mb-5', codeOk && !exists ? 'text-slate-500' : 'text-amber-700')}>
            {!code.startsWith(parent.code) || code.length <= parent.code.length
              ? `Le numéro doit commencer par ${parent.code} et comporter au moins un chiffre de plus (ex. ${parent.code}1).`
              : exists
                ? `Le compte ${code} existe déjà.`
                : `Classe ${code[0]} → ${destination(code)}, même rubrique que le compte ${parent.code}.`}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
          <button type="submit" disabled={!codeOk || exists || label.trim().length < 2 || saving} className="btn-orange">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Créer le sous-compte
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Modification du libellé d'un sous-compte ─────────────────
function EditLabelModal({ companyId, account, onClose, onSaved }: {
  companyId: string; account: Account; onClose: () => void; onSaved: () => void;
}) {
  const [label, setLabel]   = useState(account.label);
  const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await accountsApi.update(companyId, account.id, { label: label.trim() });
      toast.success('Libellé mis à jour');
      onSaved();
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="card w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-brand-navy mb-1">Modifier le libellé</h2>
        <p className="text-xs text-slate-500 mb-4">Compte <b className="font-mono">{account.code}</b> — le numéro ne peut pas changer (il fixe la place du compte dans les états).</p>
        <input autoFocus value={label} onChange={(e) => setLabel(e.target.value)} className="input mb-5" maxLength={255} />
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
          <button type="submit" disabled={label.trim().length < 2 || saving} className="btn-orange">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}
