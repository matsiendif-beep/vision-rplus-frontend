// ============================================================
//  VISION R+ — Client API (Axios)
//  Toutes les méthodes de consommation de l'API REST backend
// ============================================================
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import type {
  AuthResponse, User,
  Company, CompanyStats, FiscalYear,
  AccountsResponse, Account,
  PaginatedEntries, JournalEntry,
  IncomeStatement, BalanceSheet, Dashboard,
  LoginForm, RegisterForm, CreateEntryForm,
} from '@/types';

// ── Instance Axios ────────────────────────────────────────────
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
    : '/api/v1',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Intercepteur requête : injecter le token JWT ──────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get('access_token');
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ── Intercepteur réponse : gérer les 401 (token expiré) ──────
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  },
);

// ─────────────────────────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────────────────────────
export const authApi = {
  login: (data: LoginForm) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  register: (data: RegisterForm) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  me: () =>
    api.get<User>('/auth/me').then((r) => r.data),
};

// ─────────────────────────────────────────────────────────────
//  COMPANIES
// ─────────────────────────────────────────────────────────────
export const companiesApi = {
  list: () =>
    api.get<{ owned: Company[]; shared: Company[] }>('/companies').then((r) => r.data),

  get: (id: string) =>
    api.get<Company>(`/companies/${id}`).then((r) => r.data),

  create: (data: Partial<Company>) =>
    api.post<Company>('/companies', data).then((r) => r.data),

  update: (id: string, data: Partial<Company>) =>
    api.patch<Company>(`/companies/${id}`, data).then((r) => r.data),

  remove: (id: string) =>
    api.delete(`/companies/${id}`).then((r) => r.data),

  stats: (id: string) =>
    api.get<CompanyStats>(`/companies/${id}/stats`).then((r) => r.data),

  fiscalYears: (id: string) =>
    api.get<FiscalYear[]>(`/companies/${id}/fiscal-years`).then((r) => r.data),
};

// ─────────────────────────────────────────────────────────────
//  ACCOUNTS
// ─────────────────────────────────────────────────────────────
export const accountsApi = {
  list: (companyId: string, params?: Record<string, string>) =>
    api.get<AccountsResponse>(`/companies/${companyId}/accounts`, { params })
       .then((r) => r.data),

  search: (companyId: string, q: string) =>
    api.get<Account[]>(`/companies/${companyId}/accounts/search`, { params: { q } })
       .then((r) => r.data),

  get: (companyId: string, accountId: string) =>
    api.get<Account>(`/companies/${companyId}/accounts/${accountId}`).then((r) => r.data),

  create: (companyId: string, data: Partial<Account>) =>
    api.post<Account>(`/companies/${companyId}/accounts`, data).then((r) => r.data),

  update: (companyId: string, accountId: string, data: Partial<Account>) =>
    api.patch<Account>(`/companies/${companyId}/accounts/${accountId}`, data)
       .then((r) => r.data),

  remove: (companyId: string, accountId: string) =>
    api.delete(`/companies/${companyId}/accounts/${accountId}`).then((r) => r.data),
};

// ─────────────────────────────────────────────────────────────
//  JOURNAL
// ─────────────────────────────────────────────────────────────
export const journalApi = {
  listEntries: (companyId: string, params?: Record<string, string | number>) =>
    api.get<PaginatedEntries>(`/companies/${companyId}/entries`, { params })
       .then((r) => r.data),

  getEntry: (companyId: string, entryId: string) =>
    api.get<JournalEntry>(`/companies/${companyId}/entries/${entryId}`).then((r) => r.data),

  createEntry: (companyId: string, data: CreateEntryForm) =>
    api.post<JournalEntry>(`/companies/${companyId}/entries`, data).then((r) => r.data),

  updateEntry: (companyId: string, entryId: string, data: Partial<CreateEntryForm>) =>
    api.patch<JournalEntry>(`/companies/${companyId}/entries/${entryId}`, data)
       .then((r) => r.data),

  validateEntry: (companyId: string, entryId: string) =>
    api.post<JournalEntry>(`/companies/${companyId}/entries/${entryId}/validate`)
       .then((r) => r.data),

  reverseEntry: (companyId: string, entryId: string, data: { reversal_date: string; libelle?: string }) =>
    api.post(`/companies/${companyId}/entries/${entryId}/reverse`, data).then((r) => r.data),
};

// ─────────────────────────────────────────────────────────────
//  ÉTATS FINANCIERS
// ─────────────────────────────────────────────────────────────
export const financialApi = {
  dashboard: (companyId: string, fiscalYearId: string) =>
    api.get<Dashboard>(`/companies/${companyId}/fiscal-years/${fiscalYearId}/dashboard`)
       .then((r) => r.data),

  incomeStatement: (companyId: string, fiscalYearId: string) =>
    api.get<IncomeStatement>(`/companies/${companyId}/fiscal-years/${fiscalYearId}/income-statement`)
       .then((r) => r.data),

  balanceSheet: (companyId: string, fiscalYearId: string) =>
    api.get<BalanceSheet>(`/companies/${companyId}/fiscal-years/${fiscalYearId}/balance-sheet`)
       .then((r) => r.data),
};

// ── Helpers ───────────────────────────────────────────────────
export const extractApiError = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    const msg = (err.response?.data as any)?.message;
    if (Array.isArray(msg)) return msg.join(' · ');
    return msg ?? err.message;
  }
  return 'Erreur inattendue';
};

export default api;
