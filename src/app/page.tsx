'use client';
import Link from 'next/link';
import { useState } from 'react';

// ── Icônes SVG inline ─────────────────────────────────────────
const Icon = {
  journal:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
  chart:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  balance:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  ai:         () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M12 2a2 2 0 012 2v2a2 2 0 01-2 2 2 2 0 01-2-2V4a2 2 0 012-2z"/><path d="M12 16a2 2 0 012 2v2a2 2 0 01-2 2 2 2 0 01-2-2v-2a2 2 0 012-2z"/><path d="M2 12a2 2 0 012-2h2a2 2 0 012 2 2 2 0 01-2 2H4a2 2 0 01-2-2z"/><path d="M16 12a2 2 0 012-2h2a2 2 0 012 2 2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
  shield:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  globe:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  check:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><polyline points="20 6 9 17 4 12"/></svg>,
  arrow:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  menu:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  close:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  whatsapp:   () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.858L.054 23.7a.5.5 0 00.609.637l5.973-1.56A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.797 9.797 0 01-5.001-1.369l-.358-.214-3.724.973.997-3.622-.234-.372A9.78 9.78 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182c5.43 0 9.818 4.388 9.818 9.818 0 5.43-4.388 9.818-9.818 9.818z"/></svg>,
};

const features = [
  {
    icon: Icon.journal,
    title: 'Journal comptable complet',
    desc: 'Saisie rapide des écritures, validation en lot, lettrage des comptes. Achats, ventes, banque, caisse, OD.',
  },
  {
    icon: Icon.balance,
    title: 'États financiers automatiques',
    desc: 'Bilan, Compte de résultat, Grand Livre, Balance des comptes générés en temps réel. Export PDF et Excel.',
  },
  {
    icon: Icon.chart,
    title: 'Fiscalité & DSF',
    desc: 'Déclarations TVA, IS, DSF, TAFIRE précalculés. Liasse fiscale conforme aux normes OHADA et PCG.',
  },
  {
    icon: Icon.ai,
    title: 'Assistant IA intégré',
    desc: 'Posez vos questions en français. L\'IA analyse vos données financières et vous conseille en temps réel.',
  },
  {
    icon: Icon.shield,
    title: 'Sécurité & multi-utilisateurs',
    desc: 'Gestion des rôles (admin, comptable, lecture). Piste d\'audit complète. Données chiffrées et sauvegardées.',
  },
  {
    icon: Icon.globe,
    title: 'Multi-devises & multi-sociétés',
    desc: 'EUR, XAF, XOF, USD et plus. Gérez plusieurs entreprises depuis un seul compte.',
  },
];

const plans = [
  {
    name: 'Gratuit',
    price: '0',
    desc: 'Pour démarrer',
    color: 'border-gray-200',
    badge: null,
    features: [
      '1 entreprise',
      '10 écritures/mois',
      'Journal & Grand Livre',
      'Balance des comptes',
      'Bilan & Compte de résultat',
      'OHADA ou PCG France',
    ],
    cta: 'Commencer gratuitement',
    href: '/auth/register',
    primary: false,
  },
  {
    name: 'Pro',
    price: '29',
    desc: 'Pour les PME',
    color: 'border-brand-orange',
    badge: 'Populaire',
    features: [
      '3 entreprises',
      'Écritures illimitées',
      'Fiscalité & DSF complète',
      'Immobilisations & amortissements',
      'Gestion bancaire & rapprochement',
      'Assistant IA comptable',
      'Export PDF & Excel',
      'Support prioritaire',
    ],
    cta: 'Essayer 14 jours',
    href: '/auth/register',
    primary: true,
  },
  {
    name: 'Cabinet',
    price: '79',
    desc: 'Pour les experts-comptables',
    color: 'border-brand-navy',
    badge: null,
    features: [
      'Entreprises illimitées',
      'Tout le plan Pro',
      'Multi-utilisateurs & rôles',
      'Gestion de portefeuille clients',
      'Piste d\'audit avancée',
      'WhatsApp Business intégré',
      'API & webhooks',
      'Account manager dédié',
    ],
    cta: 'Contacter les ventes',
    href: '/auth/register',
    primary: false,
  },
];

