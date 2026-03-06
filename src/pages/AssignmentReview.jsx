import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AssignmentFeedback from '@/components/assignments/AssignmentFeedback';
import {
  ArrowLeft, FileText, Clock, CheckCircle2, XCircle, AlertCircle, Users
} from 'lucide-react';
import { createNotification } from '@/components/common/notificationHelpers';

export default function AssignmentReview() {
  const urlParams = new URLSearchParams(window.location.search);
  const assignmentId = urlParams.get('id');
  const [user, setUser] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const load = async () => {
      try {
        const auth = await base44.auth.isAuthenticated();
        if (!auth) { base44.auth.redirectToLogin(); return; }
        setUser(await base44.auth.me());
      } catch (err) {
        console.error('AssignmentReview load error:', err);
      }
    };
    load();
  }, []);

  const { data: assignment, refetch } = useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: () => base44.entities.Assignment.filter({ id: assignmentId }),
    enabled: !!assignmentId,
    select: d => d?.[0],
  });

  if (!assignment || !user) return (
    <div className="flex items-center justify-center min-h-[60vh] text-gray-400">Chargement...</div>
  );

  const submissions = assignment.submissions || [];
  const pending = submissions.filter(s => s.status === 'pending');
  const reviewed = submissions.filter(s => s.status !== 'pending');

  const handleSaveFeedback = async (feedbackData) => {
    const updatedSubmissions = submissions.map((s, i) =>
      i === submissions.findIndex(sub => sub.user_email === selectedSubmission.user_email)
        ? { ...s, ...feedbackData }
        : s
    );
    await base44.entities.Assignment.update(assignmentId, { submissions: updatedSubmissions });
    // Notify learner that their assignment was reviewed
    if (selectedSubmission.user_email) {
      await createNotification({
        user_email: selectedSubmission.user_email,
        type: 'question_answered',
        title: `Devoir corrigé : ${assignment.title}`,
        message: `Ton formateur a évalué ton devoir. Score : ${feedbackData.score ?? '—'}/${assignment.max_score}`,
        link_page: 'MyLearning',
      });
    }
    await refetch();
    setSelectedSubmission(null);
  };

  const statusBadge = (status) => {
    const map = {
      pending: { cls: 'bg-yellow-100 text-yellow-700 border-0', label: 'En attente', icon: Clock },
      reviewed: { cls: 'bg-blue-100 text-blue-700 border-0', label: 'Évalué', icon: CheckCircle2 },
      passed: { cls: 'bg-green-100 text-green-700 border-0', label: 'Réussi', icon: CheckCircle2 },
      failed: { cls: 'bg-red-100 text-red-700 border-0', label: 'Échoué', icon: XCircle },
    };
    const s = map[status] || map.pending;
    const Icon = s.icon;
    return <Badge className={`${s.cls} flex items-center gap-1`}><Icon className="w-3 h-3" />{s.label}</Badge>;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link to={createPageUrl('InstructorDashboard')}>
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-[#1B1F3B]">{assignment.title}</h1>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-3">
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{submissions.length} rendu(s)</span>
            <span className="flex items-center gap-1 text-yellow-600"><AlertCircle className="w-3.5 h-3.5" />{pending.length} en attente</span>
            <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="w-3.5 h-3.5" />{reviewed.length} évalué(s)</span>
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Submissions list */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="pending">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="pending" className="flex-1">En attente ({pending.length})</TabsTrigger>
              <TabsTrigger value="reviewed" className="flex-1">Évalués ({reviewed.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-2">
              {pending.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                  <p className="text-sm">Tous les rendus ont été évalués !</p>
                </div>
              ) : pending.map((sub, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedSubmission(sub)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedSubmission?.user_email === sub.user_email
                      ? 'border-[#FF6B00] bg-[#FFF3E8]'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">{sub.user_name || sub.user_email}</span>
                    {statusBadge(sub.status)}
                  </div>
                  <p className="text-xs text-gray-400">
                    Rendu le {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString('fr-FR') : 'N/A'}
                  </p>
                </button>
              ))}
            </TabsContent>

            <TabsContent value="reviewed" className="space-y-2">
              {reviewed.map((sub, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedSubmission(sub)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedSubmission?.user_email === sub.user_email
                      ? 'border-[#FF6B00] bg-[#FFF3E8]'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">{sub.user_name || sub.user_email}</span>
                    {statusBadge(sub.status)}
                  </div>
                  <p className="text-xs text-gray-400">
                    Score : {sub.score || 0}/{assignment.max_score}
                  </p>
                </button>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Feedback panel */}
        <div className="lg:col-span-3">
          {selectedSubmission ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-[#1B1F3B]">{selectedSubmission.user_name}</h3>
                  <p className="text-xs text-gray-400">{selectedSubmission.user_email}</p>
                </div>
                {statusBadge(selectedSubmission.status)}
              </div>
              <AssignmentFeedback
                assignment={assignment}
                submission={selectedSubmission}
                onSave={handleSaveFeedback}
                readOnly={selectedSubmission.status !== 'pending'}
              />
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 h-full min-h-64 flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Sélectionne un rendu pour évaluer</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}