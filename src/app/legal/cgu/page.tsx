import type { Metadata } from 'next';
import Link from 'next/link';
import { DocTitle, H2, P, UL, Table } from '../_components';
import { PUBLISHER, PLANS, fcfa, siretLabel } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Conditions générales d\'utilisation et de vente — Vision R+',
};

const eur = (n: number) => `${n} €`;

export default function CguPage() {
  return (
    <>
      <DocTitle>Conditions générales d&apos;utilisation et de vente</DocTitle>

      <H2 id="objet">1. Objet et acceptation</H2>
      <P>
        Les présentes conditions générales (les « Conditions ») régissent l&apos;accès et l&apos;utilisation du logiciel
        en ligne <b>Vision R+</b>, accessible sur {PUBLISHER.site} et ses applications (le « Service »), ainsi que la
        souscription des formules payantes.
      </P>
      <P>
        Le Service est édité par {PUBLISHER.name}, {PUBLISHER.status.toLowerCase()}, {PUBLISHER.address}{' '}
        — {siretLabel()} —, ci-après « Vision R+ » ou « nous ». Toute personne qui crée un compte est ci-après
        le « Client » ou « vous ».
      </P>
      <P>
        La création d&apos;un compte suppose l&apos;acceptation expresse des Conditions, par une case à cocher.
        La date et la version acceptées sont enregistrées. Les Conditions applicables sont celles en vigueur à la
        date de l&apos;acceptation, sous réserve de l&apos;article 14.
      </P>

      <H2 id="public">2. Public concerné</H2>
      <P>
        Le Service est destiné aux <b>professionnels</b> : entreprises, entrepreneurs, associations, cabinets
        d&apos;expertise comptable et toute personne agissant pour les besoins de son activité professionnelle,
        en France et dans les pays de l&apos;espace OHADA. En créant un compte, vous déclarez agir dans ce cadre
        et avoir la capacité d&apos;engager la structure pour laquelle vous utilisez le Service.
      </P>

      <H2 id="service">3. Description du Service</H2>
      <P>Vision R+ est un outil d&apos;aide à la tenue de la comptabilité selon le SYSCOHADA révisé et le Plan comptable général français. Il permet notamment :</P>
      <UL>
        <li>la saisie et l&apos;import (fichier CSV, enregistrable depuis Excel) d&apos;écritures comptables, le journal, le grand livre et la balance ;</li>
        <li>la production du bilan, du compte de résultat et d&apos;indicateurs financiers ;</li>
        <li>la gestion des immobilisations et des amortissements, de la banque et du rapprochement bancaire ;</li>
        <li>l&apos;aide à la préparation des déclarations fiscales (TVA, IS, DSF) et le stockage de pièces justificatives ;</li>
        <li>la gestion de plusieurs entreprises et l&apos;invitation de collaborateurs.</li>
      </UL>
      <P>
        <b>Vision R+ est un outil, pas un cabinet comptable.</b> Il ne fournit ni prestation d&apos;expertise
        comptable, ni conseil juridique ou fiscal. Les états, calculs et déclarations sont produits à partir des
        données que vous saisissez : vous restez seul responsable de leur exactitude, de leur vérification, du
        respect de vos obligations comptables et fiscales et des délais de déclaration. Nous vous recommandons de
        faire valider vos comptes annuels et vos déclarations par un professionnel habilité.
      </P>
      <P>
        Une entreprise de démonstration fictive peut être créée pour découvrir le Service ; ses données n&apos;ont
        aucune valeur réelle.
      </P>

      <H2 id="compte">4. Compte et sécurité</H2>
      <UL>
        <li>Vous fournissez des informations exactes et les tenez à jour.</li>
        <li>Vos identifiants sont personnels et confidentiels : toute action réalisée avec eux est réputée faite par vous. Prévenez-nous sans délai de toute utilisation non autorisée.</li>
        <li>Le titulaire d&apos;une entreprise peut y inviter des collaborateurs ; il est responsable des accès qu&apos;il accorde et de leur retrait.</li>
        <li>Après plusieurs tentatives de connexion infructueuses, l&apos;accès au compte est temporairement bloqué pour le protéger.</li>
      </UL>

      <H2 id="formules">5. Formules et prix</H2>
      <Table
        head={['Formule', 'Prix mensuel', 'Entreprises', 'Écritures']}
        rows={[
          [<b key="f">{PLANS.free.name}</b>, 'Gratuit', `${PLANS.free.companies} entreprise active`, `${PLANS.free.entries} par mois civil`],
          [<b key="p">{PLANS.pro.name}</b>, `${eur(PLANS.pro.eur)} ou ${fcfa(PLANS.pro.xaf)}`, `${PLANS.pro.companies} entreprises actives`, 'Illimitées'],
          [<b key="c">{PLANS.cabinet.name}</b>, `${eur(PLANS.cabinet.eur)} ou ${fcfa(PLANS.cabinet.xaf)}`,
            `${PLANS.cabinet.companies} entreprises actives incluses, puis ${eur(PLANS.cabinetExtra.eur)} ou ${fcfa(PLANS.cabinetExtra.xaf)} par mois et par entreprise supplémentaire`, 'Illimitées'],
        ]}
      />
      <UL>
        <li>Toutes les fonctions disponibles du Service sont accessibles dans chaque formule, dans la limite du nombre d&apos;entreprises et d&apos;écritures indiqué.</li>
        <li>Le quota de la formule Gratuit s&apos;apprécie par mois civil, sur l&apos;ensemble des entreprises du compte ; l&apos;entreprise de démonstration n&apos;est pas comptée. Un import dépassant le quota restant est refusé en entier.</li>
        <li>Les entreprises supplémentaires de la formule Cabinet sont ajoutées sur demande à {PUBLISHER.email} et facturées avec l&apos;abonnement, par mois entier.</li>
        <li>La formule Cabinet comprend en outre la gestion multi-utilisateurs et un accompagnement personnalisé à la prise en main.</li>
        <li>
          Les fonctions présentées comme « Bientôt disponible » sur le site (notamment l&apos;assistant IA comptable,
          l&apos;intégration WhatsApp Business et l&apos;API) <b>ne font pas partie</b> des formules tant qu&apos;elles ne
          sont pas effectivement mises à disposition. Leur absence ne constitue pas un manquement et ne donne droit à
          aucun remboursement.
        </li>
        <li>Prix nets. TVA non applicable, article 293 B du Code général des impôts. Les éventuels taxes, frais bancaires ou frais d&apos;opérateur Mobile Money propres au pays du Client restent à sa charge.</li>
        <li>Nous pouvons modifier nos prix en vous prévenant par email au moins 30 jours à l&apos;avance ; le nouveau prix s&apos;applique au renouvellement suivant, et vous pouvez résilier avant.</li>
      </UL>

      <H2 id="paiement">6. Souscription, essai et paiement</H2>
      <P><b>Par carte bancaire (Stripe).</b></P>
      <UL>
        <li>La première souscription à la formule Pro ou Cabinet comprend un essai gratuit de {PLANS.trialDays} jours. La carte est enregistrée à la souscription ; si vous ne résiliez pas avant la fin de l&apos;essai, le premier mois est prélevé à son terme.</li>
        <li>L&apos;abonnement est mensuel et se renouvelle automatiquement chaque mois, payable d&apos;avance.</li>
        <li>Les paiements sont traités par Stripe ; Vision R+ n&apos;a jamais accès à vos numéros de carte.</li>
      </UL>
      <P><b>Par Mobile Money (CinetPay : Orange Money, MTN, etc.).</b></P>
      <UL>
        <li>Chaque paiement donne accès à la formule choisie pendant 30 jours, sans renouvellement automatique. Pour continuer, il suffit de payer à nouveau.</li>
      </UL>
      <P>
        <b>Défaut de paiement.</b> En cas d&apos;échec de paiement, nous vous en informons et le paiement peut être
        représenté. Sans régularisation, l&apos;abonnement prend fin et le compte repasse à la formule Gratuit : vos
        données sont conservées et restent consultables et exportables, mais les limites de la formule Gratuit
        s&apos;appliquent aux nouvelles créations.
      </P>

      <H2 id="resiliation">7. Durée, résiliation et remboursement</H2>
      <UL>
        <li>Les abonnements sont <b>sans engagement</b>. Vous pouvez résilier à tout moment depuis l&apos;espace de gestion de l&apos;abonnement de l&apos;application, ou en écrivant à {PUBLISHER.email}.</li>
        <li>La résiliation prend effet à la fin de la période déjà payée ; le compte repasse alors à la formule Gratuit.</li>
        <li><b>Aucun remboursement</b> n&apos;est dû pour la période en cours, sauf droit de rétractation ci-dessous ou disposition légale contraire.</li>
        <li>
          <b>Droit de rétractation.</b> Si vous êtes un professionnel employant cinq salariés au plus et que le
          contrat n&apos;entre pas dans le champ de votre activité principale (article L. 221-3 du Code de la
          consommation), vous disposez de 14 jours à compter de la souscription payante pour vous rétracter, par
          email à {PUBLISHER.email}. En demandant à utiliser le Service dès la souscription, vous acceptez de régler
          la part correspondant à la période déjà utilisée ; le solde vous est remboursé sous 14 jours.
        </li>
        <li>Vous pouvez à tout moment demander la fermeture de votre compte à {PUBLISHER.email}.</li>
      </UL>

      <H2 id="donnees">8. Vos données</H2>
      <UL>
        <li>Vous restez propriétaire de toutes les données que vous saisissez ou importez. Nous ne les utilisons que pour fournir le Service, conformément à notre <Link href="/legal/confidentialite" className="underline">politique de confidentialité</Link>.</li>
        <li>Vous pouvez exporter vos écritures à tout moment (CSV et fichier des écritures comptables — FEC).</li>
        <li>Après la fermeture du compte, vos données restent exportables pendant <b>{PLANS.dataExportDays} jours</b> sur demande, puis sont définitivement supprimées.</li>
        <li><b>Conservation légale :</b> le Service ne remplace pas votre obligation de conserver vos documents et pièces comptables (10 ans en France et dans l&apos;espace OHADA). Exportez et archivez régulièrement vos données.</li>
        <li>Pour les données personnelles de tiers que vous enregistrez (clients, fournisseurs, salariés…), vous êtes responsable de traitement et Vision R+ agit en sous-traitant, dans les conditions de l&apos;article 9 de la politique de confidentialité.</li>
      </UL>

      <H2 id="disponibilite">9. Disponibilité et sécurité</H2>
      <P>
        Nous faisons nos meilleurs efforts pour que le Service soit accessible en permanence, sans pouvoir le
        garantir : des interruptions peuvent survenir pour maintenance, mise à jour ou incident, y compris chez nos
        hébergeurs et prestataires. Nous vous prévenons des maintenances prévues lorsque c&apos;est possible.
        Le Service est hébergé chez des prestataires reconnus, les échanges sont chiffrés (HTTPS) et les mots de passe
        sont stockés sous forme chiffrée. Les mesures de sécurité sont décrites dans la politique de confidentialité.
      </P>

      <H2 id="ia">10. Fonctions d&apos;assistance automatisée</H2>
      <P>
        Certaines fonctions s&apos;appuient sur l&apos;intelligence artificielle (réponses automatiques, assistance).
        Leurs réponses sont fournies à titre indicatif, peuvent comporter des erreurs et ne constituent pas un conseil
        professionnel. Vérifiez-les avant toute décision.
      </P>

      <H2 id="usage">11. Usages interdits</H2>
      <P>Il est interdit d&apos;utiliser le Service pour :</P>
      <UL>
        <li>une activité illégale, frauduleuse, de blanchiment ou de dissimulation ;</li>
        <li>porter atteinte à sa sécurité, le surcharger, contourner ses limites ou accéder aux données d&apos;autrui ;</li>
        <li>copier, revendre ou décompiler le Service, ou créer des comptes de façon automatisée.</li>
      </UL>
      <P>
        En cas de manquement grave, nous pouvons suspendre le compte, après vous en avoir informé sauf urgence ou
        obligation légale, puis le résilier. Vos données restent exportables dans les conditions de l&apos;article 8.
      </P>

      <H2 id="responsabilite">12. Responsabilité</H2>
      <UL>
        <li>Vision R+ est tenu d&apos;une obligation de moyens.</li>
        <li>Nous ne sommes pas responsables des conséquences des données saisies par le Client, de leur interprétation, ni des décisions, déclarations ou paiements effectués sur la base des états produits par le Service.</li>
        <li>Nous ne répondons pas des dommages indirects (perte de chiffre d&apos;affaires, de clientèle, de données non exportées, pénalités fiscales…).</li>
        <li>Dans tous les cas, notre responsabilité totale est limitée aux sommes payées par le Client au cours des 12 mois précédant le fait générateur.</li>
        <li>Ces limites ne s&apos;appliquent pas en cas de faute lourde ou intentionnelle, ni lorsque la loi l&apos;interdit.</li>
      </UL>

      <H2 id="pi">13. Propriété intellectuelle</H2>
      <P>
        Le Service, son code, sa marque et ses contenus restent la propriété de Vision R+. Nous vous accordons un
        droit d&apos;utilisation personnel, non exclusif et non transférable, pour la durée de votre compte et dans la
        limite de votre formule.
      </P>

      <H2 id="modification">14. Modification des Conditions</H2>
      <P>
        Nous pouvons faire évoluer les Conditions. Toute modification importante vous est notifiée par email ou dans
        l&apos;application au moins 30 jours avant son entrée en vigueur ; la nouvelle version vous est présentée à
        votre connexion et doit être acceptée pour continuer à utiliser le Service. Si vous la refusez, vous pouvez
        résilier sans frais avant son entrée en vigueur.
      </P>

      <H2 id="droit">15. Droit applicable et litiges</H2>
      <P>
        Les Conditions sont soumises au <b>droit français</b>. En cas de difficulté, écrivez-nous d&apos;abord à{' '}
        {PUBLISHER.email} : nous rechercherons une solution amiable dans un délai de 30 jours. À défaut, tout litige
        relèvera de la compétence exclusive des {PUBLISHER.court}, sauf règle légale impérative contraire.
      </P>

      <H2 id="contact">16. Contact</H2>
      <P>
        {PUBLISHER.name} — {PUBLISHER.address} — {PUBLISHER.email} — {PUBLISHER.phone}.
        Voir aussi les <Link href="/legal/mentions-legales" className="underline">mentions légales</Link>.
      </P>
    </>
  );
}
