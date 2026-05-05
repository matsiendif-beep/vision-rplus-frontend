'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Plus, Package, TrendingDown, Calendar,
  X, Loader2, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import Header  from '@/components/layout/Header';
import { Card, CardHeader, Spinner, ErrorMessage, EmptyState, Badge } from '@/components/ui';
import { fixedAssetsApi, extractApiError } from '@/lib/api/client';
import { useCompanyStore } from '@/lib/store';
import { formatAmount, formatDate, cn } from '@/lib/utils';
import { useEffect } from 'react';

export default function FixedAssetsPage() {
  const { activeCompany, activeFiscalYear } = useCompanyStore();
  const [assets, setAssets]     = useState<any[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected]   = useState<any>(null);

  const load = async () => {
    if (!activeCompany) return;
    setLoading(true);
    try {
      const data = await fixedAssetsApi.list(activeCompany.id);
      setAssets(data);
    } catch (e) { setError(extractApiError(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [activeCompany]);

  const totalBrut  = assets.reduce((s, a) => s + Number(a.gross_value), 0);
  const totalNetBV = assets.reduce((s, a) => s + (a.net_book_value_current ?? Number(a.gross_value)), 0);
  const totalAmort = totalBrut - totalNetBV;

  return (
    <>
    <div className="flex-1 min-w-0 flex flex-col">
      <Header
        title="Immobilisations"
        subtitle="Gestion des actifs et amortissements"
        actions={
          activeCompany && (
            <button onClick={() => setShowModal(true)} className="btn-orange">
              <Plus className="w-4 h-4" /> Nouvelle immobilisation
            </button>
          )
        }
      />

      <div className="flex-1 p-6 space-y-5 animate-fade-in">
        {error   && <ErrorMessage message={error} />}

        {/* ── KPIs ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard label="Valeur brute totale"    value={formatAmount(totalBrut,  activeCompany?.currency)} icon={Package}     color="blue" />
          <KpiCard label="Amortissements cumulés" value={formatAmount(totalAmort, activeCompany?.currency)} icon={TrendingDown} color="amber" />
          <KpiCard label="Valeur nette comptable" value={formatAmount(totalNetBV, activeCompany?.currency)} icon={CheckCircle2} color="green" />
        </div>

        {/* ── Liste des actifs ───────────────────────────── */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
          ) : assets.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Aucune immobilisation"
              description="Ajoutez vos actifs pour générer automatiquement les plans d'amortissement."
              action={
                activeCompany && (
                  <button onClick={() => setShowModal(true)} className="btn-orange text-xs">
                    <Plus className="w-4 h-4" /> Ajouter un actif
                  </button>
                )
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="table-header">Actif</th>
                    <th className="table-header text-right">Valeur brute</th>
                    <th className="table-header text-right">Amort. cumulés</th>
                    <th className="table-header text-right">VNC</th>
                    <th className="table-header text-center">Méthode</th>
                    <th className="table-header text-center">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map(asset => (
                    <tr
                      key={asset.id}
                      className="hover:bg-surface-secondary/40 cursor-pointer transition-colors"
                      onClick={() => setSelected(asset)}
                    >
                      <td className="table-cell">
                        <p className="font-semibold text-brand-navy text-xs">{asset.name}</p>
                        <p className="text-[10px] text-slate-400">
                          Acquis le {formatDate(asset.acquisition_date)} · {asset.useful_life_years} ans
                        </p>
                      </td>
                      <td className="table-cell text-right font-mono text-xs text-blue-600 font-semibold">
                        {formatAmount(asset.gross_value, activeCompany?.currency)}
                      </td>
                      <td className="table-cell text-right font-mono text-xs text-amber-600 font-semibold">
                        {formatAmount(asset.total_depreciated ?? 0, activeCompany?.currency)}
                      </td>
                      <td className="table-cell text-right font-mono text-xs text-emerald-600 font-semibold">
                        {formatAmount(asset.net_book_value_current ?? asset.gross_value, activeCompany?.currency)}
                      </td>
                      <td className="table-cell text-center">
                        <Badge variant="default">
                          {asset.depreciation_method === 'lineaire' ? 'Linéaire' : 'Dégressive'}
                        </Badge>
                      </td>
                      <td className="table-cell text-center">
                        <Badge variant={asset.status === 'en_service' ? 'green' : 'amber'}>
                          {asset.status === 'en_service' ? 'En service' : asset.status === 'cede' ? 'Cédé' : 'Au rebut'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>

    {/* ── Modal création ───────────────────────────────── */}
    {showModal && (
      <CreateAssetModal
        companyId={activeCompany!.id}
        onClose={() => setShowModal(false)}
        onSuccess={() => { setShowModal(false); load(); }}
      />
    )}

    {/* ── Modal détail / plan amortissement ────────────── */}
    {selected && (
      <AssetDetailModal
        asset={selected}
        currency={activeCompany?.currency}
        onClose={() => setSelected(null)}
      />
    )}
    </>
  );
}

// ── KPI Card ──────────────────────────────────────────────────
function KpiCard({ label, value, icon: Icon, color }: any) {
  const colors: Record<string, string> = {
    blue:  'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-emerald-50 text-emerald-600',
  };
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', colors[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-slate-400">{label}</p>
          <p className="font-bold text-brand-navy font-mono text-sm">{value}</p>
        </div>
      </div>
    </Card>
  );
}

// ── Modal Création ────────────────────────────────────────────
function CreateAssetModal({ companyId, onClose, onSuccess }: any) {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      acquisition_date:   new Date().toISOString().slice(0, 10),
      useful_life_years:  5,
      depreciation_method: 'lineaire',
      gross_value:        '',
      residual_value:     0,
    },
  });

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      await fixedAssetsApi.create(companyId, { ...data, gross_value: parseFloat(data.gross_value) });
      toast.success('Immobilisation créée et plan d\'amortissement généré');
      onSuccess();
    } catch (e) { toast.error(extractApiError(e)); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="font-bold text-brand-navy">Nouvelle immobilisation</h2>
            <p className="text-xs text-slate-400">Le plan d'amortissement sera généré automatiquement</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="label">Désignation *</label>
            <input {...register('name', { required: 'Requis' })} placeholder="Matériel informatique, Véhicule…" className="input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date d'acquisition *</label>
              <input {...register('acquisition_date', { required: true })} type="date" className="input" />
            </div>
            <div>
              <label className="label">Valeur brute *</label>
              <input {...register('gross_value', { required: true })} type="number" step="0.01" min="0" placeholder="0.00" className="input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Durée d'utilité (ans) *</label>
              <input {...register('useful_life_years', { required: true, min: 1, valueAsNumber: true })} type="number" min="1" className="input" />
            </div>
            <div>
              <label className="label">Méthode</label>
              <select {...register('depreciation_method')} className="input">
                <option value="lineaire">Linéaire</option>
                <option value="degressive">Dégressive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Valeur résiduelle</label>
            <input {...register('residual_value', { valueAsNumber: true })} type="number" step="0.01" min="0" placeholder="0.00" className="input" />
          </div>
          <div>
            <label className="label">Localisation</label>
            <input {...register('location')} placeholder="Bureau, Entrepôt…" className="input" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Annuler</button>
            <button type="submit" disabled={saving} className="btn-orange flex-1 justify-center">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving ? 'Création…' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Modal Détail & Plan d'amortissement ───────────────────────
function AssetDetailModal({ asset, currency, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="font-bold text-brand-navy">{asset.name}</h2>
            <p className="text-xs text-slate-400">Plan d'amortissement</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <p className="text-xs text-slate-500">Valeur brute</p>
              <p className="font-bold text-blue-600 font-mono text-sm">{formatAmount(asset.gross_value, currency)}</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-xl">
              <p className="text-xs text-slate-500">Amort. cumulés</p>
              <p className="font-bold text-amber-600 font-mono text-sm">{formatAmount(asset.total_depreciated ?? 0, currency)}</p>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-xl">
              <p className="text-xs text-slate-500">VNC actuelle</p>
              <p className="font-bold text-emerald-600 font-mono text-sm">{formatAmount(asset.net_book_value_current ?? asset.gross_value, currency)}</p>
            </div>
          </div>

          {/* Tableau plan */}
          <h3 className="font-semibold text-brand-navy text-sm mb-3">Plan d'amortissement</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-surface-secondary">
                <th className="table-header text-left">Exercice</th>
                <th className="table-header text-right">Dotation</th>
                <th className="table-header text-right">Amort. cumulés</th>
                <th className="table-header text-right">VNC</th>
                <th className="table-header text-center">Statut</th>
              </tr>
            </thead>
            <tbody>
              {(asset.depreciation_lines ?? []).map((line: any) => (
                <tr key={line.id} className="border-b border-slate-50">
                  <td className="table-cell font-mono">{line.period_start?.slice(0, 7)} → {line.period_end?.slice(0, 7)}</td>
                  <td className="table-cell text-right font-mono font-semibold text-amber-600">
                    {formatAmount(line.depreciation_amount, currency)}
                  </td>
                  <td className="table-cell text-right font-mono text-slate-500">
                    {formatAmount(line.accumulated_amount, currency)}
                  </td>
                  <td className="table-cell text-right font-mono font-semibold text-emerald-600">
                    {formatAmount(line.net_book_value, currency)}
                  </td>
                  <td className="table-cell text-center">
                    <Badge variant={line.is_posted ? 'green' : 'default'}>
                      {line.is_posted ? 'Comptabilisé' : 'En attente'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
