import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Save, Plus, Trash2, GripVertical, Video, FileText, HelpCircle, PenLine,
  Upload, Loader2, ChevronDown, ChevronUp, ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

const emptyLesson = () => ({
  id: `lesson-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  title: '',
  type: 'video',
  duration_minutes: 0,
  video_url: '',
  content: '',
  resources: [],
  is_free: false,
  order: 0,
});

const emptySection = () => ({
  id: `section-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  title: '',
  order: 0,
  lessons: [emptyLesson()],
});

export default function CourseBuilder() {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({0: true});
  const [form, setForm] = useState({
    title: '', description: '', long_description: '', category: 'developpement-web',
    level: 'debutant', price_cfa: 0, original_price_cfa: 0, thumbnail_url: '',
    duration_hours: 0, learning_objectives: [''], requirements: [''], includes: [''],
    has_certificate: true, status: 'draft', sections: [emptySection()],
  });

  useEffect(() => {
    const load = async () => {
      try {
        const auth = await base44.auth.isAuthenticated();
        if (!auth) { base44.auth.redirectToLogin(); return; }
        setUser(await base44.auth.me());
      } catch (err) {
        console.error('CourseBuilder load error:', err);
      }
    };
    load();
  }, []);

  const { data: existingCourse } = useQuery({
    queryKey: ['edit-course', courseId],
    queryFn: () => base44.entities.Course.filter({ id: courseId }),
    enabled: !!courseId,
    select: d => d?.[0],
  });

  useEffect(() => {
    if (existingCourse) {
      setForm({
        ...existingCourse,
        learning_objectives: existingCourse.learning_objectives?.length > 0 ? existingCourse.learning_objectives : [''],
        requirements: existingCourse.requirements?.length > 0 ? existingCourse.requirements : [''],
        includes: existingCourse.includes?.length > 0 ? existingCourse.includes : [''],
        sections: existingCourse.sections?.length > 0 ? existingCourse.sections : [emptySection()],
      });
    }
  }, [existingCourse]);

  const handleSave = async () => {
    setSaving(true);
    const data = {
      ...form,
      instructor_email: user.email,
      instructor_name: user.full_name,
      learning_objectives: form.learning_objectives.filter(Boolean),
      requirements: form.requirements.filter(Boolean),
      includes: form.includes.filter(Boolean),
      total_lessons: form.sections.reduce((a, s) => a + (s.lessons?.length || 0), 0),
    };
    // Remove built-in fields
    delete data.id; delete data.created_at; delete data.updated_at; delete data.created_by;

    if (courseId) {
      await base44.entities.Course.update(courseId, data);
    } else {
      await base44.entities.Course.create(data);
    }
    queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
    setSaving(false);
    navigate(createPageUrl('InstructorDashboard'));
  };

  const updateList = (field, index, value) => {
    const arr = [...form[field]];
    arr[index] = value;
    setForm({ ...form, [field]: arr });
  };

  const addToList = (field) => setForm({ ...form, [field]: [...form[field], ''] });
  const removeFromList = (field, i) => setForm({ ...form, [field]: form[field].filter((_, idx) => idx !== i) });

  const addSection = () => setForm({ ...form, sections: [...form.sections, emptySection()] });
  const removeSection = (i) => setForm({ ...form, sections: form.sections.filter((_, idx) => idx !== i) });

  const updateSection = (i, key, value) => {
    const sections = [...form.sections];
    sections[i] = { ...sections[i], [key]: value };
    setForm({ ...form, sections });
  };

  const addLesson = (si) => {
    const sections = [...form.sections];
    sections[si].lessons = [...(sections[si].lessons || []), emptyLesson()];
    setForm({ ...form, sections });
  };

  const removeLesson = (si, li) => {
    const sections = [...form.sections];
    sections[si].lessons = sections[si].lessons.filter((_, idx) => idx !== li);
    setForm({ ...form, sections });
  };

  const updateLesson = (si, li, key, value) => {
    const sections = [...form.sections];
    sections[si].lessons[li] = { ...sections[si].lessons[li], [key]: value };
    setForm({ ...form, sections });
  };

  const handleUploadThumbnail = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm({ ...form, thumbnail_url: file_url });
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link to={createPageUrl('InstructorDashboard')}>
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-[#1B1F3B]">{courseId ? 'Modifier le cours' : 'Créer un cours'}</h1>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-[#FF6B00] hover:bg-[#E55D00] text-white">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Enregistrer
        </Button>
      </div>

      <Tabs defaultValue="info">
        <TabsList className="mb-6">
          <TabsTrigger value="info">Informations</TabsTrigger>
          <TabsTrigger value="content">Contenu</TabsTrigger>
          <TabsTrigger value="pricing">Tarification</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          {/* Basic info */}
          <Card>
            <CardHeader><CardTitle className="text-base">Informations générales</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Titre du cours *</Label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ex: Maîtriser Django de A à Z" className="mt-1" />
              </div>
              <div>
                <Label>Description courte</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="2-3 phrases qui décrivent le cours" className="mt-1" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Catégorie</Label>
                  <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="developpement-web">Développement Web</SelectItem>
                      <SelectItem value="data-ia">Data & IA</SelectItem>
                      <SelectItem value="cybersecurite">Cybersécurité</SelectItem>
                      <SelectItem value="bureautique">Bureautique</SelectItem>
                      <SelectItem value="business-entrepreneuriat">Business</SelectItem>
                      <SelectItem value="design-creation">Design</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Niveau</Label>
                  <Select value={form.level} onValueChange={v => setForm({ ...form, level: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debutant">Débutant</SelectItem>
                      <SelectItem value="intermediaire">Intermédiaire</SelectItem>
                      <SelectItem value="avance">Avancé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Miniature du cours</Label>
                <div className="mt-1 flex items-center gap-4">
                  {form.thumbnail_url && <img src={form.thumbnail_url} alt="" className="w-24 h-16 rounded-lg object-cover" />}
                  <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 transition-colors">
                    <Upload className="w-4 h-4 inline mr-2" />Uploader
                    <input type="file" className="hidden" accept="image/*" onChange={handleUploadThumbnail} />
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning objectives */}
          <Card>
            <CardHeader><CardTitle className="text-base">Ce que les étudiants vont apprendre</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {form.learning_objectives.map((obj, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={obj} onChange={e => updateList('learning_objectives', i, e.target.value)} placeholder="Ex: Créer une application web complète" />
                  {form.learning_objectives.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeFromList('learning_objectives', i)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => addToList('learning_objectives')}><Plus className="w-3 h-3 mr-1" />Ajouter</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          {form.sections.map((section, si) => (
            <Card key={section.id || si}>
              <CardHeader className="cursor-pointer" onClick={() => setExpandedSections(p => ({ ...p, [si]: !p[si] }))}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {expandedSections[si] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    <CardTitle className="text-sm">{section.title || `Section ${si + 1}`}</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); removeSection(si); }}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                </div>
              </CardHeader>
              {expandedSections[si] && (
                <CardContent className="space-y-4">
                  <Input value={section.title} onChange={e => updateSection(si, 'title', e.target.value)} placeholder="Titre de la section" />
                  
                  <div className="space-y-3 ml-4 border-l-2 border-gray-100 pl-4">
                    {section.lessons?.map((lesson, li) => (
                      <div key={lesson.id || li} className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Input value={lesson.title} onChange={e => updateLesson(si, li, 'title', e.target.value)} placeholder="Titre de la leçon" className="flex-1" />
                          <Select value={lesson.type} onValueChange={v => updateLesson(si, li, 'type', v)}>
                            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="video"><div className="flex items-center gap-2"><Video className="w-3 h-3" />Vidéo</div></SelectItem>
                              <SelectItem value="article"><div className="flex items-center gap-2"><FileText className="w-3 h-3" />Article</div></SelectItem>
                              <SelectItem value="quiz"><div className="flex items-center gap-2"><HelpCircle className="w-3 h-3" />Quiz</div></SelectItem>
                            </SelectContent>
                          </Select>
                          <Input type="number" value={lesson.duration_minutes} onChange={e => updateLesson(si, li, 'duration_minutes', Number(e.target.value))} className="w-20" placeholder="min" />
                          <Button variant="ghost" size="icon" onClick={() => removeLesson(si, li)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                        </div>
                        {lesson.type === 'video' && (
                          <Input value={lesson.video_url} onChange={e => updateLesson(si, li, 'video_url', e.target.value)} placeholder="URL de la vidéo" />
                        )}
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={lesson.is_free} onChange={e => updateLesson(si, li, 'is_free', e.target.checked)} id={`free-${si}-${li}`} />
                          <label htmlFor={`free-${si}-${li}`} className="text-xs text-gray-600">Leçon gratuite (aperçu)</label>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => addLesson(si)}><Plus className="w-3 h-3 mr-1" />Ajouter une leçon</Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
          <Button variant="outline" onClick={addSection}><Plus className="w-4 h-4 mr-2" />Ajouter une section</Button>
        </TabsContent>

        <TabsContent value="pricing">
          <Card>
            <CardHeader><CardTitle className="text-base">Tarification</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl mb-2">
                <input
                  type="checkbox"
                  checked={form.is_free || false}
                  onChange={e => setForm({ ...form, is_free: e.target.checked, price_cfa: e.target.checked ? 0 : form.price_cfa })}
                  id="is-free"
                  className="accent-[#00C9A7] w-4 h-4"
                />
                <label htmlFor="is-free" className="text-sm font-semibold text-emerald-700 cursor-pointer">
                  🎁 Formation totalement gratuite (aucun paiement requis)
                </label>
              </div>

              {!form.is_free && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Prix (CFA) *</Label>
                    <Input type="number" value={form.price_cfa} onChange={e => setForm({ ...form, price_cfa: Number(e.target.value) })} className="mt-1" />
                  </div>
                  <div>
                    <Label>Prix barré (CFA)</Label>
                    <Input type="number" value={form.original_price_cfa} onChange={e => setForm({ ...form, original_price_cfa: Number(e.target.value) })} className="mt-1" placeholder="Optionnel" />
                  </div>
                </div>
              )}
              <div>
                <Label>Durée totale (heures)</Label>
                <Input type="number" value={form.duration_hours} onChange={e => setForm({ ...form, duration_hours: Number(e.target.value) })} className="mt-1 w-32" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.has_certificate} onChange={e => setForm({ ...form, has_certificate: e.target.checked })} id="cert" />
                <label htmlFor="cert" className="text-sm text-gray-700">Certificat de fin de cours</label>
              </div>
              <div>
                <Label>Statut</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger className="mt-1 w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="review">Soumettre pour revue</SelectItem>
                    <SelectItem value="published">Publié</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}