'use client';
import Link from 'next/link';
import { useState } from 'react';

const steps = [
  {
    id: 1,
    emoji: '🏢',
    title: 'Créer votre compte et votre entreprise',
    subtitle: 'La première chose à faire — 2 minutes',
    color: 'bg-orange-50 border-brand-orange',
    content: [
      {
        heading: 'Créer votre compte',
        text: 'Allez sur visionrplus.com, cliquez sur "Créer un compte". Entrez votre prénom, nom, email et mot de passe. C\'est gratuit.',
      },
      {
        heading: 'Ajouter votre entreprise',
        text: 'Une fois connecté, cliquez sur "Créer une entreprise". Renseignez le nom de votre société, le pays, le type de système comptable.',
      },
      {
        heading: 'Choisir le bon système',
        text: 'Vous verrez deux options : OHADA (pour les pays d\'Afrique subsaharienne : Congo, Cameroun, Côte d\'Ivoire, Sénégal, etc.) ou PCG France (pour la France et l\'Europe). Choisissez selon votre pays.',
      },
    ],
    tip: 'Vous pouvez gérer plusieurs entreprises depuis un seul compte. Utile si vous avez une société en France ET une en Afrique.',
  },
  {
    id: 2,
    emoji: '📒',
    title: 'Comprendre le journal comptable',
    subtitle: 'Pas besoin d\'être comptable pour comprendre ça',
    color: 'bg-blue-50 border-blue-300',
    content: [
      {
        heading: 'C\'est quoi une écriture comptable ?',
        text: 'Imaginez un carnet où vous notez TOUT ce qui entre et sort d\'argent dans votre entreprise. Chaque ligne dans ce carnet s\'appelle une "écriture". Vente de 500€ ? Écriture. Achat de fournitures ? Écriture. Salaires payés ? Écriture.',
      },
      {
        heading: 'La règle de base : Débit = Crédit',
        text: 'Chaque écriture a deux côtés : ce qui "entre" (Débit) et ce qui "sort" (Crédit). Les deux doivent toujours être égaux. Vision R+ fait ce calcul pour vous automatiquement.',
      },
      {
        heading: 'Les types de journaux',
        text: 'Il y a plusieurs carnets selon le type d\'opération : Journal Ventes (vos factures clients), Journal Achats (vos dépenses), Journal Banque (vos relevés bancaires), Journal Caisse (votre argent liquide).',
      },
    ],
    tip: 'Ne vous inquiétez pas de la comptabilité technique. Vision R+ vous guide à chaque étape avec des formulaires simples.',
  },
  {
    id: 3,
    emoji: '💰',
    title: 'Enregistrer une vente',
    subtitle: 'Vous avez vendu quelque chose ? Voilà comment le noter',
    color: 'bg-green-50 border-green-300',
    content: [
      {
        heading: 'Allez dans "Journal"',
        text: 'Dans le menu de gauche, cliquez sur "Journal". Vous verrez la liste de toutes vos écritures.',
      },
      {
        heading: 'Nouvelle écriture',
        text: 'Cliquez sur "+ Nouvelle écriture". Choisissez "Ventes" comme type de journal. Entrez la date, un numéro de référence (ex: FAC-001), et un libellé (ex: "Vente prestation client X").',
      },
      {
        heading: 'Les lignes de l\'écriture',
        text: 'Ligne 1 (Débit) : compte client (411) → montant TTC. Ligne 2 (Crédit) : compte ventes (701) → montant HT. Ligne 3 (Crédit) : compte TVA (445) → montant TVA. Vision R+ vous propose les bons comptes automatiquement.',
      },
      {
        heading: 'Valider l\'écriture',
        text: 'Cliquez sur "Valider". L\'écriture apparaît dans votre journal et met à jour automatiquement votre bilan et compte de résultat.',
      },
    ],
    tip: 'Exemple concret : Vous vendez une prestation à 1 000€ HT (TVA 20% = 200€, Total TTC = 1 200€). Débit 411 → 1 200€ / Crédit 701 → 1 000€ / Crédit 445 → 200€.',
  },
  {
    id: 4,
    emoji: '🛒',
    title: 'Enregistrer un achat / une dépense',
    subtitle: 'Fournitures, loyer, factures fournisseurs — tout se note ici',
    color: 'bg-purple-50 border-purple-300',
    content: [
      {
        heading: 'Même principe que la vente',
        text: 'Dans "Journal", créez une nouvelle écriture. Choisissez "Achats" comme type de journal.',
      },
      {
        heading: 'Remplir l\'écriture d\'achat',
        text: 'Exemple : vous achetez des fournitures de bureau pour 300€ HT + 60€ TVA = 360€ TTC. Débit 607 (Achats) → 300€ / Débit 445 (TVA déductible) → 60€ / Crédit 401 (Fournisseur) → 360€.',
      },
      {
        heading: 'Joindre la facture',
        text: 'Vous pouvez attacher directement la photo ou le PDF de votre facture à l\'écriture. Allez dans "Documents" pour uploader vos pièces justificatives.',
      },
    ],
    tip: 'Astuce : Faites vos saisies chaque semaine plutôt qu\'en fin de mois. 15 minutes par semaine vaut mieux que 3 heures en fin de mois.',
  },
  {
    id: 5,
    emoji: '🏦',
    title: 'Gérer votre banque',
    subtitle: 'Connectez votre relevé bancaire pour un suivi précis',
    color: 'bg-cyan-50 border-cyan-300',
    content: [
      {
        heading: 'Ajouter un compte bancaire',
        text: 'Allez dans "Banque" → "Ajouter un compte". Entrez le nom de votre banque, votre IBAN et le solde actuel.',
      },
      {
        heading: 'Importer votre relevé',
        text: 'Téléchargez votre relevé bancaire depuis votre banque en ligne (format CSV ou Excel). Importez-le dans Vision R+. Les transactions sont listées automatiquement.',
      },
      {
        heading: 'Le rapprochement bancaire',
        text: 'C\'est la vérification que vos écritures comptables correspondent à ce que montre votre relevé bancaire. Vision R+ vous aide à faire correspondre chaque ligne de relevé avec votre journal.',
      },
    ],
    tip: 'Le rapprochement bancaire mensuel est obligatoire dans la plupart des pays. Il permet de détecter les erreurs et les oublis.',
  },
  {
    id: 6,
    emoji: '📊',
    title: 'Lire vos états financiers',
    subtitle: 'Ces documents résument la santé financière de votre entreprise',
    color: 'bg-amber-50 border-amber-300',
    content: [
      {
        heading: 'Le Grand Livre',
        text: 'C\'est le détail de tous les mouvements sur chaque compte. Accédez-y depuis "Grand Livre" dans le menu. Utile pour trouver une erreur ou suivre un compte précis.',
      },
      {
        heading: 'La Balance des comptes',
        text: 'Résumé de tous vos comptes avec leur solde (débit et crédit). Allez dans "Balance des comptes". Si la colonne Débit = la colonne Crédit, votre comptabilité est équilibrée.',
      },
      {
        heading: 'Le Compte de résultat',
        text: 'Montre si votre entreprise est rentable. Revenus − Charges = Résultat. Si positif → bénéfice. Si négatif → perte. Accédez-y depuis "Compte de résultat".',
      },
      {
        heading: 'Le Bilan',
        text: 'Photographie de votre patrimoine à un instant T. Côté Actif = ce que vous possédez (argent, matériel, créances). Côté Passif = ce que vous devez (capital, dettes). Actif = Passif toujours.',
      },
    ],
    tip: 'Ces documents sont générés automatiquement à partir de vos écritures. Vous n\'avez rien à calculer — Vision R+ le fait pour vous.',
  },
  {
    id: 7,
    emoji: '📄',
    title: 'Exporter vos documents',
    subtitle: 'Pour votre comptable, votre banque ou l\'administration fiscale',
    color: 'bg-red-50 border-red-300',
    content: [
      {
        heading: 'Export PDF',
        text: 'Sur chaque page (Bilan, Compte de résultat, Journal, etc.), vous trouverez un bouton "Exporter en PDF". Le document est prêt à imprimer ou à envoyer par email.',
      },
      {
        heading: 'Export Excel',
        text: 'Cliquez sur "Exporter en Excel" pour obtenir un fichier .xlsx que vous pouvez ouvrir dans Excel ou Google Sheets. Pratique pour faire vos propres analyses.',
      },
      {
        heading: 'La liasse fiscale (DSF)',
        text: 'Allez dans "Fiscalité & DSF". Sélectionnez l\'exercice et le type de déclaration. Vision R+ calcule automatiquement tous les montants à partir de vos écritures et génère le document officiel.',
      },
    ],
    tip: 'Conseil : Faites un export complet (Journal + Bilan + Compte de résultat) à la fin de chaque mois et sauvegardez-le. C\'est votre archive comptable.',
  },
  {
    id: 8,
    emoji: '🤖',
    title: 'Utiliser l\'assistant IA',
    subtitle: 'Votre comptable virtuel disponible 24h/24',
    color: 'bg-indigo-50 border-indigo-300',
    content: [
      {
        heading: 'Où trouver l\'assistant ?',
        text: 'Dans le dashboard, cherchez l\'icône IA ou le chat. Vous pouvez poser vos questions en français, directement.',
      },
      {
        heading: 'Ce que vous pouvez lui demander',
        text: '"Quel est mon chiffre d\'affaires du mois ?" / "Est-ce que mon bilan est équilibré ?" / "Comment comptabiliser un remboursement de frais ?" / "Quelle est ma TVA à payer ce trimestre ?"',
      },
      {
        heading: 'Sur WhatsApp (bientôt)',
        text: 'Prochainement, vous pourrez poser ces questions directement par WhatsApp, sans ouvrir l\'application. L\'IA accèdera à vos données en temps réel.',
      },
    ],
    tip: 'L\'IA connaît les règles OHADA et PCG France. Elle vous répond avec précision selon votre système comptable.',
  },
];

