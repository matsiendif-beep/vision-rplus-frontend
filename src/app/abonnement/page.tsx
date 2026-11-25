'use client';
// ============================================================
//  VISION R+ — Abonnement
//  Carte bancaire (Stripe, renouvellement mensuel automatique)
//  ou Mobile Money (CinetPay, 30 jours sans renouvellement).
//  Règles et prix : CGV (src/app/legal/cgu) et src/lib/legal.ts.
// ============================================================
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CreditCard, Smartphone, Check, Loader2, Settings2, FlaskConical, X, Crown } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import { Spinner, ErrorMessage } from '@/components/ui';
import { billingApi, extractApiError, type PaidPlan, type SubscriptionInfo } from '@/lib/api/client';
import { PLANS, fcfa } from '@/lib/legal';
import { cn } from '@/lib/utils';

const FEATURES: Record<PaidPlan, string[]> = {
  pro:     ['3 entreprises', 'Écritures illimitées', 'Toutes les fonctions', 'Support prioritaire'],
  cabinet: ['10 entreprises incluses (+5 €/mois par entreprise supplémentaire)', 'Écritures illimitées', 'Multi-utilisateurs et rôles', 'Accompagnement à la prise en main'],
};

// Pays CinetPay et devise correspondante (BEAC → XAF, BCEAO → XOF)
const COUNTRIES: { code: string; name: string; currency: 'XAF' | 'XOF' }[] = [
  { code: 'GA', name: 'Gabon', currency: 'XAF' }, { code: 'CM', name: 'Cameroun', currency: 'XAF' },
  { code: 'CG', name: 'Congo', currency: 'XAF' }, { code: 'CI', name: 'Côte d\'Ivoire', currency: 'XOF' },
  { code: 'SN', name: 'Sénégal', currency: 'XOF' }, { code: 'BJ', name: 'Bénin', currency: 'XOF' },
  { code: 'TG', name: 'Togo', currency: 'XOF' }, { code: 'BF', name: 'Burkina Faso', currency: 'XOF' },
  { code: 'ML', name: 'Mali', currency: 'XOF' }, { code: 'NE', name: 'Niger', currency: 'XOF' },
];

const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—');
const planName = (p: string) => (p === 'cabinet' ? 'Cabinet' : p === 'pro' ? 'Pro' : 'Gratuit');

