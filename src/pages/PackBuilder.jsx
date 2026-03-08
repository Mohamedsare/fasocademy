import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PackCard from '@/components/packs/PackCard';
import {
  ArrowLeft, Save, Loader2, Plus, X, Package, Tag, Eye, TrendingUp, Upload
} from 'lucide-react';

export default function PackBuilder() {
  const urlParams = new URLSearchParams(window.location.search);
  const packId = urlParams.get('id');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [preview, setPreview] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [thumbnailError, setThumbnailError] = useState('');
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    thumbnail_url: '',
    course_ids: [],
    pack_price_cfa: 0,
    badge_label: '',
    highlights: [''],
    status: 'draft',
    is_featured: false,
    expires_at: '',
  });

  useEffect(() => {
    const load = async () => {
      const auth = await base44.auth.isAuthenticated();
      if (!auth) { base44.auth.redirectToLogin(); return; }
      setUser(await base44.auth.me());
    };
    load();
  }, []);

  const { data: myCourses } = useQuery({
    queryKey: ['instructor-courses-all', user?.email],
    queryFn: () => base44.entities.Course.filter({ instructor_email: user.email, status: 'published' }),
    enabled: !!user,
    initialData: [],
  });

  const { data: existingPack } = useQuery({
    queryKey: ['pack', packId],
    queryFn: () => base44.entities.CoursePack.filter({ id: packId }),
    enabled: !!packId,
    select: d => d?.[0],
  });

  useEffect(() => {
    if (existingPack) {
      setForm({ ...existingPack, highlights: existingPack.highlights?.length > 0 ? existingPack.highlights : [''] });
    }
  }, [existingPack]);

  // Auto-calculate prices from selected courses
  const selectedCourses = myCourses.filter(c => form.course_ids.includes(c.id));
  const totalPriceCFA = selectedCourses.reduce((acc, c) => acc + (c.price_cfa || 0), 0);
  const discountPercent = totalPriceCFA > 0 && form.pack_price_cfa > 0
    ? Math.round((1 - form.pack_price_cfa / totalPriceCFA) * 100)
    : 0;
  const totalHours = selectedCourses.reduce((acc, c) => acc + (c.duration_hours || 0), 0);
  const totalLessons = selectedCourses.reduce((acc, c) => acc + (c.total_lessons || 0), 0);

  const toggleCourse = (courseId) => {
    setForm(prev => ({
      ...prev,
      course_ids: prev.course_ids.includes(courseId)
        ? prev.course_ids.filter(id => id !== courseId)
        : [...prev.course_ids, courseId],
    }));
  };

  const handleUploadThumbnail = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnailError('');
    setUploadingThumbnail(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm({ ...form, thumbnail_url: file_url });
    } catch (err) {
      setThumbnailError(err?.message || 'Échec de l\'upload. Configurez le bucket Supabase.');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleSave = async () => {
    setSaveError('');
    if (!form.title?.trim()) {
      setSaveError('Le titre du pack est requis.');
      return;
    }
    if (form.course_ids.length === 0) {
      setSaveError('Sélectionne au moins un cours dans le pack.');
      return;
    }
    setSaving(true);
    try {
      const data = {
        ...form,
        instructor_email: user.email,
        instructor_name: user.full_name,
        course_titles: selectedCourses.map(c => c.title),
        total_price_cfa: totalPriceCFA,
        discount_percent: discountPercent,
        total_hours: totalHours,
        total_lessons: totalLessons,
        highlights: form.highlights.filter(Boolean),
        slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        pack_price_cfa: Number(form.pack_price_cfa) || 0,
      };
      delete data.id;
      delete data.created_at;
      delete data.updated_at;
      delete data.created_by;

      if (packId) {
        await base44.entities.CoursePack.update(packId, data);
      } else {
        await base44.entities.CoursePack.create(data);
      }
      queryClient.invalidateQueries({ queryKey: ['instructor-packs'] });
      navigate(createPageUrl('InstructorDashboard'));
    } catch (err) {
      console.error('PackBuilder save error:', err);
      setSaveError(err?.message || 'Erreur lors de l\'enregistrement. La table "course_packs" existe-t-elle dans Supabase ?');
    } finally {
      setSaving(false);
    }
  };

  const previewPack = {
    ...form,
    course_titles: selectedCourses.map(c => c.title),
    total_price_cfa: totalPriceCFA,
    discount_percent: discountPercent,
    total_hours: totalHours,
    pack_price_cfa: form.pack_price_cfa,
    course_ids: form.course_ids,
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link to={createPageUrl('InstructorDashboard')}>
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-[#1B1F3B]">{packId ? 'Modifier le pack' : 'Créer un pack de cours'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{form.course_ids.length} cours sélectionné(s)</p>
        </div>
        <Button variant="outline" onClick={() => setPreview(!preview)} className="hidden md:flex">
          <Eye className="w-4 h-4 mr-2" />
          {preview ? 'Masquer' : 'Aperçu'}
        </Button>
        <Button onClick={handleSave} disabled={saving} className="bg-[#FF6B00] hover:bg-[#E55D00] text-white">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Enregistrer
        </Button>
      </div>
      {saveError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          {saveError}
        </div>
      )}

      <div className={`grid gap-6 ${preview ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
        <div className="space-y-6">
          {/* Pack info */}
          <Card className="border-gray-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="w-4 h-4 text-[#FF6B00]" />
                Informations du pack
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Titre du pack *</Label>
                <Input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Pack Développeur Web Complet"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Décrivez l'avantage du pack..."
                  className="mt-1 resize-none"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Badge promotionnel</Label>
                  <Input
                    value={form.badge_label}
                    onChange={e => setForm({ ...form, badge_label: e.target.value })}
                    placeholder="Ex: Offre limitée"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Expire le (optionnel)</Label>
                  <Input
                    type="date"
                    value={form.expires_at}
                    onChange={e => setForm({ ...form, expires_at: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label>Miniature</Label>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  {form.thumbnail_url && <img src={form.thumbnail_url} alt="" className="w-20 h-14 rounded-lg object-cover border border-gray-200" />}
                  <label className={`cursor-pointer inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 transition-colors ${uploadingThumbnail ? 'opacity-60 pointer-events-none' : ''}`}>
                    {uploadingThumbnail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploadingThumbnail ? 'Upload…' : 'Choisir une image'}
                    <input type="file" className="hidden" accept="image/*" onChange={handleUploadThumbnail} disabled={uploadingThumbnail} />
                  </label>
                  <Input value={form.thumbnail_url} onChange={e => setForm({ ...form, thumbnail_url: e.target.value })} placeholder="Ou coller une URL" className="text-sm max-w-xs" />
                </div>
                {thumbnailError && <p className="text-xs text-red-500 mt-1">{thumbnailError}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Course selector */}
          <Card className="border-gray-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Cours inclus dans le pack</CardTitle>
            </CardHeader>
            <CardContent>
              {myCourses.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Aucun cours publié disponible</p>
              ) : (
                <div className="space-y-2">
                  {myCourses.map(course => {
                    const selected = form.course_ids.includes(course.id);
                    return (
                      <button
                        key={course.id}
                        onClick={() => toggleCourse(course.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                          selected
                            ? 'border-[#FF6B00] bg-[#FFF3E8]'
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                          selected ? 'bg-[#FF6B00] border-[#FF6B00]' : 'border-gray-300'
                        }`}>
                          {selected && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{course.title}</p>
                          <p className="text-xs text-gray-400">{course.duration_hours}h • {course.price_cfa?.toLocaleString('fr-FR')} CFA</p>
                        </div>
                        {selected && <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] border-0 text-xs shrink-0">✓ Inclus</Badge>}
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="border-gray-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#FF6B00]" />
                Tarification du pack
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary */}
              {selectedCourses.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Prix total des cours séparément</span>
                    <span className="font-bold">{totalPriceCFA.toLocaleString('fr-FR')} CFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Prix du pack</span>
                    <span className="font-bold text-[#FF6B00]">{form.pack_price_cfa.toLocaleString('fr-FR')} CFA</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between border-t border-gray-200 pt-2">
                      <span className="text-green-600 font-semibold">Économies</span>
                      <span className="font-extrabold text-green-600">
                        {(totalPriceCFA - form.pack_price_cfa).toLocaleString('fr-FR')} CFA ({discountPercent}%)
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prix du pack (CFA) *</Label>
                  <Input
                    type="number"
                    value={form.pack_price_cfa}
                    onChange={e => setForm({ ...form, pack_price_cfa: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Statut</Label>
                  <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="published">Publié</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={e => setForm({ ...form, is_featured: e.target.checked })}
                  id="pack-featured"
                />
                <label htmlFor="pack-featured" className="text-sm text-gray-700">Mettre en avant sur la page d'accueil</label>
              </div>
            </CardContent>
          </Card>

          {/* Highlights */}
          <Card className="border-gray-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Points forts du pack</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {form.highlights.map((h, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={h}
                    onChange={e => {
                      const highlights = [...form.highlights];
                      highlights[i] = e.target.value;
                      setForm({ ...form, highlights });
                    }}
                    placeholder="Ex: 3 certifications incluses"
                    className="flex-1"
                  />
                  {form.highlights.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => {
                      setForm({ ...form, highlights: form.highlights.filter((_, idx) => idx !== i) });
                    }}>
                      <X className="w-4 h-4 text-red-400" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setForm({ ...form, highlights: [...form.highlights, ''] })}>
                <Plus className="w-3 h-3 mr-1" /> Ajouter
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Live preview */}
        {preview && (
          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4" /> Aperçu
            </h3>
            <PackCard pack={previewPack} />
          </div>
        )}
      </div>
    </div>
  );
}