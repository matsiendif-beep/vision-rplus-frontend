'use client';
import { useEffect, useState } from 'react';
import {
  Plus, Banknote, CheckCircle2, AlertCircle,
  X, Loader2, RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import Header  from '@/components/layout/Header';
import { Card, Spinner, ErrorMessage, EmptyState, Badge } from '@/components/ui';
import { bankApi, extractApiError } from '@/lib/api/client';
import { useCompanyStore } from '@/lib/store';
import { formatAmount, formatDate, cn } from '@/lib/utils';

export default function BankPage() {
  const { activeCompany } = useCompanyStore();
  const [accounts, setAccounts]         = useState<any[]>([]);
  const [selectedAccount, setSelected]  = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading]           = useState(false);
  const [txLoading, setTxLoading]       = useState(false);
  const [error, setError]               = useState('');
  const [showNewAccount, setShowNew]    = useState(false);

  const loadAccounts = async () => {
    if (!activeCompany) return;
    setLoading(true);
    try {
      const data = await bankApi.getAccounts(activeCompany.id);
      setAccounts(data);
    } catch (e) { setError(extractApiError(e)); }
    finally { setLoading(false); }
  };

  const loadTransactions = async (accountId: string) => {
    if (!activeCompany) return;
    setTxLoading(true);
    try {
      const data = await bankApi.getTransactions(activeCompany.id, accountId);
      setTransactions(data);
    } catch (e) { toast.error(extractApiError(e)); }
    finally { setTxLoading(false); }
  };

  useEffect(() => { loadAccounts(); }, [activeCompany]);
  useEffect(() => {
    if (selectedAccount) loadTransactions(selectedAccount.id);
  }, [selectedAccount]);

  return (
    <>
    <div className="flex-1 min-w-0 flex flex-col">
      <Header
        title="Banque & Rapprochement"
        subtitle="Suivi des comptes bancaires"
        actions={
          activeCompany && (
            <button onClick={() => setShowNew(true)} className="btn-orange text-xs">
              <Plus className="w-4 h-4" /> Nouveau compte
            </button>
          )
        }
      />

      <div className="flex-1 p-6 gap-5 grid grid-cols-1 lg:grid-cols-3 animate-fade-in">
        {error && <div className="col-span-full"><ErrorMessage message={error} /></div>}

        {/* ── Liste comptes ──────────────────────────────── */}
        <div className="lg:col-span-1 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Comptes bancaires</p>
          {loading ? (
            <div className="flex items-center justify-center py-10"><Spinner /></div>
          ) : accounts.length === 0 ? (
            <Card className="p-6">
              <EmptyState icon={Banknote} title="Aucun compte" description="Ajoutez vos comptes bancaires." />
            </Card>
          ) : (
            accounts.map(account => (
              <Card
                key={account.id}
                onClick={() => setSelected(account)}
                className={cn(
                  'p-4 cursor-pointer transition-all',
                  selectedAccount?.id === account.id && 'ring-2 ring-brand-orange/40',
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-brand-navy text-sm">{account.name}</p>
                    <p className="text-xs text-slate-400">{account.bank_name}</p>
                    {account.iban && (
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{account.iban}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      'font-bold font-mono text-sm',
                      Number(account.current_balance) >= 0 ? 'text-emerald-600' : 'text-red-500',
                    )}>
                      {formatAmount(account.current_balance, account.currency)}
                    </p>
                    <p className="text-[10px] text-slate-400">{account.currency}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* ── Transactions ───────────────────────────────── */}
        <div className="lg:col-span-2">
          {!selectedAccount ? (
            <Card className="p-10 flex items-center justify-center">
              <p className="text-slate-400 text-sm">Sélectionnez un compte pour voir les transactions.</p>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-brand-navy">
                  Transactions — {selectedAccount.name}
                </p>
                <button
                  onClick={() => loadTransactions(selectedAccount.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              {txLoading ? (
                <div className="flex items-center justify-center py-10"><Spinner /></div>
              ) : transactions.length === 0 ? (
                <div className="p-6">
                  <EmptyState icon={Banknote} title="Aucune transaction" description="Importez un relevé bancaire." />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        <th className="table-header">Date</th>
                        <th className="table-header">Description</th>
                        <th className="table-header text-right">Montant</th>
                        <th className="table-header text-center">Rapprochement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-surface-secondary/40 border-b border-slate-50">
                          <td className="table-cell font-mono text-slate-500 whitespace-nowrap">
                            {formatDate(tx.transaction_date)}
                          </td>
                          <td className="table-cell text-brand-navy max-w-xs">
                            <p className="line-clamp-1">{tx.description}</p>
                            {tx.journal_line && (
                              <p className="text-[10px] text-brand-orange">
                                ↳ {tx.journal_line.entry?.libelle}
                              </p>
                            )}
                          </td>
                          <td className={cn(
                            'table-cell text-right font-mono font-semibold whitespace-nowrap',
                            Number(tx.amount) >= 0 ? 'text-emerald-600' : 'text-red-500',
                          )}>
                            {Number(tx.amount) >= 0 ? '+' : ''}{formatAmount(tx.amount, selectedAccount.currency)}
                          </td>
                          <td className="table-cell text-center">
                            {tx.is_reconciled
                              ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                              : <AlertCircle  className="w-4 h-4 text-amber-400 mx-auto" />
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>

    {showNewAccount && activeCompany && (
      <NewAccountModal
        companyId={activeCompany.id}
        onClose={() => setShowNew(false)}
        onSuccess={() => { setShowNew(false); loadAccounts(); }}
      />
    )}
    </>
  );
}

function NewAccountModal({ companyId, onClose, onSuccess }: any) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', bank_name: '', iban: '', bic: '', currency: 'EUR' });

  const handleCreate = async () => {
    if (!form.name || !form.bank_name) {
      toast.error('Nom et banque obligatoires');
      return;
    }
    setSaving(true);
    try {
      await bankApi.createAccount(companyId, form);
      toast.success('Compte bancaire créé');
      onSuccess();
    } catch (e) { toast.error(extractApiError(e)); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h2 className="font-bold text-brand-navy">Nouveau compte bancaire</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {(['name', 'bank_name', 'iban', 'bic'] as const).map(field => (
            <div key={field}>
              <label className="label capitalize">{field.replace('_', ' ')}</label>
              <input
                className="input"
                placeholder={field === 'name' ? 'Compte courant BNP' : ''}
                value={(form as any)[field]}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
              />
            </div>
          ))}
          <div>
            <label className="label">Devise</label>
            <select className="input" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
              {['EUR', 'XAF', 'XOF', 'USD', 'GBP'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Annuler</button>
            <button type="button" onClick={handleCreate} disabled={saving} className="btn-orange flex-1 justify-center">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving ? 'Création…' : 'Créer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
