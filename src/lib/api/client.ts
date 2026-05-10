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

  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch<{ message: string }>('/auth/change-password', {
      current_password: currentPassword,
      new_password:     newPassword,
    }).then((r) => r.data),
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

  createFiscalYear: (id: string, data: { label: string; start_date: string; end_date: string }) =>
    api.post<FiscalYear>(`/companies/${id}/fiscal-years`, data).then((r) => r.data),
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

  deleteEntry: (companyId: string, entryId: string) =>
    api.delete(`/companies/${companyId}/entries/${entryId}`).then((r) => r.data),

  reverseEntry: (companyId: string, entryId: string, data: { reversal_date: string; libelle?: string }) =>
    api.post(`/companies/${companyId}/entries/${entryId}/reverse`, data).then((r) => r.data),

  deleteUnbalancedDrafts: (companyId: string) =>
    api.delete<{ deleted: number }>(`/companies/${companyId}/entries/unbalanced-drafts`).then((r) => r.data),

  importCsv: (companyId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<{ created: number; skipped: number; errors: string[] }>(
      `/companies/${companyId}/entries/import-csv`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60_000 },
    ).then((r) => r.data);
  },

  exportCsv: (companyId: string, fiscalYearId?: string) =>
    api.get<Blob>(`/companies/${companyId}/entries/export-csv`, {
      params:       fiscalYearId ? { fiscal_year_id: fiscalYearId } : undefined,
      responseType: 'blob',
    }).then((r) => r.data),
};

// ─────────────────────────────────────────────────────────────
//  ÉTATS FINANCIERS (redirige vers analytics)
// ─────────────────────────────────────────────────────────────
export const financialApi = {
  dashboard: (companyId: string, fiscalYearId: string) =>
    api.get<Dashboard>(`/companies/${companyId}/analytics/dashboard`, { params: { fiscal_year_id: fiscalYearId } })
       .then((r) => r.data),

  incomeStatement: (companyId: string, fiscalYearId: string) =>
    api.get<IncomeStatement>(`/companies/${companyId}/analytics/compte-resultat`, { params: { fiscal_year_id: fiscalYearId } })
       .then((r) => r.data),

  balanceSheet: (companyId: string, fiscalYearId: string) =>
    api.get<BalanceSheet>(`/companies/${companyId}/analytics/bilan`, { params: { fiscal_year_id: fiscalYearId } })
       .then((r) => r.data),
};

// ─────────────────────────────────────────────────────────────
//  IMMOBILISATIONS & AMORTISSEMENTS
// ─────────────────────────────────────────────────────────────
export const fixedAssetsApi = {
  list:  (companyId: string) =>
    api.get(`/companies/${companyId}/fixed-assets`).then(r => r.data),

  get: (companyId: string, id: string) =>
    api.get(`/companies/${companyId}/fixed-assets/${id}`).then(r => r.data),

  create: (companyId: string, data: any) =>
    api.post(`/companies/${companyId}/fixed-assets`, data).then(r => r.data),

  update: (companyId: string, id: string, data: any) =>
    api.patch(`/companies/${companyId}/fixed-assets/${id}`, data).then(r => r.data),

  dispose: (companyId: string, id: string, data: any) =>
    api.post(`/companies/${companyId}/fixed-assets/${id}/dispose`, data).then(r => r.data),

  depreciationTable: (companyId: string) =>
    api.get(`/companies/${companyId}/fixed-assets/depreciation-table`).then(r => r.data),

  postDepreciations: (companyId: string, fiscalYearId: string) =>
    api.post(`/companies/${companyId}/fixed-assets/post-depreciations/${fiscalYearId}`)
       .then(r => r.data),
};

