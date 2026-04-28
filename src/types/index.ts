// ============================================================
//  VISION R+ — Types TypeScript complets (sync avec le backend)
// ============================================================

// ── Enums ─────────────────────────────────────────────────────

export type AccountingSystem = 'ohada' | 'pcg_france';
export type AccountType      = 'actif' | 'passif' | 'charge' | 'produit' | 'tresorerie' | 'analytique';
export type JournalType      = 'achats' | 'ventes' | 'banque' | 'caisse' | 'od' | 'salaires' | 'actif';
export type EntryStatus      = 'brouillon' | 'validee' | 'annulee';
export type MemberRole       = 'admin' | 'comptable' | 'lecture';
export type Plan             = 'free' | 'pro' | 'cabinet';
export type Currency         = 'EUR' | 'XAF' | 'XOF' | 'USD' | 'GBP' | 'MAD' | 'TND';

// ── Auth ──────────────────────────────────────────────────────

export interface User {
  id:           string;
  email:        string;
  first_name:   string;
  last_name:    string;
  phone?:       string;
  avatar_url?:  string;
  plan:         Plan;
  is_verified:  boolean;
  created_at:   string;
  _count?: { owned_companies: number };
}

export interface AuthTokens {
  access_token:  string;
  refresh_token: string;
}

export interface AuthResponse {
  user:   User;
  access_token:  string;
  refresh_token: string;
}

// ── Company ───────────────────────────────────────────────────

export interface Company {
  id:                string;
  owner_id:          string;
  name:              string;
  legal_form?:       string;
  siret?:            string;
  rccm?:             string;
  nif?:              string;
  accounting_system: AccountingSystem;
  currency:          Currency;
  country:           string;
  address?:          string;
  city?:             string;
  postal_code?:      string;
  phone?:            string;
  email?:            string;
  logo_url?:         string;
  fiscal_year_start: string;
  fiscal_year_end:   string;
  is_active:         boolean;
  created_at:        string;
  fiscal_years?:     FiscalYear[];
  _count?: {
    journal_entries: number;
    accounts:        number;
    third_parties:   number;
  };
}

export interface FiscalYear {
  id:         string;
  company_id: string;
  label:      string;
  start_date: string;
  end_date:   string;
  is_closed:  boolean;
  closed_at?: string;
  created_at: string;
}

export interface CompanyStats {
  entryCount:    number;
  validatedCount: number;
  accounts:      number;
  currentYear:   FiscalYear | null;
}

// ── Account ───────────────────────────────────────────────────

export interface Account {
  id:          string;
  company_id?: string;
  code:        string;
  label:       string;
  type:        AccountType;
  system:      AccountingSystem;
  parent_code?: string;
  is_detail:   boolean;
  is_active:   boolean;
  created_at:  string;
}

export interface AccountsResponse {
  accounts: Account[];
  grouped:  Record<string, Account[]>;
  total:    number;
}

// ── Journal ───────────────────────────────────────────────────

export interface JournalLine {
  id:          string;
  entry_id:    string;
  company_id:  string;
  account_id:  string;
  libelle?:    string;
  debit:       string;   // Decimal as string from Prisma
  credit:      string;
  line_order:  number;
  account?: {
    code:   string;
    label:  string;
    type:   AccountType;
    system: AccountingSystem;
  };
}

export interface JournalEntry {
  id:              string;
  company_id:      string;
  fiscal_year_id:  string;
  journal_type:    JournalType;
  entry_date:      string;
  reference?:      string;
  libelle:         string;
  status:          EntryStatus;
  total_debit:     string;
  total_credit:    string;
  attachment_url?: string;
  created_by:      string;
  validated_by?:   string;
  validated_at?:   string;
  created_at:      string;
  updated_at:      string;
  lines?:          JournalLine[];
  fiscal_year?: {
    label:      string;
    start_date: string;
    end_date:   string;
  };
  creator?: {
    first_name: string;
    last_name:  string;
    email:      string;
  };
  validator?: {
    first_name: string;
    last_name:  string;
  };
}

export interface PaginatedEntries {
  data: JournalEntry[];
  pagination: {
    total:       number;
    page:        number;
    limit:       number;
    total_pages: number;
  };
}

// ── Financial States ──────────────────────────────────────────

export interface AccountBalance {
  account_id:    string;
  account_code:  string;
  account_label: string;
  account_type:  AccountType;
  total_debit:   number;
  total_credit:  number;
  solde:         number;
  nature:        'debiteur' | 'crediteur';
}

export interface IncomeStatement {
  produits:        AccountBalance[];
  charges:         AccountBalance[];
  total_produits:  number;
  total_charges:   number;
  resultat_net:    number;
  nature_resultat: 'benefice' | 'perte' | 'equilibre';
}

export interface BalanceSheet {
  actif: {
    immobilisations:  AccountBalance[];
    stocks:           AccountBalance[];
    creances:         AccountBalance[];
    tresorerie:       AccountBalance[];
    total_actif:      number;
  };
  passif: {
    capitaux_propres:           AccountBalance[];
    dettes_fournisseurs:        AccountBalance[];
    dettes_fiscales_sociales:   AccountBalance[];
    emprunts:                   AccountBalance[];
    resultat_exercice:          number;
    total_passif:               number;
  };
  is_balanced:  boolean;
  ecart_bilan:  number;
}

export interface MonthlyPoint {
  month:     string;
  produits:  number;
  charges:   number;
  tresorerie: number;
  resultat:  number;
}

export interface Dashboard {
  cash_balance:      number;
  total_produits:    number;
  total_charges:     number;
  resultat_net:      number;
  nature_resultat:   'benefice' | 'perte' | 'equilibre';
  monthly_evolution: MonthlyPoint[];
  pending_entries:   number;
  generated_at:      string;
}

// ── Forms ─────────────────────────────────────────────────────

export interface LoginForm {
  email:    string;
  password: string;
}

export interface RegisterForm extends LoginForm {
  first_name: string;
  last_name:  string;
  phone?:     string;
}

export interface JournalLineForm {
  account_id: string;
  libelle?:   string;
  debit:      number;
  credit:     number;
}

export interface CreateEntryForm {
  fiscal_year_id: string;
  journal_type:   JournalType;
  entry_date:     string;
  libelle:        string;
  reference?:     string;
  lines:          JournalLineForm[];
}

// ── API Errors ────────────────────────────────────────────────

export interface ApiError {
  statusCode: number;
  error:      string;
  message:    string | string[];
  timestamp:  string;
  path:       string;
}
