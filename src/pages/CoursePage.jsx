import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { applyPageSEO } from '@/lib/seo';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Star, Clock, BookOpen, Users, Award, CheckCircle, Play, ChevronDown, ChevronUp,
  Shield, RefreshCw, Globe, FileText, Download, MessageCircle, Lock, Loader2
} from 'lucide-react';

export default function CoursePage() {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');

  const [expandedSections, setExpandedSections] = useState({});
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');

  useEffect(() => {
    const load = async () => {
      const auth = await base44.auth.isAuthenticated();
      setIsAuth(auth);
      if (auth) setUser(await base44.auth.me());
    };
    load();
  }, []);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => base44.entities.Course.filter({ id: courseId }),
    enabled: !!courseId,
    select: data => data?.[0],
  });

  useEffect(() => {
    if (course?.title) applyPageSEO('CoursePage', { courseTitle: course.title });
  }, [course?.title]);

  const { data: reviews } = useQuery({
    queryKey: ['reviews', courseId],
    queryFn: () => base44.entities.Review.filter({ course_id: courseId }, '-created_date', 20),
    enabled: !!courseId,
    initialData: [],
  });

  const { data: enrollments } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: () => isAuth ? base44.entities.Enrollment.filter({ user_email: user?.email }) : [],
    enabled: isAuth && !!user,
    initialData: [],
  });

  const isEnrolled = enrollments.some(e => e.course_id === courseId);
  const queryClient = useQueryClient();

  const handleEnrollFree = async () => {
    if (!isAuth) { base44.auth.redirectToLogin(); return; }
    setPurchaseError('');
    setPurchasing(true);
    try {
      await base44.entities.Enrollment.create({
        user_email: user.email,
        user_name: user.full_name,
        course_id: courseId,
        course_title: course.title,
        completed_lessons: [],
        status: 'active',
      });
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
    } catch (err) {
      setPurchaseError(err?.message || 'Erreur lors de l\'inscription. Réessaie.');
    } finally {
      setPurchasing(false);
    }
  };

  const handlePurchase = async () => {
    if (!isAuth) {
      base44.auth.redirectToLogin();
      return;
    }
    setPurchaseError('');
    setPurchasing(true);
    try {
      await base44.entities.Payment.create({
        user_email: user.email,
        user_name: user.full_name,
        course_id: courseId,
        course_title: course.title,
        amount_cfa: course.price_cfa,
        method: 'orange_money',
        status: 'completed',
        instructor_email: course.instructor_email,
        instructor_amount: course.price_cfa * 0.8,
        platform_amount: course.price_cfa * 0.2,
      });
      await base44.entities.Enrollment.create({
        user_email: user.email,
        user_name: user.full_name,
        course_id: courseId,
        course_title: course.title,
        completed_lessons: [],
        status: 'active',
      });
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
    } catch (err) {
      setPurchaseError(err?.message || 'Erreur lors du paiement. Réessaie.');
    } finally {
      setPurchasing(false);
    }
  };

  const toggleSection = (id) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading || !course) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-400">Chargement...</div>;
  }

  const discount = course.original_price_cfa && course.original_price_cfa > course.price_cfa
    ? Math.round((1 - course.price_cfa / course.original_price_cfa) * 100)
    : 0;

  const totalLessons = course.sections?.reduce((acc, s) => acc + (s.lessons?.length || 0), 0) || 0;
  const totalDuration = course.sections?.reduce((acc, s) =>
    acc + (s.lessons?.reduce((a, l) => a + (l.duration_minutes || 0), 0) || 0), 0) || 0;

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#1B1F3B] to-[#252A4A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="flex flex-wrap gap-2 mb-4">
                {course.is_bestseller && <Badge className="bg-[#FF6B00] text-white border-0">🔥 Top vente</Badge>}
                {course.is_new && <Badge className="bg-[#00C9A7] text-white border-0">Nouveau</Badge>}
                {course.has_certificate && <Badge variant="outline" className="border-white/20 text-white"><Award className="w-3 h-3 mr-1" />Certifiant</Badge>}
                <Badge variant="outline" className="border-white/20 text-white capitalize">{course.level}</Badge>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">{course.title}</h1>
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">{course.description}</p>

              {course.average_rating > 0 && (
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xl font-bold text-[#F59E0B]">{course.average_rating.toFixed(1)}</span>
                  <div className="flex">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-5 h-5 ${i <= Math.round(course.average_rating) ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-gray-500'}`} />
                    ))}
                  </div>
                  <span className="text-gray-400">({course.total_reviews} avis)</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-400 flex items-center gap-1"><Users className="w-4 h-4" />{course.total_students} apprenants</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">
                  {course.instructor_name?.[0] || 'F'}
                </div>
                <div>
                  <span className="text-sm text-gray-300">Créé par</span>
                  <span className="text-white font-semibold ml-1">{course.instructor_name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left content */}
          <div className="md:col-span-2 space-y-8">
            {/* What you'll learn */}
            {course.learning_objectives?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-xl font-extrabold text-[#1B1F3B] mb-4">Ce que tu vas apprendre</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {course.learning_objectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#00C9A7] mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-700">{obj}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course content */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-extrabold text-[#1B1F3B]">Contenu du cours</h2>
                <span className="text-sm text-gray-500">{course.sections?.length || 0} sections • {totalLessons} leçons • {Math.round(totalDuration / 60)}h</span>
              </div>
              <div className="space-y-2">
                {course.sections?.map((section, si) => (
                  <div key={section.id || si} className="border border-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection(section.id || si)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {expandedSections[section.id || si] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        <span className="font-semibold text-sm text-[#1B1F3B]">{section.title}</span>
                      </div>
                      <span className="text-xs text-gray-400">{section.lessons?.length || 0} leçons</span>
                    </button>
                    {expandedSections[section.id || si] && section.lessons && (
                      <div className="border-t border-gray-50 bg-gray-50/50">
                        {section.lessons.map((lesson, li) => (
                          <div key={lesson.id || li} className="flex items-center justify-between px-4 py-3 text-sm">
                            <div className="flex items-center gap-3">
                              {lesson.is_free ? (
                                <Play className="w-4 h-4 text-[#FF6B00]" />
                              ) : (
                                <Lock className="w-4 h-4 text-gray-300" />
                              )}
                              <span className="text-gray-700">{lesson.title}</span>
                              {lesson.is_free && <Badge className="bg-[#00C9A7]/10 text-[#00C9A7] border-0 text-xs">Gratuit</Badge>}
                            </div>
                            <span className="text-xs text-gray-400">{lesson.duration_minutes}min</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-xl font-extrabold text-[#1B1F3B] mb-6">Avis des apprenants</h2>
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review.id} className="border-b border-gray-50 pb-4 last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-[#FF6B00]/10 flex items-center justify-center text-[#FF6B00] font-bold text-xs">
                          {review.user_name?.[0] || 'A'}
                        </div>
                        <div>
                          <span className="font-semibold text-sm">{review.user_name || 'Apprenant'}</span>
                          <div className="flex mt-0.5">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} className={`w-3 h-3 ${i <= review.rating ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-gray-200'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar - sticky purchase card */}
          <div className="md:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-lg">
                {course.thumbnail_url && (
                  <div className="relative aspect-video">
                    <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                        <Play className="w-7 h-7 text-[#FF6B00] ml-1" />
                      </div>
                    </div>
                  </div>
                )}
                <div className="p-6">
                  {course.is_free ? (
                    <div className="mb-4">
                      <span className="text-3xl font-extrabold text-[#00C9A7]">Gratuit</span>
                      <p className="text-xs text-gray-400 mt-1">Accès complet sans paiement</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-end gap-2 mb-1">
                        <span className="text-3xl font-extrabold text-[#1B1F3B]">{course.price_cfa?.toLocaleString('fr-FR')} CFA</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-sm text-gray-400 line-through">{course.original_price_cfa?.toLocaleString('fr-FR')} CFA</span>
                          <Badge className="bg-red-500 text-white border-0 text-xs">-{discount}%</Badge>
                        </div>
                      )}
                    </>
                  )}

                  {isEnrolled ? (
                    <Link to={createPageUrl('LessonPlayer') + `?courseId=${courseId}`}>
                      <Button className="w-full bg-[#00C9A7] hover:bg-[#00B396] text-white h-12 text-base font-bold mb-3">
                        <Play className="w-5 h-5 mr-2" />
                        Continuer le cours
                      </Button>
                    </Link>
                  ) : course.is_free ? (
                    <Button
                      onClick={handleEnrollFree}
                      disabled={purchasing}
                      className="w-full bg-[#00C9A7] hover:bg-[#00B396] text-white h-12 text-base font-bold mb-3"
                    >
                      {purchasing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                      {purchasing ? 'Inscription...' : '🎁 S\'inscrire gratuitement'}
                    </Button>
                  ) : (
                    <Button
                      onClick={handlePurchase}
                      disabled={purchasing}
                      className="w-full bg-[#FF6B00] hover:bg-[#E55D00] text-white h-12 text-base font-bold cta-pulse mb-3"
                    >
                      {purchasing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                      {purchasing ? 'Traitement...' : 'Acheter maintenant'}
                    </Button>
                  )}

                  {purchaseError && <p className="text-sm text-red-500 mb-3">{purchaseError}</p>}

                  <p className="text-center text-xs text-gray-400 mb-4">Garantie satisfait ou remboursé 7 jours</p>

                  <div className="space-y-3 text-sm">
                    <h4 className="font-bold text-[#1B1F3B]">Ce cours inclut :</h4>
                    {course.includes?.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-4 h-4 text-[#00C9A7]" />
                        {item}
                      </div>
                    ))}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4 text-[#00C9A7]" />
                      {course.duration_hours}h de contenu
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <BookOpen className="w-4 h-4 text-[#00C9A7]" />
                      {totalLessons} leçons
                    </div>
                    {course.has_certificate && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Award className="w-4 h-4 text-[#00C9A7]" />
                        Certificat de fin
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <RefreshCw className="w-4 h-4 text-[#00C9A7]" />
                      Accès à vie
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Globe className="w-4 h-4 text-[#00C9A7]" />
                      Accessible mobile & PC
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}