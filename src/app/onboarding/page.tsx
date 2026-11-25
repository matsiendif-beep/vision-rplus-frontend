'use client';
// ============================================================
//  VISION R+ — Assistant de démarrage (onboarding 5 étapes)
//  1. Bienvenue  2. Référentiel  3. Entreprise  4. Démo  5. Premiers pas
// ============================================================
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, Check, Loader2, Sparkles, Building2,
  FileSpreadsheet, PenLine, Scale, BookOpen, PlayCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { companiesApi, extractApiError } from '@/lib/api/client';
import { useAuthStore, useCompanyStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { AccountingSystem, Company, Currency } from '@/types';

const STEPS = ['Bienvenue', 'Référentiel', 'Entreprise', 'Démo', 'Premiers pas'];

const SYSTEMS: { value: AccountingSystem; title: string; desc: string; currency: Currency; country: string }[] = [
  { value: 'ohada',      title: 'SYSCOHADA',  desc: 'Gabon, Cameroun, Côte d\'Ivoire, Sénégal… (17 pays OHADA)', currency: 'XAF', country: 'Gabon' },
  { value: 'pcg_france', title: 'PCG France', desc: 'Plan Comptable Général — entreprises françaises',             currency: 'EUR', country: 'France' },
];

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: 'XAF', label: 'Franc CFA BEAC (XAF)' },
  { value: 'XOF', label: 'Franc CFA BCEAO (XOF)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'USD', label: 'Dollar (USD)' },
];

