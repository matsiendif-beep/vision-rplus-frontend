// src/app/page.tsx — Redirection racine
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/dashboard');
}