const faq = [
  {
    q: 'Je ne connais pas la comptabilité. Puis-je utiliser Vision R+ ?',
    a: 'Oui. Vision R+ est conçu pour les entrepreneurs, pas uniquement pour les comptables. Le guide pas-à-pas vous accompagne. L\'assistant IA répond à vos questions en langage simple.',
  },
  {
    q: 'Quelle est la différence entre OHADA et PCG France ?',
    a: 'Ce sont deux systèmes de règles comptables différents. OHADA s\'applique dans 17 pays d\'Afrique subsaharienne (Congo, Cameroun, Côte d\'Ivoire...). PCG France s\'applique en France et dans certains pays francophones d\'Europe. Vision R+ gère les deux.',
  },
  {
    q: 'Mes données sont-elles sécurisées ?',
    a: 'Oui. Vos données sont hébergées sur des serveurs sécurisés, chiffrées et sauvegardées automatiquement. Vous êtes le seul propriétaire de vos données.',
  },
  {
    q: 'Puis-je travailler avec mon comptable sur Vision R+ ?',
    a: 'Oui. Le plan Cabinet permet d\'inviter des collaborateurs avec des rôles différents (admin, comptable, lecture). Votre comptable peut accéder à votre dossier sans voir votre mot de passe.',
  },
  {
    q: 'Que se passe-t-il si je dépasse la limite du plan Gratuit ?',
    a: 'Vision R+ vous avertit avant d\'atteindre la limite. Vous pouvez passer au plan Pro à tout moment. Vos données ne sont jamais supprimées.',
  },
];

