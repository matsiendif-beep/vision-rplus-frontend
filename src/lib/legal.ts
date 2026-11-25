// ============================================================
//  VISION R+ — Informations juridiques (source unique)
//  Toutes les pages /legal/* lisent ces valeurs.
//  ⚠️ Si vous modifiez le CONTENU des conditions (pas seulement
//  l'identité), changez LEGAL_VERSION ici ET dans le backend
//  (src/legal/legal-version.ts) : les utilisateurs devront
//  accepter la nouvelle version.
// ============================================================

export const LEGAL_VERSION      = '2026-11-25';
export const LEGAL_VERSION_LABEL = '25 novembre 2026';

export const PUBLISHER = {
  name:      'Arnaud Frédéric MOUSSOUNDA MATSIENDI',
  status:    'Entrepreneur individuel',
  // À compléter dès l'immatriculation : remplacer null par le numéro, ex. '123 456 789 00012'
  siret:     null as string | null,
  address:   '11 rue des Fauvettes, 31700 Beauzelle, France',
  phone:     '07 46 43 57 82',
  phoneIntl: '+33746435782',
  email:     'contact@visionrplus.com',
  site:      'https://www.visionrplus.com',
  // Tribunaux compétents (domicile de l'éditeur : Haute-Garonne)
  court:     'tribunaux du ressort de la cour d\'appel de Toulouse',
};

export const siretLabel = () =>
  PUBLISHER.siret ? `SIRET ${PUBLISHER.siret}` : 'Immatriculation en cours (le numéro SIRET sera indiqué dès son attribution)';

export const PLANS = {
  free:    { name: 'Gratuit', eur: 0,  xaf: 0,      companies: 1,  entries: 10 },
  pro:     { name: 'Pro',     eur: 29, xaf: 19_000, companies: 3,  entries: Infinity },
  cabinet: { name: 'Cabinet', eur: 79, xaf: 52_000, companies: 10, entries: Infinity },
  cabinetExtra: { eur: 5, xaf: 3_000 },
  trialDays: 14,
  dataExportDays: 90,
};

export const fcfa = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;
