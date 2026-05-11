'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Building2, BookOpen,
  TrendingUp, Scale, Settings, LogOut,
  ChevronDown, Plus, Landmark,
  BarChart3, Package, FileText, Banknote, Receipt,
  BookMarked, ListOrdered,
} from 'lucide-react';
import { useAuthStore, useCompanyStore } from '@/lib/store';
import { cn, SYSTEM_LABELS } from '@/lib/utils';
import type { Company } from '@/types';

const NAV_ITEMS = [
  // ── Principal
  { href: '/dashboard',        label: 'Dashboard',           icon: LayoutDashboard, group: 'principal' },
  { href: '/companies',        label: 'Entreprises',          icon: Building2,       group: 'principal' },
  // ── Comptabilité
  { href: '/journal',          label: 'Journal',              icon: BookOpen,        group: 'compta' },
  { href: '/grand-livre',      label: 'Grand Livre',          icon: BookMarked,      group: 'compta' },
  { href: '/balance',          label: 'Balance des comptes',  icon: ListOrdered,     group: 'compta' },
  { href: '/income-statement', label: 'Compte de résultat',   icon: TrendingUp,      group: 'compta' },
  { href: '/balance-sheet',    label: 'Bilan',                icon: Scale,           group: 'compta' },
  { href: '/fixed-assets',     label: 'Immobilisations',      icon: Package,         group: 'compta' },
  // ── Analyse
  { href: '/analytics',        label: 'Analyse & KPIs',       icon: BarChart3,       group: 'analyse' },
  { href: '/tax',              label: 'Fiscalité & DSF',       icon: Receipt,         group: 'analyse' },
  { href: '/bank',             label: 'Banque',               icon: Banknote,        group: 'analyse' },
  // ── Documents & Paramètres
  { href: '/documents',        label: 'Documents',            icon: FileText,        group: 'outils' },
  { href: '/settings',         label: 'Paramètres',           icon: Settings,        group: 'outils' },
];

export default function Sidebar() {
  const pathname                                       = usePathname();
  const { user, logout }                               = useAuthStore();
  const { activeCompany, companies, setActiveCompany } = useCompanyStore();
  const [showCompanyPicker, setShowCompanyPicker]      = useState(false);

  return (
    <aside className="w-64 min-h-screen bg-brand-navy flex flex-col shadow-sidebar flex-shrink-0">

      {/* ── Logo ─────────────────────────────────────────── */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center font-bold text-white text-sm">
            R+
          </div>
          <span className="font-bold text-white text-lg tracking-tight">Vision R+</span>
        </div>
      </div>

      {/* ── Sélecteur d'entreprise ───────────────────────── */}
      <div className="px-3 py-3 border-b border-white/10">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide px-2 mb-1.5">
          Entreprise active
        </p>
        <div className="relative">
          <button
            onClick={() => setShowCompanyPicker((v) => !v)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5
                       bg-white/8 hover:bg-white/12 rounded-xl transition-colors duration-150"
          >
            {activeCompany ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 bg-brand-orange/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Landmark className="w-3.5 h-3.5 text-brand-orange" />
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-white text-xs font-semibold truncate">{activeCompany.name}</p>
                  <p className="text-slate-400 text-[10px]">
                    {SYSTEM_LABELS[activeCompany.accounting_system]}
                  </p>
                </div>
              </div>
            ) : (
              <span className="text-slate-400 text-xs">Sélectionner une entreprise</span>
            )}
            <ChevronDown className={cn(
              'w-3.5 h-3.5 text-slate-400 transition-transform duration-150 flex-shrink-0',
              showCompanyPicker && 'rotate-180',
            )} />
          </button>

          {/* Dropdown entreprises */}
          {showCompanyPicker && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-brand-navy-700 rounded-xl
                            border border-white/10 shadow-lg overflow-hidden z-50">
              {companies.map((company: Company) => (
                <button
                  key={company.id}
                  onClick={() => { setActiveCompany(company); setShowCompanyPicker(false); }}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors',
                    'hover:bg-white/10',
                    activeCompany?.id === company.id && 'bg-white/10',
                  )}
                >
                  <div className="w-6 h-6 bg-brand-orange/20 rounded-md flex items-center justify-center flex-shrink-0">
                    <Landmark className="w-3 h-3 text-brand-orange" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-medium truncate">{company.name}</p>
                    <p className="text-slate-400 text-[10px]">{SYSTEM_LABELS[company.accounting_system]}</p>
                  </div>
                </button>
              ))}
              <Link
                href="/companies"
                onClick={() => setShowCompanyPicker(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-brand-orange text-xs
                           font-medium border-t border-white/10 hover:bg-white/5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Nouvelle entreprise
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Navigation ───────────────────────────────────── */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(active ? 'nav-link-active' : 'nav-link')}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Profil utilisateur ───────────────────────────── */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
          <div className="w-8 h-8 bg-brand-orange rounded-full flex items-center justify-center
                          text-white font-bold text-xs flex-shrink-0">
            {user?.first_name?.[0]?.toUpperCase()}{user?.last_name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-slate-400 text-[10px] capitalize">{user?.plan}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="nav-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 mt-1"
        >
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
