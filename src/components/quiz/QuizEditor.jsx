import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Plus, Trash2, GripVertical, CheckCircle, Link2, Move, AlignLeft,
  ToggleLeft, ChevronDown, ChevronUp
} from 'lucide-react';

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Choix multiple', icon: CheckCircle, color: 'text-blue-500' },
  { value: 'true_false', label: 'Vrai / Faux', icon: ToggleLeft, color: 'text-green-500' },
  { value: 'drag_drop', label: 'Glisser-déposer', icon: Move, color: 'text-purple-500' },
  { value: 'matching', label: 'Association', icon: Link2, color: 'text-amber-500' },
  { value: 'short_answer', label: 'Réponse courte', icon: AlignLeft, color: 'text-gray-500' },
];

const newQuestion = (type = 'multiple_choice') => ({
  id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
  type,
  question: '',
  points: 1,
  explanation: '',
  options: type === 'multiple_choice' ? ['', '', '', ''] : [],
  correct_answer: type === 'true_false' ? true : type === 'multiple_choice' ? 0 : '',
  pairs: type === 'matching' ? [{ left: '', right: '' }] : [],
  drag_items: type === 'drag_drop' ? [''] : [],
  drop_zones: type === 'drag_drop' ? [''] : [],
  correct_mapping: {},
});

function MultipleChoiceEditor({ q, onChange }) {
  return (
    <div className="space-y-3">
      <Label className="text-xs text-gray-500">Options (cliquer pour marquer la bonne réponse)</Label>
      {q.options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <button
            onClick={() => onChange({ ...q, correct_answer: i })}
            className={`w-6 h-6 rounded-full border-2 shrink-0 transition-all ${
              q.correct_answer === i
                ? 'bg-[#00C9A7] border-[#00C9A7]'
                : 'border-gray-300 hover:border-[#00C9A7]'
            }`}
          >
            {q.correct_answer === i && <span className="block w-2 h-2 bg-white rounded-full mx-auto" />}
          </button>
          <Input
            value={opt}
            onChange={e => {
              const opts = [...q.options];
              opts[i] = e.target.value;
              onChange({ ...q, options: opts });
            }}
            placeholder={`Option ${i + 1}`}
            className="flex-1 h-9 text-sm"
          />
          {q.options.length > 2 && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
              const opts = q.options.filter((_, idx) => idx !== i);
              const newCorrect = q.correct_answer >= opts.length ? 0 : q.correct_answer;
              onChange({ ...q, options: opts, correct_answer: newCorrect });
            }}>
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
            </Button>
          )}
        </div>
      ))}
      {q.options.length < 6 && (
        <Button variant="outline" size="sm" onClick={() => onChange({ ...q, options: [...q.options, ''] })}>
          <Plus className="w-3 h-3 mr-1" /> Ajouter une option
        </Button>
      )}
    </div>
  );
}

