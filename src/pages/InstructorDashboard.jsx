import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PackCard from '@/components/packs/PackCard';
import {
  DollarSign, Users, BookOpen, Star, Plus, Eye, BarChart3,
  HelpCircle, PenLine, Package, Clock, CheckCircle2, AlertCircle, Zap
} from 'lucide-react';

export default function InstructorDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const auth = await base44.auth.isAuthenticated();
        if (!auth) { base44.auth.redirectToLogin(); return; }
        setUser(await base44.auth.me());
      } catch (err) {
        console.error('InstructorDashboard load error:', err);
      }
    };
    load();
  }, []);

  const { data: courses } = useQuery({
    queryKey: ['instructor-courses', user?.email],
    queryFn: () => base44.entities.Course.filter({ instructor_email: user.email }, '-created_date'),
    enabled: !!user,
    initialData: [],
  });

  const { data: payments } = useQuery({
    queryKey: ['instructor-payments', user?.email],
    queryFn: () => base44.entities.Payment.filter({ instructor_email: user.email, status: 'completed' }),
    enabled: !!user,
    initialData: [],
  });

  const { data: quizzes } = useQuery({
    queryKey: ['instructor-quizzes', user?.email],
    queryFn: () => base44.entities.Quiz.filter({ instructor_email: user.email }, '-created_date'),
    enabled: !!user,
    initialData: [],
  });

  const { data: assignments } = useQuery({
    queryKey: ['instructor-assignments', user?.email],
    queryFn: () => base44.entities.Assignment.filter({ instructor_email: user.email }, '-created_date'),
    enabled: !!user,
    initialData: [],
  });

  const { data: packs } = useQuery({
    queryKey: ['instructor-packs', user?.email],
    queryFn: () => base44.entities.CoursePack.filter({ instructor_email: user.email }, '-created_date'),
    enabled: !!user,
    initialData: [],
  });

  if (!user) return null;

  const totalRevenue = payments.reduce((acc, p) => acc + (p.instructor_amount || 0), 0);
  const totalStudents = courses.reduce((acc, c) => acc + (c.total_students || 0), 0);
  const avgRating = courses.length > 0
    ? courses.reduce((acc, c) => acc + (c.average_rating || 0), 0) / courses.length
    : 0;

  const pendingSubmissions = assignments.reduce((acc, a) =>
    acc + (a.submissions?.filter(s => s.status === 'pending').length || 0), 0
  );
  const firstPendingAssignmentId = assignments.find(a => a.submissions?.some(s => s.status === 'pending'))?.id;

  const stats = [
    { title: 'Revenus totaux', value: `${totalRevenue.toLocaleString('fr-FR')} CFA`, icon: DollarSign, color: 'bg-green-50 text-green-600' },
    { title: 'Apprenants', value: totalStudents, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { title: 'Cours publiés', value: courses.filter(c => c.status === 'published').length, icon: BookOpen, color: 'bg-[#FFF3E8] text-[#FF6B00]' },
    { title: 'Note moyenne', value: avgRating.toFixed(1), icon: Star, color: 'bg-yellow-50 text-yellow-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1B1F3B]">Espace Formateur</h1>
          <p className="text-gray-500 mt-1">Gère tes cours, quiz, devoirs et packs</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={createPageUrl('InstructorAnalytics')}>
            <Button variant="outline" className="border-indigo-400 text-indigo-600 hover:bg-indigo-50">
              <BarChart3 className="w-4 h-4 mr-2" />Analytiques
            </Button>
          </Link>
          <Link to={createPageUrl('PackBuilder')}>
            <Button variant="outline" className="border-[#FF6B00] text-[#FF6B00] hover:bg-[#FFF3E8]">
              <Package className="w-4 h-4 mr-2" />Créer un pack
            </Button>
          </Link>
          <Link to={createPageUrl('QuizBuilder')}>
            <Button variant="outline" className="border-purple-500 text-purple-600 hover:bg-purple-50">
              <HelpCircle className="w-4 h-4 mr-2" />Créer un quiz
            </Button>
          </Link>
          <Link to={createPageUrl('CourseBuilder')}>
            <Button className="bg-[#FF6B00] hover:bg-[#E55D00] text-white">
              <Plus className="w-4 h-4 mr-2" />Créer un cours
            </Button>
          </Link>
        </div>
      </div>

      {/* Alert: pending submissions */}
      {pendingSubmissions > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <span className="text-sm text-amber-700 font-semibold">
            {pendingSubmissions} devoir(s) en attente d'évaluation
          </span>
          <Link to={createPageUrl('AssignmentReview') + (firstPendingAssignmentId ? `?id=${firstPendingAssignmentId}` : '')} className="ml-auto">
            <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">Évaluer</Button>
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border-gray-100">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{stat.title}</p>
                    <p className="text-xl font-extrabold text-[#1B1F3B]">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="courses">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="courses">Mes cours ({courses.length})</TabsTrigger>
          <TabsTrigger value="quizzes">Quiz ({quizzes.length})</TabsTrigger>
          <TabsTrigger value="assignments" className="relative">
            Devoirs ({assignments.length})
            {pendingSubmissions > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {pendingSubmissions}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="packs">Packs ({packs.length})</TabsTrigger>
        </TabsList>

        {/* COURSES */}
        <TabsContent value="courses">
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="p-5 border-b border-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#1B1F3B]">Mes cours</h2>
              <Link to={createPageUrl('CourseBuilder')}>
                <Button size="sm" className="bg-[#FF6B00] hover:bg-[#E55D00] text-white"><Plus className="w-4 h-4 mr-1" />Nouveau</Button>
              </Link>
            </div>
            {courses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 mb-4">Tu n'as pas encore créé de cours</p>
                <Link to={createPageUrl('CourseBuilder')}>
                  <Button className="bg-[#FF6B00] hover:bg-[#E55D00] text-white">
                    <Plus className="w-4 h-4 mr-2" /> Créer mon premier cours
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {courses.map(course => (
                  <div key={course.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-gray-50/50 transition-colors">
                    <div className="w-20 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {course.thumbnail_url && <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-[#1B1F3B] truncate">{course.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span>{course.total_students || 0} étudiants</span>
                        <span>{course.price_cfa?.toLocaleString('fr-FR')} CFA</span>
                      </div>
                    </div>
                    <Badge className={
                      course.status === 'published' ? 'bg-green-100 text-green-700 border-0' :
                      course.status === 'review' ? 'bg-yellow-100 text-yellow-700 border-0' :
                      'bg-gray-100 text-gray-600 border-0'
                    }>
                      {course.status === 'published' ? 'Publié' : course.status === 'review' ? 'En revue' : 'Brouillon'}
                    </Badge>
                    <Link to={createPageUrl('CourseBuilder') + `?id=${course.id}`}>
                      <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* QUIZZES */}
        <TabsContent value="quizzes">
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="p-5 border-b border-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#1B1F3B]">Mes quiz</h2>
              <Link to={createPageUrl('QuizBuilder')}>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white"><Plus className="w-4 h-4 mr-1" />Nouveau quiz</Button>
              </Link>
            </div>
            {quizzes.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 mb-4">Aucun quiz créé</p>
                <Link to={createPageUrl('QuizBuilder')}>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white"><Plus className="w-4 h-4 mr-2" />Créer un quiz</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {quizzes.map(quiz => (
                  <div key={quiz.id} className="p-5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                      <HelpCircle className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-[#1B1F3B] truncate">{quiz.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {quiz.questions?.length || 0} questions • Score requis: {quiz.passing_score}%
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {['multiple_choice', 'drag_drop', 'matching'].filter(t =>
                        quiz.questions?.some(q => q.type === t)
                      ).map(t => (
                        <Badge key={t} variant="outline" className="text-[10px] px-1.5 py-0">
                          {t === 'multiple_choice' ? 'QCM' : t === 'drag_drop' ? 'Drag' : 'Assoc.'}
                        </Badge>
                      ))}
                    </div>
                    <Link to={createPageUrl('QuizBuilder') + `?id=${quiz.id}`}>
                      <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ASSIGNMENTS */}
        <TabsContent value="assignments">
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="p-5 border-b border-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#1B1F3B]">Mes devoirs</h2>
            </div>
            {assignments.length === 0 ? (
              <div className="text-center py-12">
                <PenLine className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400">Aucun devoir créé. Ajoutez des devoirs depuis le Course Builder.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {assignments.map(assignment => {
                  const subPending = assignment.submissions?.filter(s => s.status === 'pending').length || 0;
                  const subTotal = assignment.submissions?.length || 0;
                  return (
                    <div key={assignment.id} className="p-5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                      <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                        <PenLine className="w-5 h-5 text-amber-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-[#1B1F3B] truncate">{assignment.title}</h3>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{subTotal} rendu(s)</span>
                          {subPending > 0 && (
                            <span className="flex items-center gap-1 text-amber-500 font-semibold">
                              <Clock className="w-3 h-3" />{subPending} en attente
                            </span>
                          )}
                          {subPending === 0 && subTotal > 0 && (
                            <span className="flex items-center gap-1 text-green-500">
                              <CheckCircle2 className="w-3 h-3" />Tous évalués
                            </span>
                          )}
                        </div>
                      </div>
                      <Link to={createPageUrl('AssignmentReview') + `?id=${assignment.id}`}>
                        <Button size="sm" className={subPending > 0 ? 'bg-[#FF6B00] hover:bg-[#E55D00] text-white' : ''} variant={subPending > 0 ? 'default' : 'outline'}>
                          {subPending > 0 ? `Évaluer (${subPending})` : 'Voir'}
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* PACKS */}
        <TabsContent value="packs">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-[#1B1F3B]">Mes packs de cours</h2>
            <Link to={createPageUrl('PackBuilder')}>
              <Button className="bg-[#FF6B00] hover:bg-[#E55D00] text-white">
                <Package className="w-4 h-4 mr-2" />Créer un pack
              </Button>
            </Link>
          </div>
          {packs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 text-center py-16">
              <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <h3 className="font-bold text-gray-400 mb-2">Aucun pack créé</h3>
              <p className="text-sm text-gray-400 mb-5 max-w-sm mx-auto">
                Les packs permettent de regrouper plusieurs cours avec une réduction attractive pour booster tes ventes.
              </p>
              <Link to={createPageUrl('PackBuilder')}>
                <Button className="bg-[#FF6B00] hover:bg-[#E55D00] text-white">
                  <Zap className="w-4 h-4 mr-2" />Créer mon premier pack
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packs.map(pack => (
                <div key={pack.id} className="relative group">
                  <PackCard pack={pack} />
                  <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Link to={createPageUrl('PackBuilder') + `?id=${pack.id}`}>
                      <Button size="sm" className="bg-white text-[#1B1F3B] shadow-lg hover:bg-gray-50">
                        <Eye className="w-3.5 h-3.5 mr-1" />Modifier
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}