export default function AbonnementPage() {
  const [info, setInfo]       = useState<SubscriptionInfo | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [busy, setBusy]       = useState<string | null>(null);
  const [momoPlan, setMomoPlan] = useState<PaidPlan | null>(null);

  const load = useCallback(async () => {
    try { setInfo(await billingApi.subscription()); setError(null); }
    catch (e) { setError(extractApiError(e)); }
  }, []);

  useEffect(() => {
    load();
    // Retour de paiement : l'activation arrive par notification, on actualise quelques fois
    const params = new URLSearchParams(window.location.search);
    const status = params.get('paiement');
    if (status === 'ok') {
      toast.success('Paiement reçu. Votre abonnement s\'active dans quelques instants.');
      let n = 0;
      const t = setInterval(() => { load(); if (++n >= 6) clearInterval(t); }, 5000);
      window.history.replaceState(null, '', '/abonnement');
      return () => clearInterval(t);
    }
    if (status === 'annule') {
      toast.info('Paiement annulé : aucun montant n\'a été prélevé.');
      window.history.replaceState(null, '', '/abonnement');
    }
  }, [load]);

  const go = async (key: string, fn: () => Promise<{ url?: string; payment_url?: string } | unknown>) => {
    setBusy(key);
    try {
      const r = (await fn()) as { url?: string; payment_url?: string } | undefined;
      const url = r?.url ?? r?.payment_url;
      if (url) { window.location.href = url; return; }
      await load();
    } catch (e) {
      toast.error(extractApiError(e));
    } finally {
      setBusy(null);
    }
  };

  const changePlan = (plan: PaidPlan) => {
    const msg = plan === 'cabinet'
      ? 'Passer à la formule Cabinet (79 €/mois) ? La différence est facturée au prorata.'
      : 'Revenir à la formule Pro (29 €/mois) ? Le trop-perçu est déduit de votre prochaine facture.';
    if (!confirm(msg)) return;
    go(`change-${plan}`, async () => { await billingApi.changePlan(plan); toast.success(`Formule ${planName(plan)} activée`); });
  };

  if (error && !info) {
    return (<div className="flex flex-col"><Header title="Abonnement" /><div className="p-6"><ErrorMessage message={error} /></div></div>);
  }
  if (!info) {
    return (<div className="flex flex-col"><Header title="Abonnement" /><div className="flex justify-center py-24"><Spinner size="lg" /></div></div>);
  }

  const sub = info.subscription;
  const active = !!sub && ['essai', 'actif', 'expire'].includes(sub.status);
  const stripeSub = active && sub!.provider === 'stripe';
  const momoSub = active && sub!.provider === 'mobile_money';
  const nothingAvailable = !info.providers.stripe && !info.providers.mobile_money;

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <Header title="Abonnement" subtitle={`Formule actuelle : ${planName(info.currentPlan)}`} />

      <div className="flex-1 p-6 space-y-5 max-w-5xl animate-fade-in">
        {info.providers.stripe_test && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-sm">
            <FlaskConical className="w-5 h-5 shrink-0" />
            <span>
              <b>Mode test : aucun paiement réel.</b> Pour essayer, utilisez la carte <span className="font-mono">4242 4242 4242 4242</span>,
              une date d&apos;expiration future et n&apos;importe quel code à 3 chiffres.
            </span>
          </div>
        )}

        {/* ── Situation actuelle ─────────────────────── */}
        <div className="card p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-brand-orange-100 flex items-center justify-center">
              <Crown className="w-5 h-5 text-brand-orange" />
            </div>
            <div>
              <p className="font-bold text-brand-navy">Formule {planName(info.currentPlan)}</p>
              <p className="text-sm text-slate-500">
                {!active && 'Toutes les fonctions, 1 entreprise et 10 écritures par mois.'}
                {active && sub!.status === 'essai' && `Essai gratuit jusqu'au ${fmtDate(sub!.trial_ends_at)} — premier prélèvement à cette date${sub!.cancel_at_period_end ? ' (résiliation programmée : aucun prélèvement)' : ''}.`}
                {active && sub!.status === 'actif' && stripeSub && (sub!.cancel_at_period_end
                  ? `Résiliation programmée : accès jusqu'au ${fmtDate(sub!.current_period_end)}, puis retour au Gratuit.`
                  : `Carte bancaire — prochain renouvellement le ${fmtDate(sub!.current_period_end)}.`)}
                {active && sub!.status === 'actif' && momoSub && `Mobile Money — accès jusqu'au ${fmtDate(sub!.current_period_end)} (sans renouvellement automatique).`}
                {active && sub!.status === 'expire' && 'Paiement en échec : mettez à jour votre carte pour conserver votre formule.'}
              </p>
            </div>
          </div>
          {stripeSub && (
            <button onClick={() => go('portal', billingApi.portal)} disabled={!!busy} className="btn-secondary">
              {busy === 'portal' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings2 className="w-4 h-4" />}
              Gérer (carte, factures, résiliation)
            </button>
          )}
        </div>

        {nothingAvailable && (
          <div className="card p-5 text-sm text-slate-600">
            Le paiement en ligne ouvre très bientôt. Pour souscrire dès maintenant, écrivez-nous à{' '}
            <a href="mailto:contact@visionrplus.com" className="text-brand-orange underline">contact@visionrplus.com</a>.
          </div>
        )}

        {/* ── Formules ──────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-5">
          {(['pro', 'cabinet'] as PaidPlan[]).map((plan) => {
            const isCurrent = active && sub!.plan === plan;
            return (
              <div key={plan} className={cn('card p-6 flex flex-col border-2', isCurrent ? 'border-brand-orange' : 'border-transparent')}>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-lg font-bold text-brand-navy">{planName(plan)}</h2>
                  {isCurrent && <span className="text-xs font-semibold bg-brand-orange text-white rounded-full px-2.5 py-0.5">Formule actuelle</span>}
                </div>
                <p className="text-3xl font-bold text-brand-navy">{info.prices[plan].EUR} €<span className="text-base font-normal text-slate-400">/mois</span></p>
                <p className="text-sm text-slate-400 mb-4">ou {fcfa(info.prices[plan].XAF)} par mois en Mobile Money</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {FEATURES[plan].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />{f}</li>
                  ))}
                </ul>

                <div className="space-y-2">
                  {stripeSub && !isCurrent && (
                    <button onClick={() => changePlan(plan)} disabled={!!busy} className="btn-orange w-full justify-center">
                      {busy === `change-${plan}` && <Loader2 className="w-4 h-4 animate-spin" />} Passer à {planName(plan)}
                    </button>
                  )}
                  {!stripeSub && info.providers.stripe && (
                    <button onClick={() => go(`card-${plan}`, () => billingApi.checkout(plan))} disabled={!!busy} className="btn-orange w-full justify-center">
                      {busy === `card-${plan}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                      {info.hadSubscription ? 'Payer par carte' : `Essai gratuit ${PLANS.trialDays} jours (carte)`}
                    </button>
                  )}
                  {!stripeSub && info.providers.mobile_money && (
                    <button onClick={() => setMomoPlan(plan)} disabled={!!busy} className="btn-secondary w-full justify-center">
                      <Smartphone className="w-4 h-4" /> {momoSub && isCurrent ? 'Renouveler (+30 jours)' : 'Payer par Mobile Money'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-slate-400">
          Carte : abonnement mensuel sans engagement, résiliable à tout moment (effet en fin de période). Mobile Money : accès de 30 jours,
          sans renouvellement automatique. Prix nets, TVA non applicable (art. 293 B du CGI). En souscrivant, vous acceptez les{' '}
          <Link href="/legal/cgu" target="_blank" className="underline">conditions générales de vente</Link>.
        </p>
      </div>

      {momoPlan && (
        <MobileMoneyModal
          plan={momoPlan}
          prices={info.prices[momoPlan]}
          onClose={() => setMomoPlan(null)}
          onPay={(data) => go(`momo-${momoPlan}`, () => billingApi.mobileMoney({ plan: momoPlan, ...data }))}
          busy={busy === `momo-${momoPlan}`}
        />
      )}
    </div>
  );
}

function MobileMoneyModal({ plan, prices, onClose, onPay, busy }: {
  plan: PaidPlan; prices: { XAF: number; XOF: number }; busy: boolean;
  onClose: () => void; onPay: (d: { currency: 'XAF' | 'XOF'; phone: string; countryCode: string }) => void;
}) {
  const [country, setCountry] = useState('GA');
  const [phone, setPhone]     = useState('');
  const c = COUNTRIES.find((x) => x.code === country)!;
  const valid = /^\+?\d{8,15}$/.test(phone.replace(/[\s.-]/g, ''));
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <form className="card w-full max-w-md p-6"
            onSubmit={(e) => { e.preventDefault(); if (valid) onPay({ currency: c.currency, phone, countryCode: country }); }}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-brand-navy">Mobile Money — {planName(plan)}</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-brand-navy"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-sm text-slate-500 mb-5">
          {fcfa(prices[c.currency])} pour 30 jours d&apos;accès. Vous serez redirigé vers CinetPay pour valider le paiement
          avec Orange Money, MTN, Airtel, Moov ou Wave.
        </p>
        <label className="label" htmlFor="mm-country">Pays</label>
        <select id="mm-country" className="input mb-4" value={country} onChange={(e) => setCountry(e.target.value)}>
          {COUNTRIES.map((x) => <option key={x.code} value={x.code}>{x.name} ({x.currency})</option>)}
        </select>
        <label className="label" htmlFor="mm-phone">Numéro Mobile Money</label>
        <input id="mm-phone" className="input mb-5" inputMode="tel" placeholder="Ex. +241 77 12 34 56"
               value={phone} onChange={(e) => setPhone(e.target.value)} />
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
          <button type="submit" disabled={!valid || busy} className="btn-orange">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Payer {fcfa(prices[c.currency])}
          </button>
        </div>
      </form>
    </div>
  );
}
