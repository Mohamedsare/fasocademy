import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { GraduationCap, Check, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminInstructorRequests({ allUsers }) {
  const queryClient = useQueryClient();
  const [approvingId, setApprovingId] = useState(null);

  const requests = (allUsers || []).filter(
    (u) => u.role === 'user' && u.instructor_requested_at
  );

  const handleApprove = async (userId) => {
    setApprovingId(userId);
    try {
      await base44.entities.User.update(userId, {
        role: 'instructor',
        instructor_requested_at: null,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (err) {
      console.error('Approve instructor error:', err);
    } finally {
      setApprovingId(null);
    }
  };

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500">
        <GraduationCap className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="font-medium">Aucune demande formateur en attente</p>
        <p className="text-sm mt-1">Les nouvelles demandes apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-bold text-[#1B1F3B]">Demandes d'accès formateur</h3>
        <p className="text-sm text-gray-500 mt-0.5">{requests.length} demande(s) en attente</p>
      </div>
      <div className="divide-y divide-gray-100">
        {requests.map((u) => (
          <div
            key={u.id}
            className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div>
              <p className="font-medium text-[#1B1F3B]">{u.full_name || '—'}</p>
              <p className="text-sm text-gray-500">{u.email}</p>
              <p className="text-xs text-gray-400 mt-1">
                Demandé le {u.instructor_requested_at ? format(parseISO(u.instructor_requested_at), 'd MMMM yyyy à HH:mm', { locale: fr }) : '—'}
              </p>
            </div>
            <Button
              size="sm"
              className="bg-[#FF6B00] hover:bg-[#E55D00] text-white shrink-0"
              onClick={() => handleApprove(u.id)}
              disabled={approvingId !== null}
            >
              {approvingId === u.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Accepter
                </>
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
