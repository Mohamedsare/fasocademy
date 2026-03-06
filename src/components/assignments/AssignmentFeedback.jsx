import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2, AlertCircle, Lightbulb, Plus, Trash2, Star, Send, Award
} from 'lucide-react';

const FEEDBACK_TYPES = [
  { value: 'strength', label: 'Point fort', icon: CheckCircle2, color: 'bg-green-50 border-green-200 text-green-700', badgeClass: 'bg-green-100 text-green-700 border-0' },
  { value: 'improvement', label: 'À améliorer', icon: AlertCircle, color: 'bg-red-50 border-red-200 text-red-700', badgeClass: 'bg-red-100 text-red-700 border-0' },
  { value: 'suggestion', label: 'Suggestion', icon: Lightbulb, color: 'bg-amber-50 border-amber-200 text-amber-700', badgeClass: 'bg-amber-100 text-amber-700 border-0' },
];

export default function AssignmentFeedback({ assignment, submission, onSave, readOnly = false }) {
  const [rubricScores, setRubricScores] = useState(
    submission?.rubric_scores || assignment?.rubric?.map(r => ({ criterion: r.criterion, score: 0, max: r.max_points })) || []
  );
  const [feedbackItems, setFeedbackItems] = useState(submission?.feedback_items || []);
  const [globalFeedback, setGlobalFeedback] = useState(submission?.feedback || '');
  const [saving, setSaving] = useState(false);

  const totalScore = rubricScores.reduce((acc, r) => acc + (r.score || 0), 0);
  const maxScore = assignment?.max_score || 100;
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const passed = percentage >= 60;

  const updateRubricScore = (i, score) => {
    const scores = [...rubricScores];
    scores[i] = { ...scores[i], score: Math.min(score, scores[i].max) };
    setRubricScores(scores);
  };

  const addFeedbackItem = (type) => {
    setFeedbackItems([...feedbackItems, { type, text: '' }]);
  };

  const updateFeedbackItem = (i, text) => {
    const items = [...feedbackItems];
    items[i] = { ...items[i], text };
    setFeedbackItems(items);
  };

  const removeFeedbackItem = (i) => {
    setFeedbackItems(feedbackItems.filter((_, idx) => idx !== i));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      score: totalScore,
      rubric_scores: rubricScores,
      feedback: globalFeedback,
      feedback_items: feedbackItems.filter(f => f.text.trim()),
      status: passed ? 'passed' : 'failed',
      reviewed_at: new Date().toISOString(),
    });
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Submission preview */}
      {submission?.content && (
        <div className="bg-gray-50 rounded-2xl p-4">
          <h4 className="text-sm font-bold text-gray-700 mb-2">Rendu de l'apprenant</h4>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{submission.content}</p>
          {submission.file_url && (
            <a href={submission.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-2 text-xs text-[#FF6B00] hover:underline">
              Voir le fichier joint →
            </a>
          )}
        </div>
      )}

      {/* Score summary */}
      <div className={`rounded-2xl p-4 border-2 ${passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-100'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-sm">{passed ? '✓ Réussi' : '✗ À améliorer'}</span>
          <span className={`text-2xl font-extrabold ${passed ? 'text-green-600' : 'text-red-500'}`}>
            {totalScore} / {maxScore}
          </span>
        </div>
        <Progress value={percentage} className="h-2" />
        <p className="text-xs text-gray-500 mt-1">{percentage}% — Seuil de réussite : 60%</p>
      </div>

      {/* Rubric scoring */}
      {assignment?.rubric?.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-gray-700">Grille d'évaluation</h4>
          {assignment.rubric.map((criterion, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <p className="font-semibold text-sm text-[#1B1F3B]">{criterion.criterion}</p>
                  {criterion.description && <p className="text-xs text-gray-400 mt-0.5">{criterion.description}</p>}
                </div>
                <div className="text-xs text-gray-400 shrink-0">/{criterion.max_points} pts</div>
              </div>
              {readOnly ? (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {Array.from({ length: criterion.max_points }, (_, pi) => (
                      <div key={pi} className={`w-6 h-2 rounded-full ${pi < (rubricScores[i]?.score || 0) ? 'bg-[#FF6B00]' : 'bg-gray-100'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-[#FF6B00]">{rubricScores[i]?.score || 0}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="range"
                    min={0}
                    max={criterion.max_points}
                    value={rubricScores[i]?.score || 0}
                    onChange={e => updateRubricScore(i, Number(e.target.value))}
                    className="flex-1 accent-[#FF6B00]"
                  />
                  <span className="w-12 text-center text-sm font-bold text-[#FF6B00]">
                    {rubricScores[i]?.score || 0}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Feedback items */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-700">Feedback détaillé</h4>
        {feedbackItems.map((item, i) => {
          const type = FEEDBACK_TYPES.find(t => t.value === item.type);
          const Icon = type?.icon || Lightbulb;
          return (
            <div key={i} className={`flex items-start gap-2 p-3 rounded-xl border ${type?.color}`}>
              <Icon className="w-4 h-4 mt-0.5 shrink-0" />
              {readOnly ? (
                <p className="text-sm flex-1">{item.text}</p>
              ) : (
                <>
                  <Input
                    value={item.text}
                    onChange={e => updateFeedbackItem(i, e.target.value)}
                    placeholder={`${type?.label}...`}
                    className="flex-1 h-8 text-sm border-0 bg-transparent p-0 focus-visible:ring-0"
                  />
                  <button onClick={() => removeFeedbackItem(i)}>
                    <Trash2 className="w-3.5 h-3.5 opacity-50 hover:opacity-100" />
                  </button>
                </>
              )}
            </div>
          );
        })}

        {!readOnly && (
          <div className="flex flex-wrap gap-2">
            {FEEDBACK_TYPES.map(t => {
              const Icon = t.icon;
              return (
                <Button key={t.value} variant="outline" size="sm" className="text-xs h-8" onClick={() => addFeedbackItem(t.value)}>
                  <Icon className="w-3.5 h-3.5 mr-1.5" />
                  <Badge className={`${t.badgeClass} text-[10px] px-1.5 py-0 mr-1`}>{t.label}</Badge>
                  Ajouter
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* Global feedback */}
      <div>
        <Label className="text-sm font-bold text-gray-700">Commentaire global</Label>
        {readOnly ? (
          <p className="mt-2 text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-4">
            {globalFeedback || 'Aucun commentaire global.'}
          </p>
        ) : (
          <Textarea
            value={globalFeedback}
            onChange={e => setGlobalFeedback(e.target.value)}
            placeholder="Résumez votre évaluation et donnez des conseils à l'apprenant..."
            className="mt-2 resize-none"
            rows={4}
          />
        )}
      </div>

      {!readOnly && (
        <Button onClick={handleSave} className="w-full bg-[#FF6B00] hover:bg-[#E55D00] text-white h-11 font-bold">
          <Send className="w-4 h-4 mr-2" />
          Envoyer le feedback
        </Button>
      )}
    </div>
  );
}