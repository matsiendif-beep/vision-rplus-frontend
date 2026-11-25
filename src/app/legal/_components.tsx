'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LEGAL_VERSION_LABEL } from '@/lib/legal';

const DOCS = [
  { href: '/legal/cgu',              label: 'CGU / CGV' },
  { href: '/legal/confidentialite',  label: 'Confidentialité' },
  { href: '/legal/mentions-legales', label: 'Mentions légales' },
];

export function LegalNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Documents juridiques">
      {DOCS.map((d) => (
        <Link
          key={d.href}
          href={d.href}
          className={
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ' +
            (pathname === d.href ? 'bg-brand-navy text-white' : 'bg-white text-brand-navy hover:bg-slate-100')
          }
        >
          {d.label}
        </Link>
      ))}
    </nav>
  );
}

export function DocTitle({ children, version = true }: { children: React.ReactNode; version?: boolean }) {
  return (
    <header className="mb-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy">{children}</h1>
      {version && <p className="text-sm text-slate-400 mt-2">Version en vigueur au {LEGAL_VERSION_LABEL}</p>}
    </header>
  );
}

export function H2({ id, children }: { id?: string; children: React.ReactNode }) {
  return <h2 id={id} className="text-lg font-bold text-brand-navy mt-8 mb-3 scroll-mt-4">{children}</h2>;
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-600 leading-relaxed mb-3">{children}</p>;
}

export function UL({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600 leading-relaxed mb-3">{children}</ul>;
}

export function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto mb-4">
      <table className="w-full text-sm text-left border border-slate-200 rounded-lg">
        <thead className="bg-slate-50 text-brand-navy">
          <tr>{head.map((h) => <th key={h} className="px-3 py-2 font-semibold border-b border-slate-200">{h}</th>)}</tr>
        </thead>
        <tbody className="text-slate-600">
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-slate-100 last:border-0">
              {r.map((c, j) => <td key={j} className="px-3 py-2 align-top">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
