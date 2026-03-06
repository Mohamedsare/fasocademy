import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import QuizEditor from '@/components/quiz/QuizEditor';
import { ArrowLeft, Save, Loader2, Settings } from 'lucide-react';

export default function QuizBuilder() {
  const urlParams = new URLSearchParams(window.location.search);
  const quizId = urlParams.get('id');
  const courseId = urlParams.get('courseId');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    course_id: courseId || '',
    lesson_id: '',
    passing_score: 70,
    time_limit_minutes: 0,
    questions: [],
  });

  useEffect(() => {
    const load = async () => {
      const auth = await base44.auth.isAuthenticated();
      if (!auth) { base44.auth.redirectToLogin(); return; }
      setUser(await base44.auth.me());
    };
    load();
  }, []);

  const { data: existingQuiz } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => base44.entities.Quiz.filter({ id: quizId }),
    enabled: !!quizId,
    select: d => d?.[0],
  });

  const { data: myCourses } = useQuery({
    queryKey: ['instructor-courses', user?.email],
    queryFn: () => base44.entities.Course.filter({ instructor_email: user.email, status: 'published' }),
    enabled: !!user,
    initialData: [],
  });

  useEffect(() => {
    if (existingQuiz) setForm({ ...existingQuiz });
  }, [existingQuiz]);

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form, instructor_email: user.email };
    delete data.id; delete data.created_at; delete data.updated_at; delete data.created_by;
    if (quizId) {
      await base44.entities.Quiz.update(quizId, data);
    } else {
      await base44.entities.Quiz.create(data);
    }
    queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    setSaving(false);
    navigate(createPageUrl('InstructorDashboard'));
  };

  const totalPoints = form.questions.reduce((acc, q) => acc + (q.points || 1), 0);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link to={createPageUrl('InstructorDashboard')}>
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-[#1B1F3B]">{quizId ? 'Modifier le quiz' : 'Créer un quiz'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{form.questions.length} question(s) • {totalPoints} point(s)</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-[#FF6B00] hover:bg-[#E55D00] text-white">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Enregistrer
        </Button>
      </div>

      {/* Settings card */}
      <Card className="mb-6 border-gray-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#FF6B00]" />
            Paramètres du quiz
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label>Titre du quiz *</Label>
            <Input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Quiz – Les bases de Python"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Cours associé</Label>
            <Select value={form.course_id} onValueChange={v => setForm({ ...form, course_id: v })}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Choisir un cours..." /></SelectTrigger>
              <SelectContent>
                {myCourses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Score de réussite (%)</Label>
            <div className="flex items-center gap-3 mt-1">
              <input
                type="range" min={10} max={100} step={5}
                value={form.passing_score}
                onChange={e => setForm({ ...form, passing_score: Number(e.target.value) })}
                className="flex-1 accent-[#FF6B00]"
              />
              <span className="w-12 text-center font-bold text-[#FF6B00]">{form.passing_score}%</span>
            </div>
          </div>
          <div>
            <Label>Limite de temps (minutes, 0 = illimité)</Label>
            <Input
              type="number" min={0}
              value={form.time_limit_minutes}
              onChange={e => setForm({ ...form, time_limit_minutes: Number(e.target.value) })}
              className="mt-1 w-36"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quiz editor */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-base font-bold text-[#1B1F3B] mb-4">Questions</h2>
        <QuizEditor
          questions={form.questions}
          onChange={questions => setForm({ ...form, questions })}
        />
      </div>
    </div>
  );
}