'use client';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Card, CardHeader, Badge, TableSkeleton, EmptyState } from '@/components/ui';
import { formatDate, formatAmount, JOURNAL_TYPE_LABELS, getStatusColor, cn } from '@/lib/utils';
import type { JournalEntry } from '@/types';

interface RecentEntriesProps {
  entries:   JournalEntry[];
  currency?: string;
  loading:   boolean;
}

export default function RecentEntries({ entries, currency = 'EUR', loading }: RecentEntriesProps) {
  return (
    <Card className="overflow-hidden">
      <div className="p-5">
        <CardHeader
          title="Dernières écritures"
          subtitle="Journal comptable"
          action={
            <Link href="/journal" className="flex items-center gap-1 text-xs text-brand-orange
                                             hover:text-brand-orange-400 font-medium transition-colors">
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          }
        />
      </div>

      {loading ? (
        <TableSkeleton rows={4} />
      ) : entries.length === 0 ? (
        <div className="px-5 pb-5">
          <EmptyState
            icon={BookOpen}
            title="Aucune écriture"
            description="Commencez par saisir une opération dans le journal."
            action={
              <Link href="/journal" className="btn-orange text-xs py-2">
                Saisir une écriture
              </Link>
            }
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="table-header">Date</th>
                <th className="table-header">Libellé</th>
                <th className="table-header">Journal</th>
                <th className="table-header text-right">Montant</th>
                <th className="table-header text-center">Statut</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-surface-secondary/50 transition-colors group">
                  <td className="table-cell text-slate-500 font-mono text-xs whitespace-nowrap">
                    {formatDate(entry.entry_date, true)}
                  </td>
                  <td className="table-cell font-medium text-brand-navy max-w-xs">
                    <Link
                      href={`/journal/${entry.id}`}
                      className="hover:text-brand-orange transition-colors line-clamp-1"
                    >
                      {entry.libelle}
                    </Link>
                    {entry.reference && (
                      <span className="text-xs text-slate-400 block">{entry.reference}</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <span className="text-xs bg-surface-tertiary text-slate-600 px-2 py-0.5 rounded-lg font-medium">
                      {JOURNAL_TYPE_LABELS[entry.journal_type]}
                    </span>
                  </td>
                  <td className="table-cell text-right font-semibold font-mono text-xs whitespace-nowrap">
                    {formatAmount(parseFloat(entry.total_debit), currency)}
                  </td>
                  <td className="table-cell text-center">
                    <Badge
                      variant={
                        entry.status === 'validee' ? 'green' :
                        entry.status === 'brouillon' ? 'amber' : 'red'
                      }
                    >
                      {entry.status === 'validee' ? 'Validée' :
                       entry.status === 'brouillon' ? 'Brouillon' : 'Annulée'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