function TrueFalseEditor({ q, onChange }) {
  return (
    <div className="flex gap-3">
      {[true, false].map(val => (
        <button
          key={String(val)}
          onClick={() => onChange({ ...q, correct_answer: val })}
          className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
            q.correct_answer === val
              ? 'border-[#00C9A7] bg-[#00C9A7]/10 text-[#00C9A7]'
              : 'border-gray-200 text-gray-500 hover:border-gray-300'
          }`}
        >
          {val ? '✓ Vrai' : '✗ Faux'}
        </button>
      ))}
    </div>
  );
}

function MatchingEditor({ q, onChange }) {
  const addPair = () => onChange({ ...q, pairs: [...(q.pairs || []), { left: '', right: '' }] });
  const removePair = (i) => onChange({ ...q, pairs: q.pairs.filter((_, idx) => idx !== i) });
  const updatePair = (i, side, val) => {
    const pairs = [...q.pairs];
    pairs[i] = { ...pairs[i], [side]: val };
    onChange({ ...q, pairs });
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-400 px-1">
        <span>Colonne gauche</span>
        <span>Colonne droite</span>
      </div>
      {q.pairs?.map((pair, i) => (
        <div key={i} className="grid grid-cols-2 gap-2 items-center">
          <Input value={pair.left} onChange={e => updatePair(i, 'left', e.target.value)} placeholder={`Élément ${i + 1}`} className="h-9 text-sm" />
          <div className="flex gap-1">
            <Input value={pair.right} onChange={e => updatePair(i, 'right', e.target.value)} placeholder={`Correspondance ${i + 1}`} className="h-9 text-sm flex-1" />
            {q.pairs.length > 1 && (
              <Button variant="ghost" size="icon" className="h-9 w-8 shrink-0" onClick={() => removePair(i)}>
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
              </Button>
            )}
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addPair}><Plus className="w-3 h-3 mr-1" /> Ajouter une paire</Button>
    </div>
  );
}

function DragDropEditor({ q, onChange }) {
  const updateItem = (i, val) => {
    const items = [...(q.drag_items || [])];
    items[i] = val;
    onChange({ ...q, drag_items: items });
  };
  const updateZone = (i, val) => {
    const zones = [...(q.drop_zones || [])];
    zones[i] = val;
    onChange({ ...q, drop_zones: zones });
  };
  const updateMapping = (item, zone) => {
    onChange({ ...q, correct_mapping: { ...(q.correct_mapping || {}), [item]: zone } });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-gray-500 mb-2 block">Éléments à glisser</Label>
          <div className="space-y-2">
            {(q.drag_items || ['']).map((item, i) => (
              <div key={i} className="flex gap-1">
                <div className="w-6 h-9 flex items-center justify-center text-gray-300"><GripVertical className="w-4 h-4" /></div>
                <Input value={item} onChange={e => updateItem(i, e.target.value)} placeholder={`Élément ${i + 1}`} className="h-9 text-sm flex-1" />
                {(q.drag_items?.length || 1) > 1 && (
                  <Button variant="ghost" size="icon" className="h-9 w-8" onClick={() => {
                    onChange({ ...q, drag_items: q.drag_items.filter((_, idx) => idx !== i) });
                  }}>
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => onChange({ ...q, drag_items: [...(q.drag_items || []), ''] })}>
              <Plus className="w-3 h-3 mr-1" /> Ajouter
            </Button>
          </div>
        </div>
        <div>
          <Label className="text-xs text-gray-500 mb-2 block">Zones de dépôt</Label>
          <div className="space-y-2">
            {(q.drop_zones || ['']).map((zone, i) => (
              <div key={i} className="flex gap-1">
                <Input value={zone} onChange={e => updateZone(i, e.target.value)} placeholder={`Zone ${i + 1}`} className="h-9 text-sm flex-1" />
                {(q.drop_zones?.length || 1) > 1 && (
                  <Button variant="ghost" size="icon" className="h-9 w-8" onClick={() => {
                    onChange({ ...q, drop_zones: q.drop_zones.filter((_, idx) => idx !== i) });
                  }}>
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => onChange({ ...q, drop_zones: [...(q.drop_zones || []), ''] })}>
              <Plus className="w-3 h-3 mr-1" /> Ajouter
            </Button>
          </div>
        </div>
      </div>

      {/* Mapping */}
      {q.drag_items?.some(Boolean) && q.drop_zones?.some(Boolean) && (
        <div className="bg-purple-50 rounded-xl p-3">
          <Label className="text-xs text-gray-500 mb-2 block">Associations correctes</Label>
          <div className="space-y-2">
            {(q.drag_items || []).filter(Boolean).map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-white shrink-0 w-28 truncate">{item}</Badge>
                <span className="text-gray-400">→</span>
                <Select
                  value={q.correct_mapping?.[item] || ''}
                  onValueChange={val => updateMapping(item, val)}
                >
                  <SelectTrigger className="h-8 text-xs flex-1"><SelectValue placeholder="Choisir..." /></SelectTrigger>
                  <SelectContent>
                    {(q.drop_zones || []).filter(Boolean).map(zone => (
                      <SelectItem key={zone} value={zone} className="text-xs">{zone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionCard({ q, index, onChange, onRemove }) {
  const [expanded, setExpanded] = useState(true);
  const typeInfo = QUESTION_TYPES.find(t => t.value === q.type);
  const Icon = typeInfo?.icon || CheckCircle;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
          {index + 1}
        </div>
        <Icon className={`w-4 h-4 shrink-0 ${typeInfo?.color || 'text-gray-400'}`} />
        <span className="flex-1 text-sm font-semibold text-gray-700 truncate">
          {q.question || `Question ${index + 1} (${typeInfo?.label})`}
        </span>
        <Badge variant="outline" className="text-xs shrink-0">{q.points} pt{q.points > 1 ? 's' : ''}</Badge>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={e => { e.stopPropagation(); onRemove(); }}>
          <Trash2 className="w-3.5 h-3.5 text-red-400" />
        </Button>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-50 pt-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Label className="text-xs text-gray-500">Question *</Label>
              <Textarea
                value={q.question}
                onChange={e => onChange({ ...q, question: e.target.value })}
                placeholder="Énoncé de la question..."
                className="mt-1 text-sm resize-none"
                rows={2}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Type</Label>
              <Select value={q.type} onValueChange={val => onChange(newQuestion(val))}>
                <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value} className="text-xs">
                      <div className="flex items-center gap-2">
                        <t.icon className={`w-3.5 h-3.5 ${t.color}`} />
                        {t.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-2">
                <Label className="text-xs text-gray-500">Points</Label>
                <Input
                  type="number" min={1} max={10}
                  value={q.points}
                  onChange={e => onChange({ ...q, points: Number(e.target.value) })}
                  className="mt-1 h-9 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Type-specific editor */}
          {q.type === 'multiple_choice' && <MultipleChoiceEditor q={q} onChange={onChange} />}
          {q.type === 'true_false' && <TrueFalseEditor q={q} onChange={onChange} />}
          {q.type === 'matching' && <MatchingEditor q={q} onChange={onChange} />}
          {q.type === 'drag_drop' && <DragDropEditor q={q} onChange={onChange} />}
          {q.type === 'short_answer' && (
            <div>
              <Label className="text-xs text-gray-500">Réponse acceptée (mot-clé)</Label>
              <Input
                value={q.correct_answer || ''}
                onChange={e => onChange({ ...q, correct_answer: e.target.value })}
                placeholder="La réponse attendue..."
                className="mt-1 h-9 text-sm"
              />
            </div>
          )}

          {/* Explanation */}
          <div>
            <Label className="text-xs text-gray-500">Explication (après réponse)</Label>
            <Textarea
              value={q.explanation}
              onChange={e => onChange({ ...q, explanation: e.target.value })}
              placeholder="Expliquer la bonne réponse aux apprenants..."
              className="mt-1 text-sm resize-none"
              rows={2}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuizEditor({ questions, onChange }) {
  const addQuestion = (type = 'multiple_choice') => {
    onChange([...(questions || []), newQuestion(type)]);
  };

  const updateQuestion = (i, updated) => {
    const qs = [...questions];
    qs[i] = updated;
    onChange(qs);
  };

  const removeQuestion = (i) => {
    onChange(questions.filter((_, idx) => idx !== i));
  };

  const totalPoints = (questions || []).reduce((acc, q) => acc + (q.points || 1), 0);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-500">{questions?.length || 0} question(s)</span>
        <span className="text-gray-300">•</span>
        <span className="text-gray-500">{totalPoints} point(s) au total</span>
      </div>

      {/* Questions */}
      {(questions || []).map((q, i) => (
        <QuestionCard
          key={q.id || i}
          q={q}
          index={i}
          onChange={updated => updateQuestion(i, updated)}
          onRemove={() => removeQuestion(i)}
        />
      ))}

      {/* Add question buttons */}
      <div className="bg-gray-50 rounded-2xl p-4 border border-dashed border-gray-200">
        <p className="text-xs font-semibold text-gray-500 mb-3">Ajouter une question :</p>
        <div className="flex flex-wrap gap-2">
          {QUESTION_TYPES.map(t => {
            const Icon = t.icon;
            return (
              <Button
                key={t.value}
                variant="outline"
                size="sm"
                onClick={() => addQuestion(t.value)}
                className="text-xs h-8 bg-white hover:bg-gray-50"
              >
                <Icon className={`w-3.5 h-3.5 mr-1.5 ${t.color}`} />
                {t.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}