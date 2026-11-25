import Link from 'next/link';
import { LegalNav } from './_components';
import { PUBLISHER } from '@/lib/legal';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-8 h-8 bg-brand-navy rounded-lg flex items-center justify-center text-xs font-black text-white">R+</span>
            <span className="font-bold text-brand-navy">Vision R+</span>
          </Link>
          <Link href="/auth/login" className="text-sm text-slate-500 hover:text-brand-navy">Connexion</Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <LegalNav />
        <article className="card p-6 sm:p-10 mt-4">{children}</article>
        <p className="text-xs text-slate-400 text-center mt-6">
          Une question sur ces documents ? Écrivez à{' '}
          <a href={`mailto:${PUBLISHER.email}`} className="underline">{PUBLISHER.email}</a>
        </p>
      </div>
    </div>
  );
}
