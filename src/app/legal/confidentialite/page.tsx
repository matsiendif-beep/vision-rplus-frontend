import type { Metadata } from 'next';
import Link from 'next/link';
import { DocTitle, H2, P, UL, Table } from '../_components';
import { PUBLISHER, PLANS } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Politique de confidentialité — Vision R+',
};

export default function ConfidentialitePage() {
  return (
    <>
      <DocTitle>Politique de confidentialité</DocTitle>

      <P>
        Cette politique explique quelles données personnelles Vision R+ traite, pourquoi, combien de temps, avec quels
        prestataires, et comment exercer vos droits. Elle s&apos;applique au site {PUBLISHER.site}, à l&apos;application
        et aux services associés (emails, WhatsApp).
      </P>

      <H2 id="responsable">1. Responsable du traitement</H2>
      <P>
        {PUBLISHER.name}, {PUBLISHER.status.toLowerCase()}, {PUBLISHER.address}. Contact pour toute question relative
        à vos données : <a href={`mailto:${PUBLISHER.email}`} className="underline">{PUBLISHER.email}</a>.
      </P>

      <H2 id="donnees">2. Données traitées et finalités</H2>
      <Table
        head={['Données', 'Pourquoi', 'Base légale']}
        rows={[
          ['Compte : nom, prénom, email, téléphone (facultatif), mot de passe (stocké chiffré)', 'Créer et sécuriser votre compte, vous identifier', 'Exécution du contrat'],
          ['Données comptables et d\'entreprise : écritures, comptes, tiers, immobilisations, banques, déclarations, pièces justificatives', 'Fournir le Service', 'Exécution du contrat'],
          ['Abonnement et paiements : formule, dates, identifiants de transaction (jamais vos numéros de carte)', 'Facturer, gérer l\'abonnement', 'Exécution du contrat ; obligations légales'],
          ['Acceptation des conditions : date, version, adresse IP, navigateur', 'Prouver l\'acceptation des conditions générales', 'Intérêt légitime ; obligations légales'],
          ['Données techniques : adresse IP, journaux de connexion et d\'erreurs, tentatives de connexion', 'Sécurité, prévention des abus, diagnostic', 'Intérêt légitime'],
          ['Emails envoyés et désinscriptions', 'Vous aider à prendre en main le Service (emails de démarrage), informations sur votre compte', 'Intérêt légitime ; exécution du contrat'],
          ['WhatsApp (si vous liez votre numéro) : numéro, messages échangés avec l\'assistant', 'Répondre à vos questions et vous envoyer des alertes', 'Votre demande (liaison volontaire du numéro)'],
          ['Messages reçus sur nos pages Facebook / Instagram', 'Répondre à vos messages', 'Intérêt légitime'],
        ]}
      />
      <P>Nous ne vendons pas vos données, ne faisons pas de publicité ciblée et ne les utilisons pas à d&apos;autres fins que celles ci-dessus.</P>

      <H2 id="ia">3. Intelligence artificielle</H2>
      <P>
        Lorsque vous utilisez l&apos;assistant (WhatsApp) ou écrivez à nos pages sur les réseaux sociaux, votre message,
        l&apos;historique récent de la conversation et, pour l&apos;assistant WhatsApp, un résumé des données financières
        de l&apos;entreprise liée (écritures récentes, soldes bancaires) sont transmis à notre prestataire d&apos;IA
        (Anthropic) uniquement pour générer la réponse. Selon ses conditions applicables à l&apos;usage professionnel,
        ce prestataire n&apos;utilise pas ces données pour entraîner ses modèles. Aucune décision produisant des effets
        juridiques à votre égard n&apos;est prise de façon automatisée.
      </P>

      <H2 id="prestataires">4. Destinataires et prestataires</H2>
      <P>
        Vos données sont accessibles uniquement à l&apos;éditeur et, pour une entreprise donnée, aux personnes que son
        titulaire y a invitées. Elles sont confiées aux prestataires techniques suivants, qui agissent sur nos
        instructions :
      </P>
      <Table
        head={['Prestataire', 'Rôle', 'Localisation']}
        rows={[
          ['Railway Corporation', 'Hébergement de l\'application et de la base de données', 'Serveurs en Europe de l\'Ouest (société américaine)'],
          ['Vercel Inc.', 'Hébergement du site web', 'Réseau mondial (société américaine)'],
          ['Stripe', 'Paiement par carte', 'Union européenne / États-Unis'],
          ['CinetPay', 'Paiement Mobile Money', 'Côte d\'Ivoire'],
          ['Brevo', 'Envoi des emails', 'France / Union européenne'],
          ['Twilio et Meta (WhatsApp)', 'Messagerie WhatsApp, si vous liez votre numéro', 'États-Unis / Union européenne'],
          ['Anthropic', 'Intelligence artificielle (voir article 3)', 'États-Unis'],
        ]}
      />
      <P>
        Lorsque des données sont transférées hors de l&apos;Union européenne, ces transferts sont encadrés par les
        garanties prévues par le RGPD (décision d&apos;adéquation, notamment le cadre de protection des données
        UE–États-Unis, ou clauses contractuelles types de la Commission européenne). Nous pouvons aussi communiquer
        des données aux autorités lorsque la loi l&apos;exige.
      </P>

      <H2 id="duree">5. Durées de conservation</H2>
      <Table
        head={['Données', 'Durée']}
        rows={[
          ['Compte et données comptables', `Pendant la durée du compte, puis ${PLANS.dataExportDays} jours après sa fermeture (pour vous permettre l\'export), puis suppression`],
          ['Factures et justificatifs de paiement', '10 ans (obligation comptable de l\'éditeur)'],
          ['Preuve d\'acceptation des conditions', 'Durée du compte + 5 ans (délai de prescription)'],
          ['Journaux techniques et de sécurité', '12 mois maximum'],
          ['Messages WhatsApp avec l\'assistant', 'Pendant la durée du compte'],
          ['Messages reçus sur les réseaux sociaux', '12 mois maximum'],
        ]}
      />

      <H2 id="securite">6. Sécurité</H2>
      <UL>
        <li>Échanges chiffrés (HTTPS) et en-têtes de sécurité sur le site et l&apos;application ;</li>
        <li>mots de passe stockés avec l&apos;algorithme argon2, jamais en clair ;</li>
        <li>cloisonnement des données : chaque entreprise n&apos;est accessible qu&apos;à son titulaire et aux membres qu&apos;il a invités ;</li>
        <li>limitation des tentatives de connexion et blocage temporaire des comptes visés ;</li>
        <li>vérification de l&apos;authenticité des messages reçus de nos prestataires (paiement, messagerie) ;</li>
        <li>hébergement chez des prestataires reconnus et sauvegardes de la base de données.</li>
      </UL>
      <P>En cas de violation de données susceptible de vous affecter, nous vous en informerons et notifierons la CNIL dans les conditions prévues par la loi.</P>

      <H2 id="cookies">7. Cookies et stockage local</H2>
      <P>
        Nous n&apos;utilisons <b>aucun cookie publicitaire ni outil de mesure d&apos;audience</b>. Le site enregistre
        uniquement, dans votre navigateur, les éléments strictement nécessaires à son fonctionnement : vos jetons de
        connexion (cookies) et vos préférences d&apos;affichage, comme l&apos;entreprise sélectionnée (stockage local).
        Ces éléments ne nécessitent pas votre consentement et sont effacés à la déconnexion.
      </P>
      <P>
        Les liens de nos emails passent par notre sous-domaine <i>em.visionrplus.com</i> (prestataire Brevo), qui
        permet de mesurer de façon statistique l&apos;ouverture et les clics. Vous pouvez à tout moment ne plus recevoir
        nos emails de conseils grâce au lien présent en bas de chacun d&apos;eux.
      </P>

      <H2 id="droits">8. Vos droits</H2>
      <P>
        Vous disposez des droits d&apos;accès, de rectification, d&apos;effacement, de limitation, de portabilité et
        d&apos;opposition, ainsi que du droit de définir des directives sur le sort de vos données après votre décès.
        Pour les exercer, écrivez à <a href={`mailto:${PUBLISHER.email}`} className="underline">{PUBLISHER.email}</a>{' '}
        depuis l&apos;adresse de votre compte ; nous répondons dans un délai d&apos;un mois. Vous pouvez également
        exporter vous-même vos écritures depuis l&apos;application.
      </P>
      <P>
        Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir la CNIL (www.cnil.fr — 3 place de
        Fontenoy, TSA 80715, 75334 Paris Cedex 07) ou l&apos;autorité de protection des données de votre pays.
      </P>

      <H2 id="sous-traitance">9. Données de vos propres clients, fournisseurs et salariés</H2>
      <P>
        Lorsque vous enregistrez dans Vision R+ des données personnelles de tiers (par exemple le nom d&apos;un client
        dans une écriture), vous en êtes le <b>responsable de traitement</b> et Vision R+ agit en{' '}
        <b>sous-traitant</b> au sens de l&apos;article 28 du RGPD. À ce titre, Vision R+ s&apos;engage à :
      </P>
      <UL>
        <li>ne traiter ces données que pour fournir le Service, sur vos instructions résultant de votre utilisation ;</li>
        <li>garantir la confidentialité de ces données et les protéger par les mesures de l&apos;article 6 ;</li>
        <li>ne recourir qu&apos;aux prestataires listés à l&apos;article 4, et vous informer de tout changement ;</li>
        <li>vous aider à répondre aux demandes d&apos;exercice de droits et vous notifier sans délai toute violation de données ;</li>
        <li>supprimer ces données à la fin du contrat, dans les conditions de l&apos;article 5, après vous avoir permis de les exporter.</li>
      </UL>

      <H2 id="modification">10. Modification de cette politique</H2>
      <P>
        Nous pouvons mettre à jour cette politique. En cas de changement important, vous en serez informé par email ou
        dans l&apos;application. Voir aussi les{' '}
        <Link href="/legal/cgu" className="underline">conditions générales</Link> et les{' '}
        <Link href="/legal/mentions-legales" className="underline">mentions légales</Link>.
      </P>
    </>
  );
}