export default function GuidePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── NAV ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-brand-orange rounded-xl flex items-center justify-center font-bold text-white text-sm">R+</div>
            <span className="font-bold text-brand-navy text-lg tracking-tight">Vision R+</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-medium text-gray-500 hover:text-brand-navy transition-colors">
              Connexion
            </Link>
            <Link href="/auth/register" className="bg-brand-orange text-white text-sm font-semibold px-4 py-2 rounded-xl">
              Essai gratuit →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="pt-28 pb-14 px-4 sm:px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-orange/10 text-brand-orange text-xs font-semibold px-4 py-2 rounded-full mb-5">
            📖 Guide complet
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-navy mb-5">
            Comment utiliser Vision R+
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Même si vous ne connaissez pas la comptabilité, ce guide vous explique tout pas à pas — de la création du compte à l'export de vos bilans.
          </p>
        </div>
      </section>

      {/* ── TABLE DES MATIÈRES ──────────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-100 overflow-x-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex gap-1 py-3 min-w-max sm:min-w-0">
          {steps.map(s => (
            <a key={s.id} href={`#step-${s.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-brand-orange/10 hover:text-brand-orange transition-all whitespace-nowrap">
              <span>{s.emoji}</span>
              <span className="hidden sm:inline">{s.title.split(' ').slice(0, 3).join(' ')}…</span>
              <span className="sm:hidden">{s.id}</span>
            </a>
          ))}
        </div>
      </div>

      {/* ── STEPS ───────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-8">
        {steps.map((step) => (
          <div key={step.id} id={`step-${step.id}`} className="scroll-mt-32">
            {/* En-tête étape */}
            <button
              onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
              className={`w-full text-left p-6 rounded-2xl border-2 transition-all ${step.color} hover:shadow-card`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="text-4xl flex-shrink-0">{step.emoji}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Étape {step.id}</span>
                    </div>
                    <h2 className="text-xl font-bold text-brand-navy">{step.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">{step.subtitle}</p>
                  </div>
                </div>
                <span className="text-2xl text-gray-400 flex-shrink-0 mt-1">
                  {activeStep === step.id ? '▲' : '▼'}
                </span>
              </div>
            </button>

            {/* Contenu (accordion) */}
            {activeStep === step.id && (
              <div className="mt-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-card space-y-6">
                {step.content.map((c, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-7 h-7 bg-brand-navy text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-navy text-base mb-1">{c.heading}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                ))}

                {/* Astuce */}
                <div className="bg-brand-orange/8 border border-brand-orange/20 rounded-xl p-4 flex gap-3">
                  <span className="text-xl flex-shrink-0">💡</span>
                  <p className="text-sm text-gray-700 leading-relaxed">{step.tip}</p>
                </div>

                <div className="pt-2">
                  <Link href="/auth/register"
                    className="inline-flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
                    Essayer maintenant →
                  </Link>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── RÉSUMÉ VISUEL ───────────────────────────────────────── */}
      <section className="bg-brand-navy py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">En résumé, voici comment ça marche</h2>
          <p className="text-white/50">Le cycle comptable simplifié</p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: '🏢', label: 'Créer son entreprise', sub: 'OHADA ou PCG' },
            { icon: '✍️', label: 'Saisir ses écritures', sub: 'Ventes, achats, banque' },
            { icon: '📊', label: 'États financiers auto', sub: 'Bilan, résultat' },
            { icon: '📤', label: 'Exporter & déclarer', sub: 'PDF, Excel, DSF' },
          ].map((item, i) => (
            <div key={i} className="bg-white/5 rounded-2xl p-5 text-center">
              <div className="text-3xl mb-3">{item.icon}</div>
              <div className="text-white font-semibold text-sm mb-1">{item.label}</div>
              <div className="text-white/40 text-xs">{item.sub}</div>
              {i < 3 && <div className="hidden sm:block absolute text-white/30 text-2xl" style={{ right: '-12px', top: '50%' }}>→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy text-center mb-10">Questions fréquentes</h2>
          <div className="space-y-3">
            {faq.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-5 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-brand-navy text-sm sm:text-base">{item.q}</span>
                  <span className="text-gray-400 flex-shrink-0">{openFaq === i ? '▲' : '▼'}</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-50 pt-4">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ───────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-white text-center">
        <div className="max-w-xl mx-auto">
          <div className="text-5xl mb-6">🚀</div>
          <h2 className="text-3xl font-bold text-brand-navy mb-4">Prêt à commencer ?</h2>
          <p className="text-gray-500 mb-8">Créez votre compte gratuitement. Aucune carte bancaire requise. Vos premières écritures en 5 minutes.</p>
          <Link href="/auth/register"
            className="inline-flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-400 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all hover:shadow-lg">
            Commencer gratuitement →
          </Link>
          <div className="mt-6 text-sm text-gray-400">
            Déjà un compte ? <Link href="/auth/login" className="text-brand-orange hover:underline">Se connecter</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER MINI ─────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-8 px-4 text-center">
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} Vision R+ · <Link href="/" className="hover:text-brand-orange">Accueil</Link> · <Link href="/auth/register" className="hover:text-brand-orange">S'inscrire</Link>
        </p>
      </footer>
    </div>
  );
}
