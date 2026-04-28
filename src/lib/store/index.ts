// ============================================================
//  VISION R+ — Store Zustand
//  État global : auth + entreprise active
// ============================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import type { User, Company, FiscalYear } from '@/types';

// ── Auth Store ────────────────────────────────────────────────
interface AuthState {
  user:          User | null;
  isAuthenticated: boolean;
  setUser:       (user: User, access_token: string, refresh_token: string) => void;
  logout:        () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:            null,
      isAuthenticated: false,

      setUser: (user, access_token, refresh_token) => {
        // Stocker les tokens dans les cookies (HttpOnly idéal mais on utilise js-cookie)
        Cookies.set('access_token',  access_token,  { expires: 7,  secure: true, sameSite: 'strict' });
        Cookies.set('refresh_token', refresh_token, { expires: 30, secure: true, sameSite: 'strict' });
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        set({ user: null, isAuthenticated: false });
        // Vider aussi le store entreprise
        useCompanyStore.getState().clear();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      },
    }),
    {
      name:    'visionrplus-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);

// ── Company Store ─────────────────────────────────────────────
interface CompanyState {
  activeCompany:    Company | null;
  activeFiscalYear: FiscalYear | null;
  companies:        Company[];
  setActiveCompany:    (company: Company) => void;
  setActiveFiscalYear: (fy: FiscalYear) => void;
  setCompanies:        (companies: Company[]) => void;
  clear:               () => void;
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set) => ({
      activeCompany:    null,
      activeFiscalYear: null,
      companies:        [],

      setActiveCompany: (company) => {
        set({ activeCompany: company });
        // Sélectionner automatiquement l'exercice en cours
        const currentFY = company.fiscal_years?.find((fy) => !fy.is_closed);
        if (currentFY) set({ activeFiscalYear: currentFY });
      },

      setActiveFiscalYear: (fy) => set({ activeFiscalYear: fy }),

      setCompanies: (companies) => {
        set({ companies });
        // Auto-sélectionner la première si aucune n'est active
        const current = useCompanyStore.getState().activeCompany;
        if (!current && companies.length > 0) {
          useCompanyStore.getState().setActiveCompany(companies[0]);
        }
      },

      clear: () => set({ activeCompany: null, activeFiscalYear: null, companies: [] }),
    }),
    {
      name: 'visionrplus-company',
      partialize: (state) => ({
        activeCompany:    state.activeCompany,
        activeFiscalYear: state.activeFiscalYear,
      }),
    },
  ),
);
