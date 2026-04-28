'use client';
import { useState } from 'react';
import { useForm }  from 'react-hook-form';
import { Save, Loader2, Globe2, Bell, Shield, User } from 'lucide-react';
import { toast } from 'sonner';
import Header  from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardHeader, Badge } from '@/components/ui';
import { companiesApi, extractApiError } from '@/lib/api/client';
import { useCompanyStore, useAuthStore }  from '@/lib/store';
import { cn, SYSTEM_LABELS, PLAN_LABELS } from '@/lib/utils';
import type { AccountingSystem, Currency } from '@/types';

const SECTIONS = [
  { id: 'company',  label: 'Entreprise active',   icon: Globe2 },
  { id: 'profile',  label: 'Profil utilisateur',  icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Sécurité',            icon: Shield },
];

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: 'EUR', label: '€ Euro' },
  { value: 'XAF', label: 'XAF Franc CFA BEAC' },
  { value: 'XOF', label: 'XOF Franc CFA BCEAO' },
  { value: 'USD', label: '$ Dollar US' },
  { value: 'GBP', label: '£ Livre Sterling' },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('company');
  const { activeCompany, setActiveCompany } = useCompanyStore();
  const { user }                            = useAuthStore();

  return (
    <div className="flex min-h-screen bg-surface-secondary">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header title="Paramètres" subtitle="Configuration de Vision R+" />
        <div className="flex-1 p-6">
          <div className="flex gap-6 max-w-5xl">

            {/* ── Nav sections ──────────────────────── */}
            <div className="w-52 flex-shrink-0">
              <nav className="space-y-1">
                {SECTIONS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveSection(id)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                      activeSection === id
                        ? 'bg-brand-navy text-white shadow-sm'
                        : 'text-slate-500 hover:bg-surface-tertiary hover:text-brand-navy',
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            {/* ── Contenu section ───────────────────── */}
            <div className="flex-1 min-w-0 animate-fade-in">
              {activeSection === 'company'  && <CompanySettings company={activeCompany} onUpdate={setActiveCompany} />}
              {activeSection === 'profile'  && <ProfileSettings user={user} />}
              {activeSection === 'notifications' && <NotificationsSettings />}
              {activeSection === 'security' && <SecuritySettings />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Section : Entreprise active ───────────────────────────────
function CompanySettings({ company, onUpdate }: { company: any; onUpdate: (c: any) => void }) {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      name:              company?.name ?? '',
      accounting_system: company?.accounting_system ?? 'pcg_france',
      currency:          company?.currency ?? 'EUR',
      legal_form:        company?.legal_form ?? '',
      country:           company?.country ?? '',
      email:             company?.email ?? '',
      phone:             company?.phone ?? '',
    },
  });

  const currentSystem = watch('accounting_system');

  const onSubmit = async (data: any) => {
    if (!company) return;
    setSaving(true);
    try {
      const updated = await companiesApi.update(company.id, data);
      onUpdate(updated);
      toast.success('Paramètres enregistrés');
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (!company) {
    return (
      <Card className="p-6">
        <p className="text-slate-400 text-sm">
          Aucune entreprise sélectionnée. Créez-en une depuis la page Entreprises.
        </p>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Card className="p-6">
        <CardHeader title="Identité de l'entreprise" />
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nom de l'entreprise</label>
              <input {...register('name')} className="input" />
            </div>
            <div>
              <label className="label">Forme juridique</label>
              <input {...register('legal_form')} placeholder="SAS, SARL…" className="input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Email</label>
              <input {...register('email')} type="email" className="input" />
            </div>
            <div>
              <label className="label">Téléphone</label>
              <input {...register('phone')} type="tel" className="input" />
            </div>
          </div>
          <div>
            <label className="label">Pays</label>
            <input {...register('country')} className="input" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <CardHeader
          title="Système comptable"
          subtitle="Détermine le plan de comptes utilisé"
        />
        <div className="grid grid-cols-2 gap-3 mb-4">
          {(['pcg_france', 'ohada'] as AccountingSystem[]).map((sys) => (
            <button
              key={sys}
              type="button"
              onClick={() => setValue('accounting_system', sys)}
              className={cn(
                'p-4 rounded-xl border text-left transition-all',
                currentSystem === sys
                  ? 'border-brand-orange bg-brand-orange/5'
                  : 'border-slate-200 hover:border-slate-300',
              )}
            >
              <p className="text-sm font-bold text-brand-navy mb-0.5">
                {SYSTEM_LABELS[sys]}
              </p>
              <p className="text-xs text-slate-400">
                {sys === 'pcg_france'
                  ? 'Plan Comptable Général — France'
                  : 'SYSCOHADA révisé — Afrique subsaharienne'}
              </p>
            </button>
          ))}
        </div>
        <div>
          <label className="label">Devise</label>
          <select {...register('currency')} className="input">
            {CURRENCIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </Card>

      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Enregistrement…' : 'Sauvegarder'}
        </button>
      </div>
    </form>
  );
}

// ── Section : Profil ──────────────────────────────────────────
function ProfileSettings({ user }: { user: any }) {
  return (
    <Card className="p-6">
      <CardHeader title="Profil utilisateur" />
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
        <div className="w-14 h-14 bg-brand-navy rounded-2xl flex items-center justify-center
                        text-white font-black text-lg">
          {user?.first_name?.[0]}{user?.last_name?.[0]}
        </div>
        <div>
          <p className="font-bold text-brand-navy">{user?.first_name} {user?.last_name}</p>
          <p className="text-sm text-slate-400">{user?.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={user?.plan === 'cabinet' ? 'blue' : user?.plan === 'pro' ? 'green' : 'default'}>
              Plan {(PLAN_LABELS as Record<string, string>)[user?.plan ?? 'free'] ?? ''}
            </Badge>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Prénom</label>
            <input defaultValue={user?.first_name} className="input" readOnly />
          </div>
          <div>
            <label className="label">Nom</label>
            <input defaultValue={user?.last_name} className="input" readOnly />
          </div>
        </div>
        <div>
          <label className="label">Email</label>
          <input defaultValue={user?.email} type="email" className="input" readOnly />
        </div>
        <p className="text-xs text-slate-400">
          Pour modifier votre profil, contactez le support Vision R+.
        </p>
      </div>
    </Card>
  );
}

// ── Section : Notifications ───────────────────────────────────
function NotificationsSettings() {
  const [prefs, setPrefs] = useState({
    tresorerie: true,
    ecritures:  true,
    rapports:   false,
    alertes:    true,
  });

  return (
    <Card className="p-6">
      <CardHeader title="Notifications" subtitle="Gérez vos alertes automatiques" />
      <div className="space-y-4">
        {[
          { key: 'tresorerie', label: 'Alerte trésorerie négative', desc: 'Notifier quand le solde passe en négatif' },
          { key: 'ecritures',  label: 'Rappel écritures en brouillon', desc: 'Écritures non validées depuis plus de 7 jours' },
          { key: 'rapports',   label: 'Rapport mensuel automatique', desc: 'Synthèse financière le 1er de chaque mois' },
          { key: 'alertes',    label: 'Anomalies comptables', desc: 'Charges inhabituelles, écart de bilan…' },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
            <div>
              <p className="text-sm font-medium text-brand-navy">{label}</p>
              <p className="text-xs text-slate-400">{desc}</p>
            </div>
            <button
              onClick={() => setPrefs((p) => ({ ...p, [key]: !p[key as keyof typeof p] }))}
              className={cn(
                'w-11 h-6 rounded-full transition-all duration-200 relative flex-shrink-0',
                prefs[key as keyof typeof prefs]
                  ? 'bg-brand-orange'
                  : 'bg-slate-200',
              )}
            >
              <span className={cn(
                'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200',
                prefs[key as keyof typeof prefs] ? 'left-[22px]' : 'left-0.5',
              )} />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Section : Sécurité ────────────────────────────────────────
function SecuritySettings() {
  return (
    <Card className="p-6">
      <CardHeader title="Sécurité" />
      <div className="space-y-4">
        <div className="p-4 bg-surface-secondary rounded-xl border border-slate-100">
          <p className="text-sm font-semibold text-brand-navy mb-1">Changer de mot de passe</p>
          <p className="text-xs text-slate-400 mb-3">
            Utilisez un mot de passe fort d'au moins 8 caractères.
          </p>
          <div className="space-y-2">
            <input type="password" placeholder="Mot de passe actuel" className="input text-sm" />
            <input type="password" placeholder="Nouveau mot de passe" className="input text-sm" />
            <input type="password" placeholder="Confirmer le nouveau mot de passe" className="input text-sm" />
          </div>
          <button className="btn-primary mt-3 text-xs">
            <Save className="w-3.5 h-3.5" /> Mettre à jour
          </button>
        </div>

        <div className="p-4 bg-surface-secondary rounded-xl border border-slate-100">
          <p className="text-sm font-semibold text-brand-navy mb-1">Sessions actives</p>
          <p className="text-xs text-slate-400">Vous êtes connecté sur 1 appareil.</p>
        </div>
      </div>
    </Card>
  );
}
