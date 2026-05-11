'use client';
import { useEffect, useState } from 'react';
import { taxApi, analyticsApi, extractApiError } from '@/lib/api/client';
import { useCompanyStore } from '@/lib/store';

function fmt(n: number | undefined | null, currency = 'XAF') {
  if (!n && n !== 0) return '—';
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(n);
}

function Row({ label, montant, sublabel, bold }: { label: string; montant?: number; sublabel?: string; bold?: boolean }) {
  return (
    <tr style={{ borderBottom: '1px solid #d1d5db' }}>
      <td style={{ padding: '4px 8px', fontSize: 11, fontWeight: bold ? 700 : 400 }}>
        {label}{sublabel && <span style={{ color: '#6b7280', fontSize: 10, marginLeft: 4 }}>({sublabel})</span>}
      </td>
      <td style={{ padding: '4px 8px', textAlign: 'right', fontSize: 11, fontFamily: 'monospace', fontWeight: bold ? 700 : 400 }}>
        {montant !== undefined ? fmt(montant) : ''}
      </td>
    </tr>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <tr>
      <td colSpan={2} style={{
        background: '#1e293b', color: 'white', padding: '6px 8px',
        fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
      }}>
        {title}
      </td>
    </tr>
  );
}

export default function DsfPrintPage() {
  const { activeCompany, activeFiscalYear } = useCompanyStore();
  const [dsf, setDsf]         = useState<any>(null);
  const [bilan, setBilan]     = useState<any>(null);
  const [cr, setCr]           = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!activeCompany || !activeFiscalYear) return;
    Promise.all([
      taxApi.generateDsf(activeCompany.id, activeFiscalYear.id),
      analyticsApi.bilan(activeCompany.id, activeFiscalYear.id),
      analyticsApi.compteResultat(activeCompany.id, activeFiscalYear.id),
    ]).then(([dsfData, bilanData, crData]) => {
      setDsf(dsfData);
      setBilan(bilanData);
      setCr(crData);
    }).catch(e => setError(extractApiError(e)))
      .finally(() => setLoading(false));
  }, [activeCompany, activeFiscalYear]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Arial' }}>
      Chargement de la DSF…
    </div>
  );

  if (error || !dsf || !bilan || !cr) return (
    <div style={{ padding: 32, fontFamily: 'Arial', color: 'red' }}>
      {error || 'Sélectionnez une entreprise et un exercice.'}
    </div>
  );

  const company    = dsf.company ?? {};
  const fy         = dsf.fiscal_year ?? {};
  const currency   = activeCompany?.currency ?? 'XAF';
  const actif      = bilan.actif ?? {};
  const passif     = bilan.passif ?? {};
  const produits   = cr.produits ?? {};
  const charges    = cr.charges ?? {};
  const now        = new Date().toLocaleDateString('fr-FR');

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
          @page { size: A4; margin: 15mm 12mm; }
        }
        body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #111; background: white; }
        table { width: 100%; border-collapse: collapse; }
        .page-break { page-break-before: always; }
      `}</style>

      {/* ── Barre d'impression ── */}
      <div className="no-print" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: '#1e293b', color: 'white', padding: '10px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontWeight: 700 }}>DSF — Aperçu avant impression</span>
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

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 20px 40px' }}>

        {/* ════════════════════════════════════════
            PAGE 1 — EN-TÊTE & IDENTIFICATION
        ════════════════════════════════════════ */}
        <div style={{ textAlign: 'center', marginBottom: 24, borderBottom: '3px solid #1e293b', paddingBottom: 16 }}>
          <p style={{ fontSize: 10, color: '#6b7280', marginBottom: 4 }}>SYSTÈME COMPTABLE OHADA — SYSCOHADA RÉVISÉ</p>
          <h1 style={{ fontSize: 18, fontWeight: 900, margin: '4px 0', color: '#1e293b' }}>
            DÉCLARATION STATISTIQUE ET FISCALE (DSF)
          </h1>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
            Exercice : {fy.label} · Du {new Date(fy.start).toLocaleDateString('fr-FR')} au {new Date(fy.end).toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Identification */}
        <table style={{ marginBottom: 24, border: '1px solid #d1d5db' }}>
          <tbody>
            <SectionHeader title="I. IDENTIFICATION DE L'ENTREPRISE" />
            <Row label="Raison sociale" montant={undefined} />
            <tr>
              <td colSpan={2} style={{ padding: '6px 8px', fontSize: 12, fontWeight: 700, color: '#1e293b' }}>
                {company.name ?? activeCompany?.name}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #d1d5db' }}>
              <td style={{ padding: '4px 8px', fontSize: 11 }}>Pays</td>
              <td style={{ padding: '4px 8px', fontSize: 11 }}>{company.country ?? activeCompany?.country ?? '—'}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #d1d5db' }}>
              <td style={{ padding: '4px 8px', fontSize: 11 }}>Exercice social</td>
              <td style={{ padding: '4px 8px', fontSize: 11 }}>{fy.label}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #d1d5db' }}>
              <td style={{ padding: '4px 8px', fontSize: 11 }}>Système comptable</td>
              <td style={{ padding: '4px 8px', fontSize: 11 }}>SYSCOHADA révisé — Système Normal</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #d1d5db' }}>
              <td style={{ padding: '4px 8px', fontSize: 11 }}>Monnaie de tenue des comptes</td>
              <td style={{ padding: '4px 8px', fontSize: 11 }}>{currency}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 8px', fontSize: 11 }}>Date d'édition</td>
              <td style={{ padding: '4px 8px', fontSize: 11 }}>{now}</td>
            </tr>
          </tbody>
        </table>

        {/* Vérification */}
        <div style={{
          display: 'flex', gap: 16, marginBottom: 24,
        }}>
          {[
            { label: 'Bilan', ok: dsf.controles?.bilan_equilibre, msg: dsf.controles?.bilan_equilibre ? 'Équilibré' : `Écart : ${fmt(dsf.controles?.ecart_bilan)} ${currency}` },
            { label: 'Cohérence résultat', ok: dsf.controles?.coherence_resultat, msg: dsf.controles?.coherence_resultat ? 'Cohérent' : 'Écart détecté' },
          ].map(({ label, ok, msg }) => (
            <div key={label} style={{
              flex: 1, padding: '10px 14px', borderRadius: 8, border: `1px solid ${ok ? '#86efac' : '#fca5a5'}`,
              background: ok ? '#f0fdf4' : '#fef2f2',
            }}>
              <p style={{ fontSize: 10, color: '#6b7280', marginBottom: 2 }}>{label}</p>
              <p style={{ fontSize: 12, fontWeight: 700, color: ok ? '#16a34a' : '#dc2626' }}>
                {ok ? '✓' : '⚠'} {msg}
              </p>
            </div>
          ))}
        </div>

        {/* ════════════════════════════════════════
            PAGE 2 — BILAN ACTIF
        ════════════════════════════════════════ */}
        <div className="page-break" />
        <h2 style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', borderBottom: '2px solid #1e293b', paddingBottom: 6, marginBottom: 12 }}>
          II. BILAN — ACTIF (en {currency})
        </h2>

        <table style={{ border: '1px solid #d1d5db', marginBottom: 24 }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              <th style={{ padding: '6px 8px', textAlign: 'left', fontSize: 11, fontWeight: 700 }}>Rubrique</th>
              <th style={{ padding: '6px 8px', textAlign: 'right', fontSize: 11, fontWeight: 700 }}>Montant net ({currency})</th>
            </tr>
          </thead>
          <tbody>
            <SectionHeader title="ACTIF IMMOBILISÉ" />
            <Row label="Immobilisations incorporelles" sublabel="comptes 20-21" montant={actif.immobilisations?.incorporelles} />
            <Row label="Immobilisations corporelles" sublabel="comptes 22-25" montant={actif.immobilisations?.corporelles} />
            <Row label="Immobilisations financières" sublabel="comptes 26-27" montant={actif.immobilisations?.financieres} />
            <Row label="TOTAL ACTIF IMMOBILISÉ" montant={actif.immobilisations?.total} bold />

            <SectionHeader title="ACTIF CIRCULANT" />
            <Row label="Stocks et encours" sublabel="compte 3" montant={actif.actif_circulant?.stocks} />
            <Row label="Créances clients et comptes rattachés" sublabel="compte 411" montant={actif.actif_circulant?.creances_clients} />
            <Row label="Autres créances" sublabel="comptes 4 hors 401/411" montant={actif.actif_circulant?.autres_creances} />
            <Row label="TOTAL ACTIF CIRCULANT" montant={actif.actif_circulant?.total} bold />

            <SectionHeader title="TRÉSORERIE ACTIF" />
            <Row label="Disponibilités" sublabel="compte 5" montant={actif.tresorerie_actif} />

            <tr style={{ background: '#1e293b', color: 'white' }}>
              <td style={{ padding: '8px', fontSize: 13, fontWeight: 900 }}>TOTAL GÉNÉRAL ACTIF</td>
              <td style={{ padding: '8px', textAlign: 'right', fontSize: 13, fontFamily: 'monospace', fontWeight: 900 }}>
                {fmt(actif.total_actif)} {currency}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ════════════════════════════════════════
            PAGE 3 — BILAN PASSIF
        ════════════════════════════════════════ */}
        <div className="page-break" />
        <h2 style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', borderBottom: '2px solid #1e293b', paddingBottom: 6, marginBottom: 12 }}>
          III. BILAN — PASSIF (en {currency})
        </h2>

        <table style={{ border: '1px solid #d1d5db', marginBottom: 24 }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              <th style={{ padding: '6px 8px', textAlign: 'left', fontSize: 11, fontWeight: 700 }}>Rubrique</th>
              <th style={{ padding: '6px 8px', textAlign: 'right', fontSize: 11, fontWeight: 700 }}>Montant ({currency})</th>
            </tr>
          </thead>
          <tbody>
            <SectionHeader title="CAPITAUX PROPRES" />
            <Row label="Capital social ou personnel" sublabel="compte 10" montant={passif.capitaux_propres?.capital} />
            <Row label="Réserves et report à nouveau" sublabel="comptes 11-12" montant={passif.capitaux_propres?.reserves} />
            <Row label="Résultat net de l'exercice" montant={passif.capitaux_propres?.resultat_net} bold />
            <Row label="TOTAL CAPITAUX PROPRES" montant={passif.capitaux_propres?.total} bold />

            <SectionHeader title="DETTES FINANCIÈRES" />
            <Row label="Emprunts et dettes financières (long terme)" sublabel="comptes 16-17" montant={passif.dettes_financieres?.emprunts_lt} />
            <Row label="TOTAL DETTES FINANCIÈRES" montant={passif.dettes_financieres?.total} bold />

            <SectionHeader title="PASSIF CIRCULANT" />
            <Row label="Fournisseurs et comptes rattachés" sublabel="compte 401" montant={passif.passif_circulant?.fournisseurs} />
            <Row label="Autres dettes" sublabel="comptes 4 hors 401" montant={passif.passif_circulant?.autres_dettes} />
            <Row label="TOTAL PASSIF CIRCULANT" montant={passif.passif_circulant?.total} bold />

            <SectionHeader title="TRÉSORERIE PASSIF" />
            <Row label="Concours bancaires et soldes créditeurs" montant={passif.tresorerie_passif} />

            <tr style={{ background: '#1e293b', color: 'white' }}>
              <td style={{ padding: '8px', fontSize: 13, fontWeight: 900 }}>TOTAL GÉNÉRAL PASSIF</td>
              <td style={{ padding: '8px', textAlign: 'right', fontSize: 13, fontFamily: 'monospace', fontWeight: 900 }}>
                {fmt(passif.total_passif)} {currency}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ════════════════════════════════════════
            PAGE 4 — COMPTE DE RÉSULTAT
        ════════════════════════════════════════ */}
        <div className="page-break" />
        <h2 style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', borderBottom: '2px solid #1e293b', paddingBottom: 6, marginBottom: 12 }}>
          IV. COMPTE DE RÉSULTAT (en {currency})
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          {/* Produits */}
          <table style={{ border: '1px solid #d1d5db' }}>
            <thead>
              <tr style={{ background: '#f0fdf4' }}>
                <th colSpan={2} style={{ padding: '6px 8px', textAlign: 'center', fontSize: 12, fontWeight: 800, color: '#16a34a' }}>
                  PRODUITS — {fmt(produits.total_produits)} {currency}
                </th>
              </tr>
            </thead>
            <tbody>
              <Row label="Chiffre d'affaires (70-72)" montant={produits.chiffre_affaires} />
              <Row label="Subventions d'exploitation (74)" montant={produits.subventions_expl} />
              <Row label="Produits financiers (76)" montant={produits.produits_financiers} />
              <Row label="Autres produits (73-75-77-79)" montant={produits.autres_produits} />
              <Row label="TOTAL PRODUITS" montant={produits.total_produits} bold />
            </tbody>
          </table>

          {/* Charges */}
          <table style={{ border: '1px solid #d1d5db' }}>
            <thead>
              <tr style={{ background: '#fef2f2' }}>
                <th colSpan={2} style={{ padding: '6px 8px', textAlign: 'center', fontSize: 12, fontWeight: 800, color: '#dc2626' }}>
                  CHARGES — {fmt(charges.total_charges)} {currency}
                </th>
              </tr>
            </thead>
            <tbody>
              <Row label="Achats et var. stocks (60-61)" montant={charges.achats_variation_stocks} />
              <Row label="Services extérieurs (62)" montant={charges.services_exterieurs} />
              <Row label="Impôts et taxes (63)" montant={charges.impots_taxes} />
              <Row label="Charges de personnel (64)" montant={charges.charges_personnel} />
              <Row label="Autres charges (65-67)" montant={charges.autres_charges} />
              <Row label="Charges financières (66)" montant={charges.charges_financieres} />
              <Row label="Dotations amort./prov. (68)" montant={charges.dotations_amortissements} />
              <Row label="Impôt sur résultat (89/69)" montant={charges.impot_sur_resultat} />
              <Row label="TOTAL CHARGES" montant={charges.total_charges} bold />
            </tbody>
          </table>
        </div>

        {/* Résultat net */}
        <div style={{
          background: cr.nature_resultat === 'benefice' ? '#f0fdf4' : '#fef2f2',
          border: `2px solid ${cr.nature_resultat === 'benefice' ? '#86efac' : '#fca5a5'}`,
          borderRadius: 8, padding: '14px 20px', marginBottom: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <p style={{ fontSize: 10, color: '#6b7280', marginBottom: 2 }}>RÉSULTAT NET DE L'EXERCICE</p>
            <p style={{ fontSize: 22, fontWeight: 900, color: cr.nature_resultat === 'benefice' ? '#16a34a' : '#dc2626' }}>
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

        {/* ════════════════════════════════════════
            PAGE 5 — TABLEAU IMMOBILISATIONS
        ════════════════════════════════════════ */}
        {dsf.tableau_immobilisations?.length > 0 && (
          <>
            <div className="page-break" />
            <h2 style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', borderBottom: '2px solid #1e293b', paddingBottom: 6, marginBottom: 12 }}>
              V. TABLEAU DES IMMOBILISATIONS (en {currency})
            </h2>
            <table style={{ border: '1px solid #d1d5db', marginBottom: 24 }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  {['Désignation', 'Valeur brute', 'Dot. exercice', 'Amort. cumulés', 'VNC'].map(h => (
                    <th key={h} style={{ padding: '6px 8px', fontSize: 11, fontWeight: 700, textAlign: h === 'Désignation' ? 'left' : 'right' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dsf.tableau_immobilisations.map((a: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '4px 8px', fontSize: 11 }}>{a.nom}</td>
                    <td style={{ padding: '4px 8px', fontSize: 11, textAlign: 'right', fontFamily: 'monospace' }}>{fmt(a.valeur_brute)}</td>
                    <td style={{ padding: '4px 8px', fontSize: 11, textAlign: 'right', fontFamily: 'monospace', color: '#d97706' }}>{fmt(a.dotation_exercice)}</td>
                    <td style={{ padding: '4px 8px', fontSize: 11, textAlign: 'right', fontFamily: 'monospace', color: '#6b7280' }}>{fmt(a.amort_cumules)}</td>
                    <td style={{ padding: '4px 8px', fontSize: 11, textAlign: 'right', fontFamily: 'monospace', color: '#059669', fontWeight: 700 }}>{fmt(a.valeur_nette)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Signature */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginTop: 40, paddingTop: 20, borderTop: '1px solid #d1d5db' }}>
          <div>
            <p style={{ fontSize: 10, color: '#6b7280', marginBottom: 32 }}>Le Directeur Général / Le Gérant</p>
            <div style={{ borderTop: '1px solid #374151', paddingTop: 4 }}>
              <p style={{ fontSize: 10, color: '#6b7280' }}>Signature et cachet</p>
            </div>
          </div>
          <div>
            <p style={{ fontSize: 10, color: '#6b7280', marginBottom: 4 }}>Établi le : {now}</p>
            <p style={{ fontSize: 10, color: '#6b7280' }}>Généré par Vision R+ — {activeCompany?.name}</p>
            <p style={{ fontSize: 9, color: '#9ca3af', marginTop: 24 }}>
              Document généré automatiquement sur la base des écritures comptables validées.
              À faire certifier par un expert-comptable avant dépôt officiel.
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
