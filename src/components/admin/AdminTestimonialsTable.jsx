import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle, XCircle, Clock } from 'lucide-react';

const STATUS = {
  pending:  { label: 'En attente', cls: 'bg-yellow-100 text-yellow-700 border-0' },
  approved: { label: 'Approuvé',   cls: 'bg-green-100 text-green-700 border-0'  },
  rejected: { label: 'Rejeté',     cls: 'bg-red-100 text-red-600 border-0'      },
};

export default function AdminTestimonialsTable() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(null);

  const { data: testimonials = [] } = useQuery({
    queryKey: ['admin-testimonials'],
    queryFn: () => base44.entities.Testimonial.list('-created_date', 100),
  });

  const filtered = filter === 'all' ? testimonials : testimonials.filter(t => t.status === filter);

  const update = async (id, status) => {
    setLoading(id + status);
    await base44.entities.Testimonial.update(id, { status });
    queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
    setLoading(null);
  };

  const counts = {
    pending:  testimonials.filter(t => t.status === 'pending').length,
    approved: testimonials.filter(t => t.status === 'approved').length,
    rejected: testimonials.filter(t => t.status === 'rejected').length,
  };

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[['all', 'Tous', testimonials.length], ['pending', 'En attente', counts.pending], ['approved', 'Approuvés', counts.approved], ['rejected', 'Rejetés', counts.rejected]].map(([v, l, c]) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              filter === v ? 'bg-[#FF6B00] text-white border-[#FF6B00]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#FF6B00]'
            }`}
          >
            {l} <span className="ml-1 opacity-70">({c})</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-300">Aucun témoignage</div>
        )}
        {filtered.map(t => (
          <div key={t.id} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF9A44] flex items-center justify-center text-white font-bold shrink-0">
                  {t.user_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[#1B1F3B] text-sm">{t.user_name}</span>
                    {t.role && <span className="text-xs text-gray-400">{t.role}</span>}
                    {t.city && <span className="text-xs text-gray-400">• {t.city}</span>}
                    <Badge className={STATUS[t.status]?.cls}>{STATUS[t.status]?.label}</Badge>
                  </div>
                  <div className="flex mt-1 mb-2">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= t.rating ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{t.content}</p>
                  <p className="text-xs text-gray-400 mt-1">{t.user_email}</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {t.status !== 'approved' && (
                  <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-white text-xs px-3"
                    disabled={loading === t.id + 'approved'} onClick={() => update(t.id, 'approved')}>
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />Approuver
                  </Button>
                )}
                {t.status !== 'rejected' && (
                  <Button size="sm" variant="outline" className="h-8 text-red-500 border-red-200 text-xs px-3"
                    disabled={loading === t.id + 'rejected'} onClick={() => update(t.id, 'rejected')}>
                    <XCircle className="w-3.5 h-3.5 mr-1" />Rejeter
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}