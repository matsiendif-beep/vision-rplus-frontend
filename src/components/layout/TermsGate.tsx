'use client';
// ============================================================
//  Acceptation des CGU/CGV par les comptes existants
//  Si la version acceptée par l'utilisateur n'est pas celle en
//  vigueur, une fenêtre bloquante demande l'acceptation.
// ============================================================
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, ScrollText } from 'lucide-react';
import { toast } from 'sonner';
import { authApi, extractApiError } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store';
import { LEGAL_VERSION, LEGAL_VERSION_LABEL } from '@/lib/legal';

export default function TermsGate() {
  const { isAuthenticated, logout } = useAuthStore();
  const [needed, setNeeded]   = useState(false);
  const [checked, setChecked] = useState(false);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    authApi.me()
      .then((me) => {
        if (!cancelled && me.legal && me.legal.accepted_version !== me.legal.current_version) setNeeded(true);
      })
      .catch(() => { /* hors ligne : on ne bloque pas */ });
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  if (!needed) return null;

  const accept = async () => {
    setSaving(true);
    try {
      await authApi.acceptTerms(LEGAL_VERSION);
      setNeeded(false);
      toast.success('Merci, conditions acceptées.');
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="terms-title">
      <div className="card w-full max-w-md p-6">
        <ScrollText className="w-7 h-7 text-brand-orange mb-3" />
        <h2 id="terms-title" className="text-lg font-bold text-brand-navy mb-2">Nos conditions ont été mises à jour</h2>
        <p className="text-sm text-slate-500 mb-4">
          Pour continuer à utiliser Vision R+, merci de prendre connaissance de la version du {LEGAL_VERSION_LABEL} :
          formules et limites, abonnements, données et responsabilités y sont précisés.
        </p>
        <label className="flex items-start gap-2.5 text-sm text-slate-600 leading-relaxed cursor-pointer mb-5">
          <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)}
                 className="mt-1 w-4 h-4 shrink-0 accent-brand-orange" />
          <span>
            J&apos;accepte les{' '}
            <Link href="/legal/cgu" target="_blank" className="text-brand-orange underline">conditions générales d&apos;utilisation et de vente</Link>{' '}
            et j&apos;ai pris connaissance de la{' '}
            <Link href="/legal/confidentialite" target="_blank" className="text-brand-orange underline">politique de confidentialité</Link>.
          </span>
        </label>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button onClick={logout} className="text-xs text-slate-400 hover:text-brand-navy">Se déconnecter</button>
          <button onClick={accept} disabled={!checked || saving} className="btn-orange">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Accepter et continuer
          </button>
        </div>
      </div>
    </div>
  );
}
