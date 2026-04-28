# Vision R+ — Frontend Next.js

> Interface SaaS de gestion financière & comptable  
> Stack : **Next.js 14 · TypeScript · Tailwind CSS · Zustand · Recharts**

---

## 🗂️ Structure du projet

```
src/
├── app/                            # Next.js App Router
│   ├── layout.tsx                  # Layout racine (fonts, Toaster)
│   ├── globals.css                 # Tailwind + design system CSS
│   ├── page.tsx                    # Redirection → /dashboard
│   │
│   ├── auth/
│   │   ├── login/page.tsx          # Connexion JWT
│   │   └── register/page.tsx       # Inscription
│   │
│   ├── dashboard/
│   │   ├── layout.tsx              # Layout avec Sidebar
│   │   └── page.tsx                # 🏠 Dashboard principal (KPIs + graphiques)
│   │
│   ├── companies/
│   │   ├── layout.tsx
│   │   └── page.tsx                # 🏢 Liste + création d'entreprises
│   │
│   ├── journal/
│   │   ├── layout.tsx
│   │   └── page.tsx                # 📒 Journal comptable + saisie d'écritures
│   │
│   ├── income-statement/
│   │   ├── layout.tsx
│   │   └── page.tsx                # 📈 Compte de résultat automatique
│   │
│   ├── balance-sheet/
│   │   ├── layout.tsx
│   │   └── page.tsx                # ⚖️ Bilan comptable (Actif / Passif)
│   │
│   └── settings/
│       ├── layout.tsx
│       └── page.tsx                # ⚙️ Paramètres (entreprise, profil, sécurité)
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx             # Navigation latérale + sélecteur entreprise
│   │   └── Header.tsx              # En-tête page + sélecteur exercice fiscal
│   │
│   ├── ui/
│   │   └── index.tsx               # Card, Badge, Skeleton, EmptyState, Spinner…
│   │
│   └── dashboard/
│       ├── MetricCards.tsx         # KPI cards (trésorerie, CA, charges, résultat)
│       ├── MonthlyChart.tsx        # Graphique évolution mensuelle (Recharts)
│       └── RecentEntries.tsx       # Dernières écritures comptables
│
├── lib/
│   ├── api/
│   │   └── client.ts               # Axios + interceptors + tous les appels API
│   │
│   ├── hooks/
│   │   └── index.ts                # useDashboard, useJournal, useBalanceSheet…
│   │
│   ├── store/
│   │   └── index.ts                # Zustand : auth + entreprise active
│   │
│   └── utils/
│       └── index.ts                # formatAmount, formatDate, cn, labels…
│
└── types/
    └── index.ts                    # Types TypeScript complets (sync backend)
```

---

## 🚀 Démarrage rapide

### Prérequis
- Node.js ≥ 18
- Le backend Vision R+ démarré sur http://localhost:3000

### Installation
```bash
npm install
```

### Configuration
```bash
# .env.local est déjà créé avec les valeurs par défaut
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Démarrer
```bash
npm run dev
# → http://localhost:3001
```

---

## 🎨 Design System

### Couleurs
| Token                   | Valeur    | Usage                    |
|-------------------------|-----------|--------------------------|
| `brand-navy`            | `#1a2744` | Texte principal, sidebar |
| `brand-orange`          | `#e07b2a` | CTA, accents, actif      |
| `surface-secondary`     | `#f5f7fa` | Fond de page             |

### Classes utilitaires clés
```css
.card            /* Carte blanche avec ombre */
.btn-primary     /* Bouton navy */
.btn-orange      /* Bouton orange CTA */
.input           /* Champ de formulaire */
.label           /* Label de formulaire */
.badge           /* Badge statut inline */
.table-header    /* En-tête de tableau */
.table-cell      /* Cellule de tableau */
.nav-link        /* Lien sidebar */
.metric-card     /* Carte KPI dashboard */
.skeleton        /* Loader squelette */
```

---

## 🔌 Connexion à l'API

L'API client (`src/lib/api/client.ts`) :
- Injecte automatiquement le **JWT Bearer token** sur toutes les requêtes
- Redirige vers `/auth/login` en cas de **401 (token expiré)**
- Expose 4 namespaces : `authApi`, `companiesApi`, `accountsApi`, `journalApi`, `financialApi`

```typescript
// Exemple d'appel
import { financialApi } from '@/lib/api/client';

const dashboard = await financialApi.dashboard(companyId, fiscalYearId);
```

---

## 📡 État global (Zustand)

Deux stores persistés dans `localStorage` :

```typescript
// Auth
const { user, isAuthenticated, setUser, logout } = useAuthStore();

// Entreprise active
const { activeCompany, activeFiscalYear, setActiveCompany } = useCompanyStore();
```

---

## 📄 Pages

| Route              | Description                                        |
|--------------------|----------------------------------------------------|
| `/auth/login`      | Formulaire connexion avec validation Zod           |
| `/auth/register`   | Inscription nouveau compte                         |
| `/dashboard`       | KPIs + graphique évolution + dernières écritures   |
| `/companies`       | Liste entreprises + création (modal)               |
| `/journal`         | Journal comptable paginé + saisie écriture (modal) |
| `/income-statement`| Compte de résultat auto (Produits / Charges)       |
| `/balance-sheet`   | Bilan comptable (Actif / Passif + vérification)    |
| `/settings`        | Paramètres entreprise, profil, notifications       |
