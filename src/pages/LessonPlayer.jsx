import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

function isYouTubeOrVimeo(url) {
  if (!url) return false;
  return /youtube\.com|youtu\.be|youtube\.com\/embed|vimeo\.com/i.test(url);
}

function sanitizeEmbedUrl(url) {
  if (!url) return '';
  // Déjà en format embed YouTube
  if (url.includes('youtube.com/embed/')) return url.split('?')[0] + '?rel=0&autoplay=1';
  // youtube.com/watch?v=XXX ou youtu.be/XXX → embed
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0&autoplay=1`;
  // vimeo.com/XXX → embed
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;
  return url;
}
import { createPageUrl } from '@/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Play, CheckCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  BookOpen, FileText, Download, MessageCircle, Lock, Video, PenLine
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function LessonPlayer() {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('courseId');
  const lessonParam = urlParams.get('lessonId');

  const [user, setUser] = useState(null);
  const [currentLessonId, setCurrentLessonId] = useState(lessonParam || null);
  const [expandedSections, setExpandedSections] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [noteText, setNoteText] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const load = async () => {
      try {
        const auth = await base44.auth.isAuthenticated();
        if (!auth) { base44.auth.redirectToLogin(); return; }
        setUser(await base44.auth.me());
      } catch (err) {
        console.error('LessonPlayer load error:', err);
      }
    };
    load();
  }, []);

  const { data: course, isFetched: courseFetched } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => base44.entities.Course.filter({ id: courseId }),
    enabled: !!courseId,
    select: d => d?.[0],
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', courseId, user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ course_id: courseId, user_email: user.email }),
    enabled: !!courseId && !!user,
    select: d => d?.[0],
  });

  // Flatten all lessons
  const allLessons = useMemo(() => {
    if (!course?.sections) return [];
    return course.sections.flatMap(s => 
      (s.lessons || []).map(l => ({ ...l, sectionTitle: s.title, sectionId: s.id }))
    );
  }, [course]);

  // Set first lesson if none selected
  useEffect(() => {
    if (!currentLessonId && allLessons.length > 0) {
      const current = enrollment?.current_lesson_id || allLessons[0].id;
      setCurrentLessonId(current);
    }
  }, [allLessons, enrollment, currentLessonId]);

  const currentLesson = allLessons.find(l => l.id === currentLessonId);
  const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const completedLessons = enrollment?.completed_lessons || [];
  const progress = allLessons.length > 0 ? Math.round((completedLessons.length / allLessons.length) * 100) : 0;

  const markComplete = useMutation({
    mutationFn: async () => {
      const updated = [...new Set([...completedLessons, currentLessonId])];
      const newProgress = Math.round((updated.length / allLessons.length) * 100);
      await base44.entities.Enrollment.update(enrollment.id, {
        completed_lessons: updated,
        progress_percent: newProgress,
        current_lesson_id: nextLesson?.id || currentLessonId,
        last_activity_date: new Date().toISOString().split('T')[0],
        status: newProgress >= 100 ? 'completed' : 'active',
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['enrollment'] }),
  });

  const isCompleted = completedLessons.includes(currentLessonId);

  const courseNotFound = courseId && courseFetched && !course;

  if (!courseId || courseNotFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-[#1B1F3B] mb-2">Cours introuvable</h2>
        <p className="text-gray-500 mb-4">L'URL est invalide ou le cours n'existe plus.</p>
        <Link to={createPageUrl('Catalog')} className="text-[#FF6B00] font-semibold hover:underline">Voir le catalogue</Link>
      </div>
    );
  }

  if (!course || !user) return <div className="flex items-center justify-center h-screen text-gray-400">Chargement...</div>;

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-r border-gray-100 overflow-y-auto shrink-0 hidden md:block`}>
        {sidebarOpen && (
          <div className="p-4">
            <h3 className="font-bold text-sm text-[#1B1F3B] mb-2 line-clamp-2">{course.title}</h3>
            <div className="flex items-center gap-2 mb-4">
              <Progress value={progress} className="h-2 flex-1" />
              <span className="text-xs font-bold text-[#FF6B00]">{progress}%</span>
            </div>

            <div className="space-y-1">
              {course.sections?.map((section, si) => (
                <div key={section.id || si}>
                  <button
                    onClick={() => setExpandedSections(p => ({ ...p, [si]: !p[si] }))}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <span className="text-xs font-semibold text-gray-700 line-clamp-1">{section.title}</span>
                    {expandedSections[si] ? <ChevronUp className="w-3.5 h-3.5 text-gray-400 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                  </button>
                  {expandedSections[si] !== false && (
                    <div className="ml-2 space-y-0.5">
                      {section.lessons?.map(lesson => {
                        const done = completedLessons.includes(lesson.id);
                        const active = lesson.id === currentLessonId;
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setCurrentLessonId(lesson.id)}
                            className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left text-xs transition-all ${
                              active ? 'bg-[#FFF3E8] text-[#FF6B00]' : done ? 'text-gray-500' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {done ? (
                              <CheckCircle className="w-4 h-4 text-[#00C9A7] shrink-0" />
                            ) : lesson.type === 'video' ? (
                              <Video className="w-4 h-4 shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 shrink-0" />
                            )}
                            <span className="line-clamp-1 flex-1">{lesson.title}</span>
                            <span className="text-[10px] text-gray-400 shrink-0">{lesson.duration_minutes}m</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {currentLesson ? (
          <div>
            {/* Video / Content area */}
            <div className="bg-black aspect-video max-h-[60vh] flex items-center justify-center">
              {currentLesson.video_url ? (
                isYouTubeOrVimeo(currentLesson.video_url) ? (
                  <iframe
                    key={currentLesson.video_url}
                    src={sanitizeEmbedUrl(currentLesson.video_url)}
                    title={currentLesson.title || 'Vidéo'}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    key={currentLesson.video_url}
                    src={currentLesson.video_url}
                    controls
                    className="w-full h-full"
                    autoPlay
                  />
                )
              ) : (
                <div className="text-center text-white/60">
                  <FileText className="w-16 h-16 mx-auto mb-4" />
                  <p>Leçon texte</p>
                </div>
              )}
            </div>

            {/* Lesson info */}
            <div className="max-w-4xl mx-auto p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <Badge variant="outline" className="mb-2 text-xs">{currentLesson.sectionTitle}</Badge>
                  <h1 className="text-2xl font-extrabold text-[#1B1F3B]">{currentLesson.title}</h1>
                </div>
                {!isCompleted && enrollment && (
                  <Button
                    onClick={() => markComplete.mutate()}
                    className="bg-[#00C9A7] hover:bg-[#00B396] text-white shrink-0"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Terminé
                  </Button>
                )}
                {isCompleted && (
                  <Badge className="bg-[#00C9A7]/10 text-[#00C9A7] border-0 px-3 py-1.5">
                    <CheckCircle className="w-4 h-4 mr-1" />Complété
                  </Badge>
                )}
              </div>

              {/* Lesson text content */}
              {currentLesson.content && (
                <div className="prose prose-sm max-w-none mb-8 text-gray-700 leading-relaxed">
                  {currentLesson.content}
                </div>
              )}

              {/* Resources */}
              {currentLesson.resources?.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-bold text-sm mb-3">Ressources</h3>
                  <div className="space-y-2">
                    {currentLesson.resources.map((r, i) => (
                      <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                        <Download className="w-4 h-4 text-[#FF6B00]" />
                        <span>{r.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center border-t border-gray-100 pt-6">
                {prevLesson ? (
                  <Button variant="outline" onClick={() => setCurrentLessonId(prevLesson.id)}>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Précédent
                  </Button>
                ) : <div />}
                {nextLesson ? (
                  <Button onClick={() => setCurrentLessonId(nextLesson.id)} className="bg-[#FF6B00] hover:bg-[#E55D00] text-white">
                    Suivant
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : <div />}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Sélectionne une leçon pour commencer
          </div>
        )}
      </div>
    </div>
  );
}