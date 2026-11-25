import type { Metadata } from 'next';
import Link from 'next/link';
import { DocTitle, H2, P } from '../_components';
import { PUBLISHER, siretLabel } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Mentions légales — Vision R+',
};

export default function MentionsLegalesPage() {
  return (
    <>
      <DocTitle version={false}>Mentions légales</DocTitle>

      <H2>Éditeur du site et du service</H2>
      <P>
        <b>{PUBLISHER.name}</b>, {PUBLISHER.status.toLowerCase()} exploitant le service « Vision R+ »<br />
        {siretLabel()}<br />
        Adresse : {PUBLISHER.address}<br />
        Téléphone : <a href={`tel:${PUBLISHER.phoneIntl}`} className="underline">{PUBLISHER.phone}</a><br />
        Email : <a href={`mailto:${PUBLISHER.email}`} className="underline">{PUBLISHER.email}</a><br />
        TVA non applicable, article 293 B du Code général des impôts.
      </P>

      <H2>Directeur de la publication</H2>
      <P>{PUBLISHER.name}</P>

      <H2>Hébergement</H2>
      <P>
        <b>Site web :</b> Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis — vercel.com<br />
        <b>Application et base de données :</b> Railway Corporation, 548 Market St PMB 68956, San Francisco, CA 94104,
        États-Unis — railway.com (serveurs situés en Europe de l&apos;Ouest)
      </P>

      <H2>Propriété intellectuelle</H2>
      <P>
        La marque Vision R+, le site, le logiciel et leurs contenus (textes, graphismes, code) sont protégés. Toute
        reproduction ou réutilisation sans autorisation écrite préalable est interdite.
      </P>

      <H2>Données personnelles</H2>
      <P>
        Le traitement de vos données est décrit dans notre{' '}
        <Link href="/legal/confidentialite" className="underline">politique de confidentialité</Link>. Les conditions
        d&apos;utilisation et de vente sont disponibles <Link href="/legal/cgu" className="underline">ici</Link>.
      </P>
    </>
  );
}