const year = new Date().getFullYear();

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { setActiveCompany } = useCompanyStore();

  const [hydrated, setHydrated] = useState(false);
  const [step, setStep]         = useState(0);
  const [busy, setBusy]         = useState(false);

  // Étape 2
  const [system, setSystem]     = useState<AccountingSystem>('ohada');
  const [currency, setCurrency] = useState<Currency>('XAF');
  const [country, setCountry]   = useState('Gabon');
  // Étape 3
  const [name, setName]         = useState('');
  const [legalForm, setLegalForm] = useState('');
  const [fyStart, setFyStart]   = useState(`${year}-01-01`);
  const [fyEnd, setFyEnd]       = useState(`${year}-12-31`);
  const [company, setCompany]   = useState<Company | null>(null);
  // Étape 4
  const [demo, setDemo]         = useState<Company | null>(null);

  useEffect(() => { setHydrated(true); }, []);
  useEffect(() => {
    if (hydrated && !isAuthenticated) router.push('/auth/login');
  }, [hydrated, isAuthenticated, router]);

  // Reprendre une entreprise déjà créée (utilisateur qui relance l'assistant)
  useEffect(() => {
    if (!hydrated || !isAuthenticated) return;
    companiesApi.list().then((r) => {
      const real = r.owned.find((c) => !c.is_demo);
      const d    = r.owned.find((c) => c.is_demo);
      if (real) setCompany(real);
      if (d)    setDemo(d);
    }).catch(() => { /* silencieux : l'assistant reste utilisable */ });
  }, [hydrated, isAuthenticated]);

  if (!hydrated || !isAuthenticated) return null;

  const pickSystem = (s: typeof SYSTEMS[number]) => {
    setSystem(s.value);
    setCurrency(s.currency);
    setCountry(s.country);
  };

  // Active l'entreprise avec ses exercices (pour sélectionner l'exercice en cours)
  const activate = async (c: Company) => {
    try { setActiveCompany(await companiesApi.get(c.id)); }
    catch { setActiveCompany(c); }
  };

  const createCompany = async () => {
    if (company) { setStep(3); return; }
    if (name.trim().length < 2) { toast.error('Indiquez le nom de votre entreprise'); return; }
    if (fyEnd <= fyStart)       { toast.error('La fin d\'exercice doit être après le début'); return; }
    setBusy(true);
    try {
      const created = await companiesApi.create({
        name: name.trim(),
        legal_form: legalForm || undefined,
        accounting_system: system,
        currency,
        country,
        fiscal_year_start: fyStart,
        fiscal_year_end:   fyEnd,
      });
      setCompany(created);
      await activate(created);
      toast.success(`Entreprise « ${created.name} » créée !`);
      setStep(3);
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setBusy(false);
    }
  };

  const createDemo = async () => {
    setBusy(true);
    try {
      const d = await companiesApi.createDemo();
      setDemo(d);
      toast.success('Entreprise de démonstration prête');
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setBusy(false);
    }
  };

  const goTo = async (path: string, target: Company | null) => {
    if (target) await activate(target);
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-surface-secondary flex flex-col items-center px-4 py-8 sm:py-12">
      {/* ── En-tête ──────────────────────────────────────── */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-brand-navy rounded-xl flex items-center justify-center">
            <span className="text-sm font-black text-white tracking-tighter">R+</span>
          </div>
          <span className="font-bold text-brand-navy">Vision R+</span>
        </div>
        <button onClick={() => router.push('/dashboard')} className="text-xs text-slate-400 hover:text-brand-navy">
          Passer l&apos;assistant
        </button>
      </div>

      {/* ── Progression ──────────────────────────────────── */}
      <ol className="w-full max-w-2xl flex items-center gap-1.5 mb-6" aria-label="Progression">
        {STEPS.map((label, i) => (
          <li key={label} className="flex-1">
            <div className={cn('h-1.5 rounded-full transition-colors',
              i <= step ? 'bg-brand-orange' : 'bg-slate-200')} />
            <span className={cn('hidden sm:block mt-1.5 text-[11px] font-medium',
              i === step ? 'text-brand-navy' : 'text-slate-400')}>
              {i + 1}. {label}
            </span>
          </li>
        ))}
      </ol>

      <div className="card w-full max-w-2xl p-6 sm:p-8 animate-fade-in">
        {/* ── 1. Bienvenue ─────────────────────────────── */}
        {step === 0 && (
          <div>
            <Sparkles className="w-8 h-8 text-brand-orange mb-3" />
            <h1 className="text-2xl font-bold text-brand-navy mb-2">
              Bienvenue{user?.first_name ? `, ${user.first_name}` : ''} 👋
            </h1>
            <p className="text-slate-500 mb-6">
              En 5 minutes, vous allez obtenir votre premier tableau de bord comptable.
              Voici ce que nous allons faire ensemble :
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Choisir votre référentiel comptable (OHADA ou PCG France)',
                'Créer le dossier de votre entreprise',
                'Explorer une entreprise de démonstration avec un vrai bilan',
                'Importer votre journal Excel ou saisir votre première écriture',
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-brand-navy">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-brand-orange-100 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-brand-orange" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <button onClick={() => setStep(company ? 3 : 1)} className="btn-orange">
              C&apos;est parti <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── 2. Référentiel ───────────────────────────── */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-brand-navy mb-1">Quel référentiel comptable utilisez-vous ?</h2>
            <p className="text-slate-500 text-sm mb-6">Le plan comptable et les états financiers seront adaptés automatiquement.</p>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {SYSTEMS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => pickSystem(s)}
                  className={cn('text-left p-4 rounded-xl border-2 transition-colors',
                    system === s.value ? 'border-brand-orange bg-brand-orange-100' : 'border-slate-200 hover:border-slate-300')}
                >
                  <p className="font-bold text-brand-navy">{s.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{s.desc}</p>
                </button>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div>
                <label className="label" htmlFor="ob-country">Pays</label>
                <input id="ob-country" className="input" value={country} onChange={(e) => setCountry(e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="ob-currency">Devise</label>
                <select id="ob-currency" className="input" value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
                  {CURRENCIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <Nav onBack={() => setStep(0)} onNext={() => setStep(2)} />
          </div>
        )}

        {/* ── 3. Entreprise ────────────────────────────── */}
        {step === 2 && (
          <div>
            <Building2 className="w-7 h-7 text-brand-orange mb-3" />
            <h2 className="text-xl font-bold text-brand-navy mb-1">Votre entreprise</h2>
            <p className="text-slate-500 text-sm mb-6">Vous pourrez compléter les informations (RCCM, NIF, adresse…) plus tard.</p>
            {company ? (
              <p className="text-sm text-brand-navy bg-slate-50 rounded-xl p-4 mb-8">
                Votre entreprise <b>{company.name}</b> est déjà créée. Passons à la suite.
              </p>
            ) : (
              <div className="space-y-4 mb-8">
                <div>
                  <label className="label" htmlFor="ob-name">Nom de l&apos;entreprise *</label>
                  <input id="ob-name" className="input" autoFocus value={name}
                         onChange={(e) => setName(e.target.value)} placeholder="Ex. Établissements Nguema" />
                </div>
                <div>
                  <label className="label" htmlFor="ob-legal">Forme juridique</label>
                  <select id="ob-legal" className="input" value={legalForm} onChange={(e) => setLegalForm(e.target.value)}>
                    <option value="">— Choisir —</option>
                    {['Entreprise individuelle', 'SARL', 'SARLU', 'SA', 'SAS', 'SASU', 'GIE', 'Association'].map((f) =>
                      <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label" htmlFor="ob-start">Début d&apos;exercice</label>
                    <input id="ob-start" type="date" className="input" value={fyStart} onChange={(e) => setFyStart(e.target.value)} />
                  </div>
                  <div>
                    <label className="label" htmlFor="ob-end">Fin d&apos;exercice</label>
                    <input id="ob-end" type="date" className="input" value={fyEnd} onChange={(e) => setFyEnd(e.target.value)} />
                  </div>
                </div>
              </div>
            )}
            <Nav onBack={() => setStep(1)} onNext={createCompany} busy={busy}
                 nextLabel={company ? 'Continuer' : 'Créer mon entreprise'} />
          </div>
        )}

        {/* ── 4. Démo ──────────────────────────────────── */}
        {step === 3 && (
          <div>
            <PlayCircle className="w-7 h-7 text-brand-orange mb-3" />
            <h2 className="text-xl font-bold text-brand-navy mb-1">Voyez le résultat avant de saisir</h2>
            <p className="text-slate-500 text-sm mb-6">
              Nous pouvons créer <b>Boutique Akanda SARL</b>, une PME fictive de Libreville avec une année
              d&apos;écritures SYSCOHADA. Vous verrez immédiatement un bilan, un compte de résultat et les
              indicateurs du tableau de bord. Elle ne compte pas dans la limite de votre formule et
              vous pouvez la supprimer à tout moment.
            </p>
            {demo ? (
              <p className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-xl p-4 mb-8">
                <Check className="w-4 h-4" /> L&apos;entreprise de démonstration est prête.
              </p>
            ) : (
              <button onClick={createDemo} disabled={busy} className="btn-primary mb-8">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {busy ? 'Préparation des écritures…' : 'Créer l\'entreprise de démonstration'}
              </button>
            )}
            <Nav onBack={() => setStep(company ? 0 : 2)} onNext={() => setStep(4)}
                 nextLabel={demo ? 'Continuer' : 'Passer cette étape'} />
          </div>
        )}

        {/* ── 5. Premiers pas ──────────────────────────── */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold text-brand-navy mb-1">Tout est prêt ! Par quoi commencer ?</h2>
            <p className="text-slate-500 text-sm mb-6">Choisissez une action. Vous retrouverez tout dans le menu latéral.</p>
            {user?.plan === 'free' && (
              <p className="text-xs text-slate-500 bg-slate-50 rounded-xl p-3 mb-4">
                Plan Gratuit : toutes les fonctions, 10 écritures par mois. Pour importer un journal complet,
                le plan Pro offre des écritures illimitées (14 jours d&apos;essai gratuit).
              </p>
            )}
            <div className="grid sm:grid-cols-2 gap-3 mb-8">
              <Action icon={FileSpreadsheet} title="Importer mon journal Excel"
                      desc="Depuis Excel : Fichier → Enregistrer sous → CSV"
                      disabled={!company} onClick={() => goTo('/journal', company)} />
              <Action icon={PenLine} title="Saisir une écriture"
                      desc="Achat, vente, banque, caisse…"
                      disabled={!company} onClick={() => goTo('/journal', company)} />
              <Action icon={Scale} title="Voir le bilan de la démo"
                      desc="Bilan SYSCOHADA généré automatiquement"
                      disabled={!demo} onClick={() => goTo('/balance-sheet', demo)} />
              <Action icon={BookOpen} title="Lire le guide pas à pas"
                      desc="Toutes les fonctionnalités expliquées"
                      onClick={() => router.push('/guide')} />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => goTo('/dashboard', company ?? demo)} className="btn-orange">
                Aller au tableau de bord <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => setStep(3)} className="btn-secondary">
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 mt-6 text-center max-w-md">
        Besoin d&apos;aide ? Répondez à notre email de bienvenue : le fondateur vous répond personnellement.
      </p>
    </div>
  );
}

function Nav({ onBack, onNext, busy, nextLabel = 'Continuer' }: {
  onBack: () => void; onNext: () => void; busy?: boolean; nextLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <button type="button" onClick={onBack} className="btn-secondary">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>
      <button type="button" onClick={onNext} disabled={busy} className="btn-orange">
        {busy && <Loader2 className="w-4 h-4 animate-spin" />}
        {nextLabel} {!busy && <ArrowRight className="w-4 h-4" />}
      </button>
    </div>
  );
}

function Action({ icon: Icon, title, desc, onClick, disabled }: {
  icon: React.ElementType; title: string; desc: string; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="text-left p-4 rounded-xl border border-slate-200 hover:border-brand-orange
                 hover:bg-brand-orange-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Icon className="w-5 h-5 text-brand-orange mb-2" />
      <p className="font-semibold text-sm text-brand-navy">{title}</p>
      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
    </button>
  );
}
