'use client';
import { useEffect, useState } from 'react';
import { analyticsApi, extractApiError } from '@/lib/api/client';
import { useCompanyStore } from '@/lib/store';

function fmt(n: number | undefined | null) {
  if (!n && n !== 0) return '';
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(n);
}

function LigneActif({ ref: ref_, libelle, brut, amort, net }: { ref: string; libelle: string; brut?: number; amort?: number; net?: number }) {
  return (
    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
      <td style={{ padding: '3px 6px', fontSize: 10, fontWeight: 600, color: '#6b7280', width: 36 }}>{ref_}</td>
      <td style={{ padding: '3px 6px', fontSize: 10 }}>{libelle}</td>
      <td style={{ padding: '3px 6px', fontSize: 10, textAlign: 'right', fontFamily: 'monospace' }}>{fmt(brut)}</td>
      <td style={{ padding: '3px 6px', fontSize: 10, textAlign: 'right', fontFamily: 'monospace', color: '#6b7280' }}>{amort ? fmt(amort) : ''}</td>
      <td style={{ padding: '3px 6px', fontSize: 10, textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(net ?? brut)}</td>
    </tr>
  );
}

function LigneTotal({ ref: ref_, libelle, net, brut }: { ref: string; libelle: string; net?: number; brut?: number }) {
  return (
    <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
      <td style={{ padding: '5px 6px', fontSize: 10, fontWeight: 700, color: '#1e293b' }}>{ref_}</td>
      <td style={{ padding: '5px 6px', fontSize: 10, fontWeight: 700, color: '#1e293b' }}>{libelle}</td>
      <td style={{ padding: '5px 6px', fontSize: 10, textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>{fmt(brut)}</td>
      <td></td>
      <td style={{ padding: '5px 6px', fontSize: 10, textAlign: 'right', fontFamily: 'monospace', fontWeight: 900, color: '#1e293b' }}>{fmt(net ?? brut)}</td>
    </tr>
  );
}

function LigneCR({ ref: ref_, libelle, montant, isTotal }: { ref: string; libelle: string; montant?: number; isTotal?: boolean }) {
  return (
    <tr style={{ borderBottom: '1px solid #e5e7eb', background: isTotal ? '#f1f5f9' : undefined }}>
      <td style={{ padding: '3px 6px', fontSize: 10, fontWeight: 600, color: '#6b7280', width: 36 }}>{ref_}</td>
      <td style={{ padding: '3px 6px', fontSize: 10, fontWeight: isTotal ? 700 : 400 }}>{libelle}</td>
      <td style={{ padding: '3px 6px', fontSize: 10, textAlign: 'right', fontFamily: 'monospace', fontWeight: isTotal ? 900 : 400 }}>{fmt(montant)}</td>
    </tr>
  );
}

export default function LiassePrintPage() {
  const { activeCompany, activeFiscalYear } = useCompanyStore();
  const [bilan, setBilan]   = useState<any>(null);
  const [cr, setCr]         = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    if (!activeCompany || !activeFiscalYear) return;
    Promise.all([
      analyticsApi.bilan(activeCompany.id, activeFiscalYear.id),
      analyticsApi.compteResultat(activeCompany.id, activeFiscalYear.id),
    ]).then(([bilanData, crData]) => {
      setBilan(bilanData);
      setCr(crData);
    }).catch(e => setError(extractApiError(e)))
      .finally(() => setLoading(false));
  }, [activeCompany, activeFiscalYear]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Arial' }}>
      Chargement de la liasse…
    </div>
  );
  if (error || !bilan || !cr) return (
    <div style={{ padding: 32, fontFamily: 'Arial', color: 'red' }}>
      {error || 'Sélectionnez une entreprise et un exercice.'}
    </div>
  );

  const actif    = bilan.actif ?? {};
  const passif   = bilan.passif ?? {};
  const produits = cr.produits ?? {};
  const charges  = cr.charges ?? {};
  const currency = activeCompany?.currency ?? 'EUR';
  const now      = new Date().toLocaleDateString('fr-FR');
  const fy       = activeFiscalYear!;

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
          @page { size: A4; margin: 12mm 10mm; }
        }
        body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #111; background: white; }
        table { width: 100%; border-collapse: collapse; }
        .page-break { page-break-before: always; }
      `}</style>

      {/* Barre impression */}
      <div className="no-print" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: '#1e293b', color: 'white', padding: '10px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontWeight: 700 }}>Liasse fiscale PCG France — Aperçu avant impression</span>
        <button
          onClick={() => window.print()}
          style={{
            background: '#f97316', color: 'white', border: 'none',
            padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 700,
          }}
        >
          Télécharger / Imprimer le PDF
        </button>
      </div>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '60px 16px 40px' }}>

        {/* En-tête formulaire */}
        <div style={{ border: '2px solid #1e293b', padding: '10px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: 8, color: '#6b7280', marginBottom: 2 }}>DIRECTION GÉNÉRALE DES FINANCES PUBLIQUES — PCG FRANCE</p>
            <h1 style={{ fontSize: 15, fontWeight: 900, color: '#1e293b', margin: '2px 0' }}>FORMULAIRE 2050 — BILAN</h1>
            <p style={{ fontSize: 10 }}>Exercice {fy.label} · {new Date(fy.start_date).getFullYear()}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, fontWeight: 700 }}>{activeCompany?.name}</p>
            <p style={{ fontSize: 10, color: '#6b7280' }}>Monnaie : {currency}</p>
            <p style={{ fontSize: 10, color: '#6b7280' }}>Édité le {now}</p>
          </div>
        </div>

        {/* ════════════════════════════ BILAN ACTIF ════════════════════════════ */}
        <h2 style={{ fontSize: 12, fontWeight: 800, background: '#1e293b', color: 'white', padding: '5px 10px', marginBottom: 0 }}>
          ACTIF
        </h2>
        <table style={{ border: '1px solid #d1d5db', marginBottom: 20 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ width: 36, padding: '4px 6px', fontSize: 10, textAlign: 'left' }}>Réf.</th>
              <th style={{ padding: '4px 6px', fontSize: 10, textAlign: 'left' }}>POSTES DU BILAN</th>
              <th style={{ padding: '4px 6px', fontSize: 10, textAlign: 'right', width: 110 }}>Brut</th>
              <th style={{ padding: '4px 6px', fontSize: 10, textAlign: 'right', width: 110 }}>Amort./Dép.</th>
              <th style={{ padding: '4px 6px', fontSize: 10, textAlign: 'right', width: 110 }}>Net</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ background: '#f1f5f9' }}>
              <td colSpan={5} style={{ padding: '4px 6px', fontSize: 10, fontWeight: 700 }}>ACTIF IMMOBILISÉ</td>
            </tr>
            <LigneActif ref_="AA" libelle="Frais d'établissement et charges à répartir" net={0} />
            <LigneActif ref_="AB" libelle="Frais de recherche et de développement" net={0} />
            <LigneActif ref_="AC" libelle="Concessions, brevets, licences, fonds commercial" net={actif.immobilisations?.incorporelles} />
            <LigneActif ref_="AD" libelle="Autres immobilisations incorporelles" net={0} />
            <LigneActif ref_="AE" libelle="Terrains" net={0} />
            <LigneActif ref_="AF" libelle="Constructions" net={0} />
            <LigneActif ref_="AG" libelle="Installations techniques, matériel, outillage" net={actif.immobilisations?.corporelles} />
            <LigneActif ref_="AH" libelle="Autres immobilisations corporelles" net={0} />
            <LigneActif ref_="AI" libelle="Immobilisations en cours" net={0} />
            <LigneActif ref_="AJ" libelle="Participations et créances rattachées" net={actif.immobilisations?.financieres} />
            <LigneTotal ref_="AK" libelle="TOTAL ACTIF IMMOBILISÉ (AA à AJ)" net={actif.immobilisations?.total} />

            <tr style={{ background: '#f1f5f9' }}>
              <td colSpan={5} style={{ padding: '4px 6px', fontSize: 10, fontWeight: 700 }}>ACTIF CIRCULANT</td>
            </tr>
            <LigneActif ref_="BL" libelle="Stocks et en-cours (matières premières, marchandises)" net={actif.actif_circulant?.stocks} />
            <LigneActif ref_="BM" libelle="Avances et acomptes versés sur commandes" net={0} />
            <LigneActif ref_="BN" libelle="Créances clients et comptes rattachés" net={actif.actif_circulant?.creances_clients} />
            <LigneActif ref_="BP" libelle="Autres créances" net={actif.actif_circulant?.autres_creances} />
            <LigneActif ref_="BQ" libelle="Valeurs mobilières de placement" net={0} />
            <LigneActif ref_="BR" libelle="Disponibilités (banque, caisse)" net={actif.tresorerie_actif} />
            <LigneActif ref_="BS" libelle="Charges constatées d'avance" net={0} />
            <LigneTotal ref_="BT" libelle="TOTAL ACTIF CIRCULANT (BL à BS)" net={(actif.actif_circulant?.total ?? 0) + (actif.tresorerie_actif ?? 0)} />

            <tr style={{ background: '#1e293b', color: 'white' }}>
              <td style={{ padding: '7px 6px', fontSize: 12, fontWeight: 900 }}>BU</td>
              <td colSpan={3} style={{ padding: '7px 6px', fontSize: 12, fontWeight: 900 }}>TOTAL GÉNÉRAL ACTIF (AK + BT)</td>
              <td style={{ padding: '7px 6px', fontSize: 12, textAlign: 'right', fontFamily: 'monospace', fontWeight: 900 }}>
                {fmt(actif.total_actif)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ════════════════════════════ BILAN PASSIF ════════════════════════════ */}
        <div className="page-break" />
        <div style={{ border: '2px solid #1e293b', padding: '8px 16px', marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 8, color: '#6b7280' }}>DIRECTION GÉNÉRALE DES FINANCES PUBLIQUES — PCG FRANCE</p>
            <h1 style={{ fontSize: 15, fontWeight: 900, color: '#1e293b', margin: '2px 0' }}>FORMULAIRE 2050 — BILAN (suite)</h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, fontWeight: 700 }}>{activeCompany?.name}</p>
            <p style={{ fontSize: 10, color: '#6b7280' }}>Exercice {fy.label}</p>
          </div>
        </div>

        <h2 style={{ fontSize: 12, fontWeight: 800, background: '#1e293b', color: 'white', padding: '5px 10px', marginBottom: 0 }}>
          PASSIF
        </h2>
        <table style={{ border: '1px solid #d1d5db', marginBottom: 20 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ width: 36, padding: '4px 6px', fontSize: 10, textAlign: 'left' }}>Réf.</th>
              <th style={{ padding: '4px 6px', fontSize: 10, textAlign: 'left' }}>POSTES DU BILAN</th>
              <th colSpan={2} style={{ padding: '4px 6px', fontSize: 10 }}></th>
              <th style={{ padding: '4px 6px', fontSize: 10, textAlign: 'right', width: 110 }}>Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ background: '#f1f5f9' }}>
              <td colSpan={5} style={{ padding: '4px 6px', fontSize: 10, fontWeight: 700 }}>CAPITAUX PROPRES</td>
            </tr>
            <LigneActif ref_="CA" libelle="Capital social ou personnel (dont versé : …)" net={passif.capitaux_propres?.capital} />
            <LigneActif ref_="CB" libelle="Primes d'émission, de fusion, d'apport" net={0} />
            <LigneActif ref_="CC" libelle="Écarts de réévaluation" net={0} />
            <LigneActif ref_="CD" libelle="Réserves — légale, statutaires, réglementées" net={passif.capitaux_propres?.reserves} />
            <LigneActif ref_="CE" libelle="Report à nouveau" net={0} />
            <LigneActif ref_="CG" libelle="Résultat de l'exercice (bénéfice ou perte)" net={passif.capitaux_propres?.resultat_net} />
            <LigneActif ref_="CH" libelle="Subventions d'investissement" net={0} />
            <LigneTotal ref_="CI" libelle="TOTAL CAPITAUX PROPRES (CA à CH)" net={passif.capitaux_propres?.total} />

            <tr style={{ background: '#f1f5f9' }}>
              <td colSpan={5} style={{ padding: '4px 6px', fontSize: 10, fontWeight: 700 }}>PROVISIONS</td>
            </tr>
            <LigneActif ref_="DA" libelle="Provisions pour risques et charges" net={0} />

            <tr style={{ background: '#f1f5f9' }}>
              <td colSpan={5} style={{ padding: '4px 6px', fontSize: 10, fontWeight: 700 }}>DETTES</td>
            </tr>
            <LigneActif ref_="DI" libelle="Emprunts et dettes auprès des établissements de crédit" net={passif.dettes_financieres?.emprunts_lt} />
            <LigneActif ref_="DK" libelle="Emprunts et dettes financières divers" net={0} />
            <LigneActif ref_="DM" libelle="Avances et acomptes reçus sur commandes" net={0} />
            <LigneActif ref_="DN" libelle="Dettes fournisseurs et comptes rattachés" net={passif.passif_circulant?.fournisseurs} />
            <LigneActif ref_="DP" libelle="Dettes fiscales et sociales" net={passif.passif_circulant?.autres_dettes} />
            <LigneActif ref_="DQ" libelle="Dettes sur immobilisations et comptes rattachés" net={0} />
            <LigneActif ref_="DS" libelle="Autres dettes" net={0} />
            <LigneActif ref_="DT" libelle="Produits constatés d'avance" net={0} />
            <LigneTotal ref_="DV" libelle="TOTAL DETTES (DI à DT)" net={(passif.dettes_financieres?.total ?? 0) + (passif.passif_circulant?.total ?? 0)} />

            <tr style={{ background: '#1e293b', color: 'white' }}>
              <td style={{ padding: '7px 6px', fontSize: 12, fontWeight: 900 }}>DZ</td>
              <td colSpan={3} style={{ padding: '7px 6px', fontSize: 12, fontWeight: 900 }}>TOTAL GÉNÉRAL PASSIF (CI + DA + DV)</td>
              <td style={{ padding: '7px 6px', fontSize: 12, textAlign: 'right', fontFamily: 'monospace', fontWeight: 900 }}>
                {fmt(passif.total_passif)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ════════════════════ COMPTE DE RÉSULTAT (2051) ════════════════════ */}
        <div className="page-break" />
        <div style={{ border: '2px solid #1e293b', padding: '8px 16px', marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 8, color: '#6b7280' }}>DIRECTION GÉNÉRALE DES FINANCES PUBLIQUES — PCG FRANCE</p>
            <h1 style={{ fontSize: 15, fontWeight: 900, color: '#1e293b', margin: '2px 0' }}>FORMULAIRE 2051 — COMPTE DE RÉSULTAT</h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, fontWeight: 700 }}>{activeCompany?.name}</p>
            <p style={{ fontSize: 10, color: '#6b7280' }}>Exercice {fy.label}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {/* Produits */}
          <div>
            <h3 style={{ fontSize: 11, fontWeight: 800, background: '#059669', color: 'white', padding: '4px 8px', marginBottom: 0 }}>PRODUITS D'EXPLOITATION</h3>
            <table style={{ border: '1px solid #d1d5db' }}>
              <tbody>
                <LigneCR ref_="FA" libelle="Ventes de marchandises" montant={0} />
                <LigneCR ref_="FB" libelle="Production vendue (biens et services)" montant={produits.chiffre_affaires} />
                <LigneCR ref_="FC" libelle="Production stockée / immobilisée" montant={0} />
                <LigneCR ref_="FD" libelle="Subventions d'exploitation" montant={produits.subventions_expl} />
                <LigneCR ref_="FE" libelle="Reprises / transferts de charges" montant={0} />
                <LigneCR ref_="FF" libelle="Autres produits" montant={produits.autres_produits} />
                <LigneCR ref_="FG" libelle="TOTAL PRODUITS D'EXPLOITATION" montant={produits.total_produits} isTotal />
                <LigneCR ref_="FM" libelle="Produits financiers" montant={produits.produits_financiers} />
                <LigneCR ref_="FP" libelle="Produits exceptionnels" montant={0} />
                <LigneCR ref_="FR" libelle="TOTAL GÉNÉRAL PRODUITS" montant={produits.total_produits} isTotal />
              </tbody>
            </table>
          </div>

          {/* Charges */}
          <div>
            <h3 style={{ fontSize: 11, fontWeight: 800, background: '#dc2626', color: 'white', padding: '4px 8px', marginBottom: 0 }}>CHARGES D'EXPLOITATION</h3>
            <table style={{ border: '1px solid #d1d5db' }}>
              <tbody>
                <LigneCR ref_="GA" libelle="Achats de marchandises (+ var. stocks)" montant={charges.achats_variation_stocks} />
                <LigneCR ref_="GB" libelle="Achats de matières premières (+/- var.)" montant={0} />
                <LigneCR ref_="GC" libelle="Autres achats et charges externes (61-62)" montant={charges.services_exterieurs} />
                <LigneCR ref_="GD" libelle="Impôts, taxes et versements assimilés" montant={charges.impots_taxes} />
                <LigneCR ref_="GE" libelle="Salaires et traitements" montant={charges.charges_personnel} />
                <LigneCR ref_="GF" libelle="Charges sociales (63-64-67)" montant={charges.autres_charges} />
                <LigneCR ref_="GG" libelle="Dotations aux amortissements et provisions" montant={charges.dotations_amortissements} />
                <LigneCR ref_="GH" libelle="Autres charges" montant={0} />
                <LigneCR ref_="GI" libelle="TOTAL CHARGES D'EXPLOITATION" montant={charges.total_charges} isTotal />
                <LigneCR ref_="GR" libelle="Charges financières" montant={charges.charges_financieres} />
                <LigneCR ref_="GS" libelle="Charges exceptionnelles" montant={0} />
                <LigneCR ref_="GV" libelle="Impôt sur les bénéfices" montant={charges.impot_sur_resultat} />
                <LigneCR ref_="GZ" libelle="TOTAL GÉNÉRAL CHARGES" montant={charges.total_charges} isTotal />
              </tbody>
            </table>
          </div>
        </div>

        {/* Résultat */}
        <div style={{
          background: cr.nature_resultat === 'benefice' ? '#f0fdf4' : '#fef2f2',
          border: `2px solid ${cr.nature_resultat === 'benefice' ? '#86efac' : '#fca5a5'}`,
          borderRadius: 8, padding: '14px 20px', marginBottom: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <p style={{ fontSize: 9, color: '#6b7280', marginBottom: 2 }}>HJ — RÉSULTAT DE L'EXERCICE (bénéfice ou perte)</p>
            <p style={{ fontSize: 22, fontWeight: 900, fontFamily: 'monospace', color: cr.nature_resultat === 'benefice' ? '#16a34a' : '#dc2626' }}>
              {fmt(cr.resultat_net)} {currency}
            </p>
          </div>
          <div style={{
            background: cr.nature_resultat === 'benefice' ? '#16a34a' : '#dc2626',
            color: 'white', borderRadius: 8, padding: '8px 16px', fontWeight: 800, fontSize: 14,
          }}>
            {cr.nature_resultat === 'benefice' ? 'BÉNÉFICE' : 'PERTE'}
          </div>
        </div>

        {/* Signature */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, paddingTop: 16, borderTop: '1px solid #d1d5db' }}>
          <div>
            <p style={{ fontSize: 9, color: '#6b7280', marginBottom: 28 }}>Le représentant légal</p>
            <div style={{ borderTop: '1px solid #374151', paddingTop: 4 }}>
              <p style={{ fontSize: 9, color: '#6b7280' }}>Nom, qualité, signature et cachet</p>
            </div>
          </div>
          <div>
            <p style={{ fontSize: 9, color: '#6b7280' }}>Établi le : {now}</p>
            <p style={{ fontSize: 9, color: '#6b7280' }}>Généré par Vision R+ — {activeCompany?.name}</p>
            <p style={{ fontSize: 8, color: '#9ca3af', marginTop: 16 }}>
              Ce document est généré automatiquement sur la base des écritures comptables validées.
              Il doit être signé par le représentant légal et peut nécessiter une certification
              par un expert-comptable avant dépôt auprès de l'administration fiscale.
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
