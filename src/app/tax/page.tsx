'use client';
import { useEffect, useState } from 'react';
import {
  Plus, Receipt, FileText, CheckCircle2,
  Send, Loader2, X, AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import Header  from '@/components/layout/Header';
import { Card, Spinner, ErrorMessage, EmptyState, Badge } from '@/components/ui';
import { taxApi, extractApiError } from '@/lib/api/client';
import { useCompanyStore } from '@/lib/store';
import { formatAmount, formatDate, cn } from '@/lib/utils';

const TAX_TYPE_LABELS: Record<string, string> = {
  tva_collectee:  'TVA collectée',
  tva_deductible: 'TVA déductible',
  is:             'Impôt sur les sociétés',
  dsf:            'DSF (OHADA)',
  patente:        'Patente',
  tfpb:           'TFPB',
  autre:          'Autre',
};

const STATUS_COLORS: Record<string, 'green' | 'amber' | 'blue' | 'default'> = {
  brouillon: 'default',
  calculee:  'amber',
  validee:   'green',
  deposee:   'blue',
};

export default function TaxPage() {
  const { activeCompany, activeFiscalYear } = useCompanyStore();
  const [declarations, setDeclarations]   = useState<any[]>([]);
  const [dsfData, setDsfData]             = useState<any>(null);
  const [loading, setLoading]             = useState(false);
  const [dsfLoading, setDsfLoading]       = useState(false);
  const [error, setError]                 = useState('');
  const [showModal, setShowModal]         = useState(false);

  const load = async () => {
    if (!activeCompany) return;
    setLoading(true);
    try {
      const data = await taxApi.list(activeCompany.id);
      setDeclarations(data);
    } catch (e) { setError(extractApiError(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [activeCompany]);

  const generateDsf = async () => {
    if (!activeCompany || !activeFiscalYear) return;
    setDsfLoading(true);
    try {
      const data = await taxApi.generateDsf(activeCompany.id, activeFiscalYear.id);
      setDsfData(data);
      toast.success('DSF générée avec succès');
    } catch (e) { toast.error(extractApiError(e)); }
    finally { setDsfLoading(false); }
  };

  const handleValidate = async (id: string) => {
    try {
      await taxApi.validate(activeCompany!.id, id);
      toast.success('Déclaration validée');
      load();
    } catch (e) { toast.error(extractApiError(e)); }
  };

  const handleSubmit = async (id: string) => {
    try {
      await taxApi.submit(activeCompany!.id, id);
      toast.success('Déclaration marquée comme déposée');
      load();
    } catch (e) { toast.error(extractApiError(e)); }
  };

  return (
    <>
    <div className="flex-1 min-w-0 flex flex-col">
      <Header
        title="Fiscalité & DSF"
        subtitle={activeFiscalYear?.label ?? '—'}
        actions={
          activeCompany && activeFiscalYear && (
            <div className="flex gap-2">
              <button
                onClick={generateDsf}
                disabled={dsfLoading}
                className="btn-primary text-xs"
              >
                {dsfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                Générer DSF
              </button>
              <button onClick={() => setShowModal(true)} className="btn-orange text-xs">
                <Plus className="w-4 h-4" /> Nouvelle déclaration
              </button>
            </div>
          )
        }
      />

      <div className="flex-1 p-6 space-y-5 animate-fade-in">
        {error && <ErrorMessage message={error} />}

        {/* ── DSF Preview ───────────────────────────────── */}
        {dsfData && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-brand-navy">DSF — {dsfData.fiscal_year?.label}</h3>
              <div className="flex items-center gap-2">
                {dsfData.controles?.bilan_equilibre
                  ? <Badge variant="green"><CheckCircle2 className="w-3 h-3 mr-1" /> Bilan équilibré</Badge>
                  : <Badge variant="red"><AlertTriangle className="w-3 h-3 mr-1" /> Bilan déséquilibré</Badge>
                }
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <DsfCard label="Total Actif"    value={formatAmount(dsfData.bilan_actif?.total,          activeCompany?.currency)} color="blue" />
              <DsfCard label="Total Passif"   value={formatAmount(dsfData.bilan_passif?.total,         activeCompany?.currency)} color="green" />
              <DsfCard label="Total Produits" value={formatAmount(dsfData.resultat?.total_produits,    activeCompany?.currency)} color="emerald" />
              <DsfCard label="Résultat net"   value={formatAmount(dsfData.resultat?.resultat_net,      activeCompany?.currency)} color={dsfData.resultat?.resultat_net >= 0 ? 'emerald' : 'red'} />
            </div>

            {/* Tableau immobilisations DSF */}
            {dsfData.tableau_immobilisations?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                  Tableau des immobilisations
                </h4>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-surface-secondary">
                      <th className="table-header">Actif</th>
                      <th className="table-header text-right">Valeur brute</th>
                      <th className="table-header text-right">Dotation</th>
                      <th className="table-header text-right">Amort. cumulés</th>
                      <th className="table-header text-right">VNC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dsfData.tableau_immobilisations.map((a: any, i: number) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="table-cell">{a.nom}</td>
                        <td className="table-cell text-right font-mono">{formatAmount(a.valeur_brute, activeCompany?.currency)}</td>
                        <td className="table-cell text-right font-mono text-amber-600">{formatAmount(a.dotation_exercice, activeCompany?.currency)}</td>
                        <td className="table-cell text-right font-mono text-slate-500">{formatAmount(a.amort_cumules, activeCompany?.currency)}</td>
                        <td className="table-cell text-right font-mono text-emerald-600 font-semibold">{formatAmount(a.valeur_nette, activeCompany?.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* ── Liste déclarations ─────────────────────────── */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
          ) : declarations.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="Aucune déclaration fiscale"
              description="Créez votre première déclaration TVA ou IS."
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="table-header">Type</th>
                  <th className="table-header">Période</th>
                  <th className="table-header text-right">Base</th>
                  <th className="table-header text-right">Montant</th>
                  <th className="table-header text-center">Statut</th>
                  <th className="table-header text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {declarations.map(d => (
                  <tr key={d.id} className="hover:bg-surface-secondary/40">
                    <td className="table-cell">
                      <p className="font-semibold text-brand-navy text-xs">{TAX_TYPE_LABELS[d.tax_type] ?? d.tax_type}</p>
                      <p className="text-[10px] text-slate-400">{d.fiscal_year?.label}</p>
                    </td>
                    <td className="table-cell text-xs text-slate-500">
                      {formatDate(d.period_start)} → {formatDate(d.period_end)}
                    </td>
                    <td className="table-cell text-right font-mono text-xs">
                      {d.tax_base ? formatAmount(d.tax_base, activeCompany?.currency) : '—'}
                    </td>
                    <td className="table-cell text-right font-mono text-xs font-semibold text-brand-orange">
                      {d.tax_amount ? formatAmount(d.tax_amount, activeCompany?.currency) : '—'}
                    </td>
                    <td className="table-cell text-center">
                      <Badge variant={STATUS_COLORS[d.status] ?? 'default'}>
                        {d.status}
                      </Badge>
                    </td>
                    <td className="table-cell text-center">
                      <div className="flex items-center justify-center gap-1">
                        {d.status === 'calculee' && (
                          <button
                            onClick={() => handleValidate(d.id)}
                            className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Valider
                          </button>
                        )}
                        {d.status === 'validee' && (
                          <button
                            onClick={() => handleSubmit(d.id)}
                            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Send className="w-3.5 h-3.5" /> Déposée
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>

    {showModal && activeCompany && activeFiscalYear && (
      <CreateDeclarationModal
        companyId={activeCompany.id}
        fiscalYearId={activeFiscalYear.id}
        onClose={() => setShowModal(false)}
        onSuccess={() => { setShowModal(false); load(); }}
      />
    )}
    </>
  );
}

function DsfCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'text-blue-600', green: 'text-green-600',
    emerald: 'text-emerald-600', red: 'text-red-500',
  };
  return (
    <div className="text-center p-4 bg-surface-secondary rounded-xl">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className={cn('font-bold font-mono text-sm', colors[color] ?? 'text-brand-navy')}>{value}</p>
    </div>
  );
}

function CreateDeclarationModal({ companyId, fiscalYearId, onClose, onSuccess }: any) {
  const [saving, setSaving] = useState(false);
  const [form, setForm]     = useState({
    tax_type:     'tva_collectee',
    period_start: new Date().toISOString().slice(0, 10),
    period_end:   new Date().toISOString().slice(0, 10),
  });

  const handleCreate = async () => {
    setSaving(true);
    try {
      await taxApi.create(companyId, { ...form, fiscal_year_id: fiscalYearId });
      toast.success('Déclaration calculée');
      onSuccess();
    } catch (e) { toast.error(extractApiError(e)); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h2 className="font-bold text-brand-navy">Nouvelle déclaration fiscale</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="label">Type de déclaration</label>
            <select className="input" value={form.tax_type} onChange={e => setForm(f => ({ ...f, tax_type: e.target.value }))}>
              {Object.entries(TAX_TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Début de période</label>
              <input type="date" className="input" value={form.period_start}
                onChange={e => setForm(f => ({ ...f, period_start: e.target.value }))} />
            </div>
            <div>
              <label className="label">Fin de période</label>
              <input type="date" className="input" value={form.period_end}
                onChange={e => setForm(f => ({ ...f, period_end: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Annuler</button>
            <button type="button" onClick={handleCreate} disabled={saving} className="btn-orange flex-1 justify-center">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
              {saving ? 'Calcul…' : 'Calculer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
