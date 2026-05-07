'use client';
import { useState, useEffect, useCallback } from 'react';
import { financialApi, analyticsApi, companiesApi, journalApi, extractApiError } from '@/lib/api/client';
import { useCompanyStore } from '@/lib/store';
import type { Dashboard, IncomeStatement, BalanceSheet, PaginatedEntries, Company, AccountBalance } from '@/types';

// ── Helpers de transformation backend → types frontend ────────

function makeRow(id: string, code: string, label: string, solde: number): AccountBalance {
  return {
    account_id:    id,
    account_code:  code,
    account_label: label,
    account_type:  'charge' as any,
    total_debit:   solde >= 0 ? solde : 0,
    total_credit:  solde < 0 ? -solde : 0,
    solde:         Math.abs(solde),
    nature:        'debiteur',
  };
}

function mapDashboard(raw: any): Dashboard {
  const s = raw.synthese ?? {};
  return {
    cash_balance:      s.tresorerie      ?? 0,
    total_produits:    s.total_produits  ?? 0,
    total_charges:     s.total_charges   ?? 0,
    resultat_net:      s.resultat_net    ?? 0,
    nature_resultat:   (s.nature === 'benefice' ? 'benefice' : s.nature === 'perte' ? 'perte' : 'equilibre'),
    monthly_evolution: (raw.evolution ?? []).map((e: any) => ({
      month:      e.mois,
      produits:   e.produits,
      charges:    e.charges,
      tresorerie: 0,
      resultat:   e.produits - e.charges,
    })),
    pending_entries: 0,
    generated_at:    new Date().toISOString(),
  };
}

function mapIncomeStatement(raw: any): IncomeStatement {
  const p = raw.produits ?? {};
  const c = raw.charges  ?? {};
  const produits: AccountBalance[] = [
    makeRow('70-72', '70-72', "Chiffre d'affaires",            p.chiffre_affaires    ?? 0),
    makeRow('74',    '74',    "Subventions d'exploitation",     p.subventions_expl    ?? 0),
    makeRow('75-79', '75-79', 'Autres produits d\'exploitation',p.autres_produits     ?? 0),
    makeRow('76',    '76',    'Produits financiers',            p.produits_financiers ?? 0),
  ].filter(r => r.solde > 0);

  const charges: AccountBalance[] = [
    makeRow('60-61', '60-61', 'Achats et variation de stocks',  c.achats_variation_stocks  ?? 0),
    makeRow('62',    '62',    'Services extérieurs',            c.services_exterieurs       ?? 0),
    makeRow('63',    '63',    'Impôts et taxes',                c.impots_taxes              ?? 0),
    makeRow('64',    '64',    'Charges de personnel',           c.charges_personnel         ?? 0),
    makeRow('65',    '65',    'Autres charges d\'exploitation',  c.autres_charges            ?? 0),
    makeRow('66',    '66',    'Charges financières',            c.charges_financieres       ?? 0),
    makeRow('68',    '68',    'Dotations aux amortissements',   c.dotations_amortissements  ?? 0),
    makeRow('89',    '89',    "Impôt sur le résultat",          c.impot_sur_resultat        ?? 0),
  ].filter(r => r.solde > 0);

  return {
    produits,
    charges,
    total_produits:  raw.produits?.total_produits ?? 0,
    total_charges:   raw.charges?.total_charges   ?? 0,
    resultat_net:    raw.resultat_net             ?? 0,
    nature_resultat: raw.nature === 'benefice' ? 'benefice' : raw.nature === 'perte' ? 'perte' : 'equilibre',
  };
}

