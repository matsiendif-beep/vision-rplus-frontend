'use client';
import { useEffect, useState, useRef } from 'react';
import {
  Upload, FileText, Image, File, Trash2,
  Link2, Loader2, Search,
} from 'lucide-react';
import { toast } from 'sonner';
import Header  from '@/components/layout/Header';
import { Card, Spinner, ErrorMessage, EmptyState, Badge } from '@/components/ui';
import { documentsApi, extractApiError } from '@/lib/api/client';

const DOC_TYPES = [
  { value: 'facture',          label: 'Facture' },
  { value: 'recu',             label: 'Reçu' },
  { value: 'releve_bancaire',  label: 'Relevé bancaire' },
  { value: 'contrat',          label: 'Contrat' },
  { value: 'bon_commande',     label: 'Bon de commande' },
  { value: 'bulletin_salaire', label: 'Bulletin de salaire' },
  { value: 'autre',            label: 'Autre' },
];
import { useCompanyStore } from '@/lib/store';
import { formatDate, cn } from '@/lib/utils';

const DOC_TYPE_LABELS: Record<string, string> = {
  facture:          'Facture',
  recu:             'Reçu',
  releve_bancaire:  'Relevé bancaire',
  contrat:          'Contrat',
  bon_commande:     'Bon de commande',
  bulletin_salaire: 'Bulletin de salaire',
  autre:            'Autre',
};

export default function DocumentsPage() {
  const { activeCompany } = useCompanyStore();
  const [docs, setDocs]       = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [uploading, setUploading]   = useState(false);
  const [docType, setDocType]       = useState('autre');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    if (!activeCompany) return;
    setLoading(true);
    try {
      const data = await documentsApi.list(activeCompany.id);
      setDocs(data);
    } catch (e) { setError(extractApiError(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [activeCompany]);

  const handleDelete = async (id: string) => {
    try {
      await documentsApi.delete(activeCompany!.id, id);
      toast.success('Document supprimé');
      load();
    } catch (e) { toast.error(extractApiError(e)); }
  };

  const getMimeIcon = (mime: string) => {
    if (mime === 'application/pdf') return FileText;
    if (mime.startsWith('image/'))  return Image;
    return File;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024)       return `${bytes} o`;
    if (bytes < 1048576)    return `${(bytes / 1024).toFixed(0)} Ko`;
    return `${(bytes / 1048576).toFixed(1)} Mo`;
  };

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <Header
        title="Documents & Pièces justificatives"
        subtitle="Factures, relevés, contrats…"
        actions={
          activeCompany && (
            <div className="flex items-center gap-2">
              <select
                value={docType}
                onChange={e => setDocType(e.target.value)}
                className="input text-xs py-1.5 h-auto"
              >
                {DOC_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="btn-orange text-xs"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? 'Upload…' : 'Ajouter'}
              </button>
            </div>
          )
        }
      />

      {/* Input fichier caché */}
      <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden"
        onChange={async e => {
          const file = e.target.files?.[0];
          if (!file || !activeCompany) return;
          e.target.value = '';
          setUploading(true);
          try {
            await documentsApi.upload(activeCompany.id, file, { document_type: docType });
            toast.success('Document uploadé');
            load();
          } catch (err) {
            toast.error(extractApiError(err));
          } finally {
            setUploading(false);
          }
        }}
      />

      <div className="flex-1 p-6 space-y-4 animate-fade-in">
        {error   && <ErrorMessage message={error} />}

        <Card className="overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
          ) : docs.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Aucun document"
              description="Uploadez vos factures, relevés bancaires et contrats."
              action={
                activeCompany && (
                  <button onClick={() => fileInputRef.current?.click()} className="btn-orange text-xs">
                    <Upload className="w-4 h-4" /> Uploader
                  </button>
                )
              }
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {docs.map(doc => {
                const Icon = getMimeIcon(doc.mime_type);
                return (
                  <div key={doc.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-secondary/40 transition-colors">
                    <div className="w-9 h-9 bg-surface-tertiary rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-brand-navy text-xs truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="default">{DOC_TYPE_LABELS[doc.document_type] ?? doc.document_type}</Badge>
                        <span className="text-[10px] text-slate-400">{formatSize(doc.file_size_bytes)}</span>
                        <span className="text-[10px] text-slate-400">{formatDate(doc.created_at)}</span>
                        {doc.uploader && (
                          <span className="text-[10px] text-slate-400">
                            par {doc.uploader.first_name} {doc.uploader.last_name}
                          </span>
                        )}
                      </div>
                      {doc.journal_entry && (
                        <p className="text-[10px] text-brand-orange mt-0.5 flex items-center gap-1">
                          <Link2 className="w-3 h-3" /> {doc.journal_entry.libelle}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.ocr_processed && doc.ocr_data && (
                        <Badge variant="green" className="text-[10px]">OCR ✓</Badge>
                      )}
                      <a
                        href={documentsApi.fileUrl(activeCompany!.id, doc.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        Voir
                      </a>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