// ─────────────────────────────────────────────────────────────
//  DOCUMENTS
// ─────────────────────────────────────────────────────────────
export const documentsApi = {
  list: (companyId: string, params?: Record<string, string>) =>
    api.get(`/companies/${companyId}/documents`, { params }).then(r => r.data),

  get: (companyId: string, id: string) =>
    api.get(`/companies/${companyId}/documents/${id}`).then(r => r.data),

  upload: (companyId: string, file: File, meta?: { document_type?: string; note?: string; journal_entry_id?: string }) => {
    const form = new FormData();
    form.append('file', file);
    if (meta?.document_type)    form.append('document_type',    meta.document_type);
    if (meta?.note)             form.append('note',             meta.note);
    if (meta?.journal_entry_id) form.append('journal_entry_id', meta.journal_entry_id);
    return api.post(`/companies/${companyId}/documents`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  fileUrl: (companyId: string, id: string) =>
    `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/v1/companies/${companyId}/documents/${id}/file`,

  link: (companyId: string, id: string, data: { journal_entry_id?: string }) =>
    api.patch(`/companies/${companyId}/documents/${id}/link`, data).then(r => r.data),

  delete: (companyId: string, id: string) =>
    api.delete(`/companies/${companyId}/documents/${id}`).then(r => r.data),

  stats: (companyId: string) =>
    api.get(`/companies/${companyId}/documents/stats`).then(r => r.data),
};

// ─────────────────────────────────────────────────────────────
//  FISCALITÉ & DSF
// ─────────────────────────────────────────────────────────────
export const taxApi = {
  list: (companyId: string) =>
    api.get(`/companies/${companyId}/tax-declarations`).then(r => r.data),

  create: (companyId: string, data: any) =>
    api.post(`/companies/${companyId}/tax-declarations`, data).then(r => r.data),

  validate: (companyId: string, id: string) =>
    api.patch(`/companies/${companyId}/tax-declarations/${id}/validate`).then(r => r.data),

  submit: (companyId: string, id: string) =>
    api.patch(`/companies/${companyId}/tax-declarations/${id}/submit`).then(r => r.data),

  generateDsf: (companyId: string, fiscalYearId: string) =>
    api.post(`/companies/${companyId}/dsf/generate`, { fiscal_year_id: fiscalYearId })
       .then(r => r.data),
};

// ─────────────────────────────────────────────────────────────
//  ANALYTICS & KPIs
// ─────────────────────────────────────────────────────────────
export const analyticsApi = {
  dashboard: (companyId: string, fiscalYearId: string) =>
    api.get(`/companies/${companyId}/analytics/dashboard`, { params: { fiscal_year_id: fiscalYearId } })
       .then(r => r.data),

  kpis: (companyId: string, fiscalYearId: string) =>
    api.get(`/companies/${companyId}/analytics/kpis`, { params: { fiscal_year_id: fiscalYearId } })
       .then(r => r.data),

  balance: (companyId: string, fiscalYearId: string) =>
    api.get(`/companies/${companyId}/analytics/balance`, { params: { fiscal_year_id: fiscalYearId } })
       .then(r => r.data),

  grandLivre: (companyId: string, fiscalYearId: string, accountCode?: string) =>
    api.get(`/companies/${companyId}/analytics/grand-livre`, {
      params: { fiscal_year_id: fiscalYearId, ...(accountCode && { account_code: accountCode }) },
    }).then(r => r.data),

  bilan: (companyId: string, fiscalYearId: string) =>
    api.get(`/companies/${companyId}/analytics/bilan`, { params: { fiscal_year_id: fiscalYearId } })
       .then(r => r.data),

  compteResultat: (companyId: string, fiscalYearId: string) =>
    api.get(`/companies/${companyId}/analytics/compte-resultat`, { params: { fiscal_year_id: fiscalYearId } })
       .then(r => r.data),
};

// ─────────────────────────────────────────────────────────────
//  BANQUE
// ─────────────────────────────────────────────────────────────
export const bankApi = {
  getAccounts: (companyId: string) =>
    api.get(`/companies/${companyId}/bank/accounts`).then(r => r.data),

  createAccount: (companyId: string, data: any) =>
    api.post(`/companies/${companyId}/bank/accounts`, data).then(r => r.data),

  getTransactions: (companyId: string, accountId: string) =>
    api.get(`/companies/${companyId}/bank/accounts/${accountId}/transactions`).then(r => r.data),

  importTransactions: (companyId: string, accountId: string, transactions: any[]) =>
    api.post(`/companies/${companyId}/bank/accounts/${accountId}/import`, { transactions })
       .then(r => r.data),

  getUnreconciled: (companyId: string, accountId: string) =>
    api.get(`/companies/${companyId}/bank/accounts/${accountId}/unreconciled`).then(r => r.data),

  reconcile: (companyId: string, bankTransactionId: string, journalLineId: string) =>
    api.post(`/companies/${companyId}/bank/reconcile`, {
      bank_transaction_id: bankTransactionId,
      journal_line_id:     journalLineId,
    }).then(r => r.data),
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
