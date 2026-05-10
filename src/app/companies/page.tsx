'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm }   from 'react-hook-form';
import {
  Plus, Building2, ChevronRight, Globe2,
  Landmark, X, Loader2, Check, Trash2, AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import Header     from '@/components/layout/Header';
import { Card, EmptyState, Spinner, ErrorMessage, Badge } from '@/components/ui';
import { companiesApi, extractApiError } from '@/lib/api/client';
import { useCompanies }     from '@/lib/hooks';
import { useCompanyStore, useAuthStore }  from '@/lib/store';
import { cn, formatDate, SYSTEM_LABELS } from '@/lib/utils';
import type { Company, AccountingSystem, Currency } from '@/types';

const PLAN_LIMITS: Record<string, number> = { free: 1, pro: 3, cabinet: Infinity };
const PLAN_LABELS: Record<string, string> = { free: 'Gratuit', pro: 'Pro', cabinet: 'Cabinet' };

const SYSTEM_OPTIONS: { value: AccountingSystem; label: string; desc: string }[] = [
  { value: 'pcg_france', label: 'PCG France',  desc: 'Plan Comptable Général — entreprises françaises' },
  { value: 'ohada',      label: 'OHADA',       desc: 'SYSCOHADA révisé — 17 pays membres' },
];

const CURRENCIES: { value: Currency; label: string; flag: string }[] = [
  { value: 'EUR', label: 'Euro (€)',         flag: '🇪🇺' },
  { value: 'XAF', label: 'Franc CFA BEAC',   flag: '🌍' },
  { value: 'XOF', label: 'Franc CFA BCEAO',  flag: '🌍' },
  { value: 'USD', label: 'Dollar ($)',        flag: '🇺🇸' },
  { value: 'GBP', label: 'Livre sterling',   flag: '🇬🇧' },
];

interface CreateForm {
  name:               string;
  accounting_system:  AccountingSystem;
  currency:           Currency;
  legal_form?:        string;
  country?:           string;
  fiscal_year_start:  string;
  fiscal_year_end:    string;
}

export default function CompaniesPage() {
  const router                    = useRouter();
  const { data, loading, error, refetch } = useCompanies();
  const { setActiveCompany, activeCompany } = useCompanyStore();
  const { user }                  = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Company | null>(null);

  const plan      = user?.plan ?? 'free';
  const limit     = PLAN_LIMITS[plan] ?? 1;
  const ownedCount = data?.owned?.length ?? 0;
  const canCreate = ownedCount < limit;

  const onDelete = async (company: Company) => {
    setDeletingId(company.id);
    try {
      await companiesApi.remove(company.id);
      toast.success(`Entreprise "${company.name}" supprimée`);
      if (activeCompany?.id === company.id) {
        const next = [...(data?.owned ?? []), ...(data?.shared ?? [])].find(c => c.id !== company.id);
        if (next) setActiveCompany(next);
      }
      refetch();
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } =
    useForm<CreateForm>({
      defaultValues: {
        accounting_system: 'pcg_france',
        currency:          'EUR',
        country:           'France',
        fiscal_year_start: `${new Date().getFullYear()}-01-01`,
        fiscal_year_end:   `${new Date().getFullYear()}-12-31`,
      },
    });

  const selectedSystem = watch('accounting_system');

  const onCreate = async (data: CreateForm) => {
    setSaving(true);
    try {
      const company = await companiesApi.create(data);
      toast.success(`Entreprise "${company.name}" créée !`);
      reset();
      setShowModal(false);
      refetch();
      setActiveCompany(company);
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const allCompanies = [...(data?.owned ?? []), ...(data?.shared ?? [])];

  return (
    <>
    <div className="flex-1 min-w-0 flex flex-col">
        <Header
          title="Entreprises"
          subtitle={
            limit === Infinity
              ? 'Gérez vos dossiers comptables'
              : `${ownedCount} / ${limit} entreprise${limit > 1 ? 's' : ''} — Plan ${PLAN_LABELS[plan]}`
          }
          actions={
            <button
              onClick={() => canCreate ? setShowModal(true) : toast.error(`Votre plan ${PLAN_LABELS[plan]} est limité à ${limit} entreprise(s). Passez au plan supérieur.`)}
              className={cn('btn-orange', !canCreate && 'opacity-60 cursor-not-allowed')}
            >
              <Plus className="w-4 h-4" /> Nouvelle entreprise
            </button>
          }
        />

        <div className="flex-1 p-6 animate-fade-in">
          {error && <ErrorMessage message={error} />}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : allCompanies.length === 0 ? (
            <Card className="p-8">
              <EmptyState
                icon={Building2}
                title="Aucune entreprise"
                description="Créez votre premier dossier comptable pour commencer la saisie."
                action={
                  <button onClick={() => setShowModal(true)} className="btn-orange">
                    <Plus className="w-4 h-4" /> Créer une entreprise
                  </button>
                }
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {allCompanies.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  isActive={activeCompany?.id === company.id}
                  isOwned={company.owner_id === user?.id}
                  isDeleting={deletingId === company.id}
                  onSelect={() => {
                    setActiveCompany(company);
                    router.push('/dashboard');
                  }}
                  onDelete={() => setConfirmDelete(company)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Modal confirmation suppression ────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-brand-navy">Supprimer l'entreprise</h3>
                <p className="text-xs text-slate-400">Cette action est irréversible</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-5">
              Voulez-vous vraiment supprimer <strong>{confirmDelete.name}</strong> ?
              Toutes les données comptables seront désactivées.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="btn-secondary flex-1 justify-center"
              >
                Annuler
              </button>
              <button
                onClick={() => onDelete(confirmDelete)}
                disabled={!!deletingId}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl
                           bg-red-500 hover:bg-red-600 text-white text-sm font-semibold
                           transition-colors disabled:opacity-60"
              >
                {deletingId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal création ────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50
                        flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh]
                          overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4
                            flex items-center justify-between rounded-t-2xl z-10">
              <div>
                <h2 className="font-bold text-brand-navy">Nouvelle entreprise</h2>
                <p className="text-xs text-slate-400 mt-0.5">Créer un dossier comptable</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg
                           hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onCreate)} className="p-6 space-y-5">

              {/* Nom */}
              <div>
                <label className="label">Nom de l'entreprise *</label>
                <input
                  {...register('name', { required: 'Requis' })}
                  placeholder="Vision R+ Consulting"
                  className="input"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              {/* Système comptable */}
              <div>
                <label className="label">Système comptable *</label>
                <div className="grid grid-cols-2 gap-3">
                  {SYSTEM_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setValue('accounting_system', opt.value)}
                      className={cn(
                        'p-3 rounded-xl border text-left transition-all duration-150',
                        selectedSystem === opt.value
                          ? 'border-brand-orange bg-brand-orange/5 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300',
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-brand-navy">{opt.label}</span>
                        {selectedSystem === opt.value && (
                          <div className="w-5 h-5 bg-brand-orange rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-tight">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Devise */}
                <div>
                  <label className="label">Devise</label>
                  <select {...register('currency')} className="input">
                    {CURRENCIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.flag} {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Forme juridique */}
                <div>
                  <label className="label">Forme juridique</label>
                  <input
                    {...register('legal_form')}
                    placeholder="SAS, SARL, Auto-entrepreneur…"
                    className="input"
                  />
                </div>
              </div>

              {/* Pays */}
              <div>
                <label className="label">Pays</label>
                <input {...register('country')} placeholder="France" className="input" />
              </div>

              {/* Exercice fiscal */}
              <div>
                <label className="label">Exercice fiscal</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Début</p>
                    <input {...register('fiscal_year_start')} type="date" className="input" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Fin</p>
                    <input {...register('fiscal_year_end')} type="date" className="input" />
                  </div>
                </div>
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1 justify-center"
                >
                  Annuler
                </button>
                <button type="submit" disabled={saving} className="btn-orange flex-1 justify-center">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {saving ? 'Création…' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function CompanyCard({
  company, isActive, isOwned, isDeleting, onSelect, onDelete,
}: {
  company: Company;
  isActive: boolean;
  isOwned: boolean;
  isDeleting: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        'card p-5 transition-all duration-200',
        isActive && 'ring-2 ring-brand-orange/40 border-brand-orange/30',
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          onClick={onSelect}
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer',
            isActive ? 'bg-brand-orange/15' : 'bg-surface-tertiary',
          )}
        >
          <Landmark className={cn('w-5 h-5', isActive ? 'text-brand-orange' : 'text-slate-400')} />
        </div>
        <div className="flex items-center gap-2">
          {isActive && <Badge variant="orange" className="text-[10px]">Active</Badge>}
          {isOwned && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              disabled={isDeleting}
              title="Supprimer l'entreprise"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300
                         hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              {isDeleting
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Trash2 className="w-3.5 h-3.5" />
              }
            </button>
          )}
          <ChevronRight onClick={onSelect} className="w-4 h-4 text-slate-300 cursor-pointer" />
        </div>
      </div>

      <div onClick={onSelect} className="cursor-pointer">
        <h3 className="font-bold text-brand-navy text-sm mb-0.5 line-clamp-1">{company.name}</h3>
        {company.legal_form && (
          <p className="text-xs text-slate-400 mb-3">{company.legal_form}</p>
        )}

        <div className="flex items-center gap-2 flex-wrap mt-2">
          <Badge variant={company.accounting_system === 'ohada' ? 'blue' : 'default'}>
            {SYSTEM_LABELS[company.accounting_system]}
          </Badge>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Globe2 className="w-3 h-3" />{company.country}
          </span>
          <span className="text-xs text-slate-400 font-mono">{company.currency}</span>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-50 text-xs text-slate-400 flex items-center justify-between">
          <span>Créé le {formatDate(company.created_at, true)}</span>
          {!isOwned && <Badge variant="default" className="text-[10px]">Partagée</Badge>}
        </div>
      </div>
    </div>
  );
}