function mapBalanceSheet(raw: any): BalanceSheet {
  const a  = raw.actif   ?? {};
  const p  = raw.passif  ?? {};
  const im = a.immobilisations  ?? {};
  const ac = a.actif_circulant  ?? {};
  const cp = p.capitaux_propres ?? {};
  const df = p.dettes_financieres ?? {};
  const pc = p.passif_circulant ?? {};

  const immobilisations: AccountBalance[] = [
    makeRow('21', '20-21', 'Immobilisations incorporelles', im.incorporelles ?? 0),
    makeRow('22', '22-25', 'Immobilisations corporelles',   im.corporelles   ?? 0),
    makeRow('26', '26-28', 'Immobilisations financières',   im.financieres   ?? 0),
  ].filter(r => r.solde !== 0);

  const stocks: AccountBalance[] = [
    makeRow('3', '3', 'Stocks et encours', ac.stocks ?? 0),
  ].filter(r => r.solde !== 0);

  const creances: AccountBalance[] = [
    makeRow('411', '411-412', 'Créances clients',   ac.creances_clients ?? 0),
    makeRow('4x',  '4xx',     'Autres créances',    ac.autres_creances  ?? 0),
  ].filter(r => r.solde !== 0);

  const tresoActif: AccountBalance[] = [
    makeRow('5', '5', 'Trésorerie', a.tresorerie_actif ?? 0),
  ].filter(r => r.solde !== 0);

  const capitauxPropres: AccountBalance[] = [
    makeRow('101', '101-104', 'Capital',     cp.capital     ?? 0),
    makeRow('11',  '11-13',   'Réserves',    cp.reserves    ?? 0),
    makeRow('13',  'Résultat','Résultat net', cp.resultat_net ?? 0),
  ].filter(r => r.solde !== 0);

  const emprunts: AccountBalance[] = [
    makeRow('16', '16-18', 'Emprunts à long terme', df.emprunts_lt ?? 0),
  ].filter(r => r.solde !== 0);

  const dettesF: AccountBalance[] = [
    makeRow('401', '401-402', 'Fournisseurs',   pc.fournisseurs  ?? 0),
    makeRow('4xx', '4xx',     'Autres dettes',  pc.autres_dettes ?? 0),
  ].filter(r => r.solde !== 0);

  const totalA = a.total_actif  ?? 0;
  const totalP = p.total_passif ?? 0;

  return {
    actif: {
      immobilisations,
      stocks,
      creances,
      tresorerie: tresoActif,
      total_actif: totalA,
    },
    passif: {
      capitaux_propres:         capitauxPropres,
      dettes_fournisseurs:      dettesF,
      dettes_fiscales_sociales: [],
      emprunts,
      resultat_exercice: cp.resultat_net ?? 0,
      total_passif:      totalP,
    },
    is_balanced: raw.equilibre ?? Math.abs(totalA - totalP) < 1,
    ecart_bilan: Math.abs(totalA - totalP),
  };
}

// ── Hook : dashboard ──────────────────────────────────────────
export function useDashboard() {
  const { activeCompany, activeFiscalYear } = useCompanyStore();
  const [data,    setData]    = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!activeCompany || !activeFiscalYear) return;
    setLoading(true);
    setError(null);
    try {
      const raw = await analyticsApi.dashboard(activeCompany.id, activeFiscalYear.id);
      setData(mapDashboard(raw));
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, [activeCompany, activeFiscalYear]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

// ── Hook : compte de résultat ─────────────────────────────────
export function useIncomeStatement() {
  const { activeCompany, activeFiscalYear } = useCompanyStore();
  const [data,    setData]    = useState<IncomeStatement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!activeCompany || !activeFiscalYear) return;
    setLoading(true);
    analyticsApi.compteResultat(activeCompany.id, activeFiscalYear.id)
      .then((raw) => setData(mapIncomeStatement(raw)))
      .catch((e) => setError(extractApiError(e)))
      .finally(() => setLoading(false));
  }, [activeCompany?.id, activeFiscalYear?.id]);

  return { data, loading, error };
}

// ── Hook : bilan ──────────────────────────────────────────────
export function useBalanceSheet() {
  const { activeCompany, activeFiscalYear } = useCompanyStore();
  const [data,    setData]    = useState<BalanceSheet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!activeCompany || !activeFiscalYear) return;
    setLoading(true);
    analyticsApi.bilan(activeCompany.id, activeFiscalYear.id)
      .then((raw) => setData(mapBalanceSheet(raw)))
      .catch((e) => setError(extractApiError(e)))
      .finally(() => setLoading(false));
  }, [activeCompany?.id, activeFiscalYear?.id]);

  return { data, loading, error };
}

// ── Hook : journal ────────────────────────────────────────────
export function useJournal(params?: Record<string, string | number>) {
  const { activeCompany }     = useCompanyStore();
  const [data,    setData]    = useState<PaginatedEntries | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!activeCompany) return;
    setLoading(true);
    setError(null);
    try {
      const result = await journalApi.listEntries(activeCompany.id, params);
      setData(result);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, [activeCompany, JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

// ── Hook : entreprises ────────────────────────────────────────
export function useCompanies() {
  const { setCompanies } = useCompanyStore();
  const [data,    setData]    = useState<{ owned: Company[]; shared: Company[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await companiesApi.list();
      setData(result);
      setCompanies([...result.owned, ...result.shared]);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, [setCompanies]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}