const countries = ['Congo', 'Cameroun', 'Côte d\'Ivoire', 'Sénégal', 'Gabon', 'Mali', 'Burkina Faso', 'Togo', 'Bénin', 'Tchad', 'RCA', 'Guinée', 'Niger', 'Guinée Équatoriale', 'Comores', 'Madagascar', 'France'];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-brand-orange rounded-xl flex items-center justify-center font-bold text-white text-sm">R+</div>
            <span className="font-bold text-brand-navy text-lg tracking-tight">Vision R+</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-brand-navy transition-colors">Fonctionnalités</a>
            <a href="#systems" className="text-sm text-gray-600 hover:text-brand-navy transition-colors">OHADA & PCG</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-brand-navy transition-colors">Tarifs</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-medium text-brand-navy hover:text-brand-orange transition-colors px-3 py-2">
              Connexion
            </Link>
            <Link href="/auth/register" className="bg-brand-orange hover:bg-brand-orange-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              Essai gratuit →
            </Link>
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-brand-navy">
            {menuOpen ? <Icon.close /> : <Icon.menu />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-4">
            <a href="#features" onClick={() => setMenuOpen(false)} className="text-sm text-gray-600">Fonctionnalités</a>
            <a href="#systems" onClick={() => setMenuOpen(false)} className="text-sm text-gray-600">OHADA & PCG</a>
            <a href="#pricing" onClick={() => setMenuOpen(false)} className="text-sm text-gray-600">Tarifs</a>
            <Link href="/auth/login" className="text-sm font-medium text-brand-navy">Connexion</Link>
            <Link href="/auth/register" className="bg-brand-orange text-white text-sm font-semibold px-5 py-3 rounded-xl text-center">
              Essai gratuit →
            </Link>
          </div>
        )}
      </nav>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="pt-28 pb-20 px-4 sm:px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-orange/10 text-brand-orange text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <span>✦</span> OHADA · PCG France · 17 pays
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-brand-navy leading-tight mb-6">
            La comptabilité <span className="text-brand-orange">OHADA & PCG</span><br className="hidden sm:block" /> en un seul logiciel
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Vision R+ est la plateforme SaaS qui simplifie la comptabilité des PME africaines et françaises.
            Journal, bilan, fiscalité, IA — tout en un, depuis votre navigateur.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/auth/register"
              className="w-full sm:w-auto bg-brand-orange hover:bg-brand-orange-400 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all hover:shadow-lg hover:-translate-y-0.5">
              Commencer gratuitement
            </Link>
            <a href="#features"
              className="w-full sm:w-auto border-2 border-brand-navy text-brand-navy font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-brand-navy hover:text-white transition-all">
              Voir les fonctionnalités
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { val: '17', label: 'pays couverts' },
              { val: '2', label: 'systèmes comptables' },
              { val: '100%', label: 'en ligne, sans install' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold text-brand-navy">{s.val}</div>
                <div className="text-xs text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAYS TICKER ────────────────────────────────────────── */}
      <div className="bg-brand-navy py-4 overflow-hidden">
        <div className="flex gap-8 animate-[scroll_20s_linear_infinite] whitespace-nowrap" style={{ animation: 'none' }}>
          <div className="flex gap-8 flex-nowrap overflow-hidden">
            {[...countries, ...countries].map((c, i) => (
              <span key={i} className="text-white/60 text-sm font-medium flex-shrink-0">
                {c} <span className="text-brand-orange mx-2">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES ───────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy mb-4">
              Tout ce dont votre PME a besoin
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              De la saisie quotidienne aux états financiers annuels — une seule plateforme.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="group p-6 rounded-2xl border border-gray-100 hover:border-brand-orange/30 hover:shadow-card-hover transition-all bg-white">
                <div className="w-12 h-12 bg-brand-orange/10 text-brand-orange rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-orange group-hover:text-white transition-all">
                  <f.icon />
                </div>
                <h3 className="font-bold text-brand-navy text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OHADA vs PCG ───────────────────────────────────────── */}
      <section id="systems" className="py-24 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy mb-4">
              Le seul logiciel qui parle les deux langues
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Gérez vos entreprises africaines en OHADA et vos filiales françaises en PCG — depuis le même compte.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* OHADA */}
            <div className="bg-white rounded-3xl p-8 border-2 border-brand-orange/20 hover:border-brand-orange transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-brand-orange rounded-2xl flex items-center justify-center text-white font-bold text-lg">O</div>
                <div>
                  <div className="font-bold text-brand-navy text-xl">Système OHADA</div>
                  <div className="text-sm text-gray-400">Organisation pour l'Harmonisation en Afrique du Droit des Affaires</div>
                </div>
              </div>
              <ul className="space-y-3">
                {['17 pays d\'Afrique subsaharienne', 'Plan comptable SYSCOHADA révisé', 'DSF, TAFIRE, liasse fiscale', 'Devises XAF, XOF, USD, EUR', 'Congo, Cameroun, Côte d\'Ivoire, Sénégal…'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-gray-600 text-sm">
                    <span className="w-5 h-5 bg-brand-orange/10 text-brand-orange rounded-full flex items-center justify-center flex-shrink-0"><Icon.check /></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* PCG France */}
            <div className="bg-white rounded-3xl p-8 border-2 border-brand-navy/20 hover:border-brand-navy transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-brand-navy rounded-2xl flex items-center justify-center text-white font-bold text-lg">F</div>
                <div>
                  <div className="font-bold text-brand-navy text-xl">PCG France</div>
                  <div className="text-sm text-gray-400">Plan Comptable Général — norme française et européenne</div>
                </div>
              </div>
              <ul className="space-y-3">
                {['France, Belgique, Luxembourg', 'Plan comptable général normalisé', 'TVA, IS, FEC (Fichier des Écritures)', 'Bilan & compte de résultat PCG', 'Conforme aux normes de l\'ANC'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-gray-600 text-sm">
                    <span className="w-5 h-5 bg-brand-navy/10 text-brand-navy rounded-full flex items-center justify-center flex-shrink-0"><Icon.check /></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy mb-4">Tarifs simples et transparents</h2>
            <p className="text-gray-500 text-lg">Commencez gratuitement. Passez au Pro quand vous êtes prêt.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan) => (
              <div key={plan.name} className={`relative bg-white rounded-3xl border-2 p-8 flex flex-col ${plan.color} ${plan.primary ? 'shadow-card-hover scale-105' : ''}`}>
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-orange text-white text-xs font-bold px-4 py-1.5 rounded-full">
                    {plan.badge}
                  </div>
                )}
                <div className="mb-6">
                  <div className="font-bold text-brand-navy text-xl mb-1">{plan.name}</div>
                  <div className="text-gray-400 text-sm mb-4">{plan.desc}</div>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-brand-navy">{plan.price}€</span>
                    <span className="text-gray-400 mb-1">/mois</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="text-brand-orange flex-shrink-0"><Icon.check /></span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href={plan.href}
                  className={`w-full text-center py-3.5 rounded-xl font-semibold text-sm transition-all ${
                    plan.primary
                      ? 'bg-brand-orange hover:bg-brand-orange-400 text-white hover:shadow-lg'
                      : 'border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white'
                  }`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA WHATSAPP ───────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 bg-brand-navy">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-4 text-green-400">
            <Icon.whatsapp />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Votre assistant comptable disponible sur WhatsApp
          </h2>
          <p className="text-white/60 text-lg mb-8">
            Posez vos questions, recevez vos alertes financières et gérez votre comptabilité directement depuis WhatsApp.
            <span className="text-brand-orange"> Bientôt disponible.</span>
          </p>
          <Link href="/auth/register"
            className="inline-flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-400 text-white font-bold px-8 py-4 rounded-2xl transition-all hover:shadow-lg">
            Créer mon compte maintenant <Icon.arrow />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="bg-gray-50 border-t border-gray-100 py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center font-bold text-white text-xs">R+</div>
                <span className="font-bold text-brand-navy">Vision R+</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                La comptabilité OHADA et PCG France simplifiée pour les PME africaines et françaises.
              </p>
            </div>

            <div>
              <div className="font-semibold text-brand-navy text-sm mb-4">Produit</div>
              <ul className="space-y-2">
                {['Fonctionnalités', 'Tarifs', 'OHADA', 'PCG France'].map(l => (
                  <li key={l}><a href="#" className="text-gray-400 text-sm hover:text-brand-orange transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <div className="font-semibold text-brand-navy text-sm mb-4">Entreprise</div>
              <ul className="space-y-2">
                {['À propos', 'Contact', 'Blog', 'Support'].map(l => (
                  <li key={l}><a href="#" className="text-gray-400 text-sm hover:text-brand-orange transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <div className="font-semibold text-brand-navy text-sm mb-4">Légal</div>
              <ul className="space-y-2">
                {[
                  { label: 'Politique de confidentialité', href: '/legal/privacy' },
                  { label: 'Conditions d\'utilisation', href: '#' },
                  { label: 'Mentions légales', href: '#' },
                ].map(l => (
                  <li key={l.label}><a href={l.href} className="text-gray-400 text-sm hover:text-brand-orange transition-colors">{l.label}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Vision R+. Tous droits réservés.</p>
            <p className="text-gray-400 text-sm">🌍 OHADA · 🇫🇷 PCG France · 17 pays</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
