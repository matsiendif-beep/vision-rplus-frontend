'use client';
import { useState, useEffect, useCallback } from 'react';
import { financialApi, companiesApi, journalApi, extractApiError } from '@/lib/api/client';
import { useCompanyStore } from '@/lib/store';
import type { Dashboard, IncomeStatement, BalanceSheet, PaginatedEntries, Company } from '@/types';

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
      const result = await financialApi.dashboard(activeCompany.id, activeFiscalYear.id);
      setData(result);
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
    financialApi.incomeStatement(activeCompany.id, activeFiscalYear.id)
      .then(setData)
      .catch((e) => setError(extractApiError(e)))
      .finally(() => setLoading(false));
  }, [activeCompany, activeFiscalYear]);

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
    financialApi.balanceSheet(activeCompany.id, activeFiscalYear.id)
      .then(setData)
      .catch((e) => setError(extractApiError(e)))
      .finally(() => setLoading(false));
  }, [activeCompany, activeFiscalYear]);

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
