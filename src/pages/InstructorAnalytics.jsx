import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  DollarSign, Users, TrendingUp, Star, BookOpen, Award,
  ArrowLeft, BarChart3, CheckCircle2, HelpCircle, PenLine, Clock
} from 'lucide-react';
import { format, subDays, parseISO, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';

const COLORS = ['#FF6B00', '#00C9A7', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function InstructorAnalytics() {
  const [user, setUser] = useState(null);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    const load = async () => {
      const auth = await base44.auth.isAuthenticated();
      if (!auth) { base44.auth.redirectToLogin(); return; }
      setUser(await base44.auth.me());
    };
    load();
  }, []);

  const { data: courses } = useQuery({
    queryKey: ['analytics-courses', user?.email],
    queryFn: () => base44.entities.Course.filter({ instructor_email: user.email }),
    enabled: !!user, initialData: [],
  });

  const { data: payments } = useQuery({
    queryKey: ['analytics-payments', user?.email],
    queryFn: () => base44.entities.Payment.filter({ instructor_email: user.email, status: 'completed' }),
    enabled: !!user, initialData: [],
  });

  const { data: enrollments } = useQuery({
    queryKey: ['analytics-enrollments'],
    queryFn: () => base44.entities.Enrollment.list('-created_date', 500),
    enabled: !!user, initialData: [],
  });

  const { data: quizzes } = useQuery({
    queryKey: ['analytics-quizzes', user?.email],
    queryFn: () => base44.entities.Quiz.filter({ instructor_email: user.email }),
    enabled: !!user, initialData: [],
  });

  const { data: assignments } = useQuery({
    queryKey: ['analytics-assignments', user?.email],
    queryFn: () => base44.entities.Assignment.filter({ instructor_email: user.email }),
    enabled: !!user, initialData: [],
  });

  const { data: packs } = useQuery({
    queryKey: ['analytics-packs', user?.email],
    queryFn: () => base44.entities.CoursePack.filter({ instructor_email: user.email }),
    enabled: !!user, initialData: [],
  });

  const courseIds = useMemo(() => new Set(courses.map(c => c.id)), [courses]);
  const myEnrollments = useMemo(() => enrollments.filter(e => courseIds.has(e.course_id)), [enrollments, courseIds]);
  const periodStart = useMemo(() => subDays(new Date(), period), [period]);
  const recentPayments = useMemo(() => payments.filter(p => p.created_at && isAfter(parseISO(p.created_at), periodStart)), [payments, periodStart]);

  // ── Revenue over time ──
  const revenueByDay = useMemo(() => {
    const map = {};
    for (let i = period - 1; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'dd/MM');
      map[d] = 0;
    }
    recentPayments.forEach(p => {
      const d = format(parseISO(p.created_at), 'dd/MM');
      if (map[d] !== undefined) map[d] += p.instructor_amount || 0;
    });
    return Object.entries(map).map(([date, revenue]) => ({ date, revenue }));
  }, [recentPayments, period]);

  // ── Revenue per course ──
  const revenueByCourse = useMemo(() => {
    const map = {};
    payments.forEach(p => {
      const title = p.course_title || 'Inconnu';
      map[title] = (map[title] || 0) + (p.instructor_amount || 0);
    });
    return Object.entries(map)
      .map(([name, revenue]) => ({ name: name.length > 20 ? name.slice(0, 20) + '…' : name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [payments]);

  // ── Completion rates ──
  const completionByCourse = useMemo(() => {
    return courses.map(course => {
      const enrolled = myEnrollments.filter(e => e.course_id === course.id);
      const completed = enrolled.filter(e => e.status === 'completed').length;
      const rate = enrolled.length > 0 ? Math.round((completed / enrolled.length) * 100) : 0;
      return {
        name: course.title.length > 22 ? course.title.slice(0, 22) + '…' : course.title,
        inscrits: enrolled.length,
        completes: completed,
        taux: rate,
      };
    }).filter(c => c.inscrits > 0).sort((a, b) => b.inscrits - a.inscrits).slice(0, 6);
  }, [courses, myEnrollments]);

  // ── Quiz avg scores ──
  const quizScores = useMemo(() => {
    return quizzes.map(quiz => {
      const scores = myEnrollments
        .flatMap(e => e.quiz_scores || [])
        .filter(qs => qs.quiz_id === quiz.id && qs.max_score > 0)
        .map(qs => (qs.score / qs.max_score) * 100);
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
      return {
        name: quiz.title.length > 22 ? quiz.title.slice(0, 22) + '…' : quiz.title,
        avg,
        attempts: scores.length,
        passing: quiz.passing_score || 70,
      };
    }).filter(q => q.avg !== null);
  }, [quizzes, myEnrollments]);

  // ── Assignment avg scores ──
  const assignmentScores = useMemo(() => {
    return assignments.map(a => {
      const reviewed = (a.submissions || []).filter(s => s.score !== undefined && s.score !== null);
      const avg = reviewed.length > 0
        ? Math.round(reviewed.reduce((acc, s) => acc + s.score, 0) / reviewed.length)
        : null;
      return {
        name: a.title.length > 22 ? a.title.slice(0, 22) + '…' : a.title,
        avg,
        total: (a.submissions || []).length,
        reviewed: reviewed.length,
        maxScore: a.max_score || 100,
      };
    });
  }, [assignments]);

  // ── Engagement: avg progress ──
  const engagementByCourse = useMemo(() => {
    return courses.map(course => {
      const enrolled = myEnrollments.filter(e => e.course_id === course.id);
      const avgProgress = enrolled.length > 0
        ? Math.round(enrolled.reduce((acc, e) => acc + (e.progress_percent || 0), 0) / enrolled.length)
        : 0;
      const activeRecently = enrolled.filter(e =>
        e.last_activity_date && isAfter(parseISO(e.last_activity_date), subDays(new Date(), 7))
      ).length;
      return {
        name: course.title.length > 22 ? course.title.slice(0, 22) + '…' : course.title,
        progression: avgProgress,
        actifsRecents: activeRecently,
        total: enrolled.length,
      };
    }).filter(c => c.total > 0).sort((a, b) => b.total - a.total).slice(0, 6);
  }, [courses, myEnrollments]);

  // ── Status distribution ──
  const courseStatusData = useMemo(() => [
    { name: 'Publiés', value: courses.filter(c => c.status === 'published').length },
    { name: 'Brouillons', value: courses.filter(c => c.status === 'draft').length },
    { name: 'En revue', value: courses.filter(c => c.status === 'review').length },
  ].filter(d => d.value > 0), [courses]);

  const totalRevenue = useMemo(() => payments.reduce((acc, p) => acc + (p.instructor_amount || 0), 0), [payments]);
  const recentRevenue = useMemo(() => recentPayments.reduce((acc, p) => acc + (p.instructor_amount || 0), 0), [recentPayments]);
  const avgCompletion = useMemo(() => completionByCourse.length > 0
    ? Math.round(completionByCourse.reduce((acc, c) => acc + c.taux, 0) / completionByCourse.length)
    : 0, [completionByCourse]);
  const avgQuizScore = useMemo(() => quizScores.length > 0
    ? Math.round(quizScores.reduce((acc, q) => acc + q.avg, 0) / quizScores.length)
    : 0, [quizScores]);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('InstructorDashboard')}>
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Tableau de bord</Button>
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-[#1B1F3B] flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-[#FF6B00]" />Analytiques
            </h1>
            <p className="text-gray-400 text-sm">Vue détaillée de tes performances</p>
          </div>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map(d => (
            <Button
              key={d}
              size="sm"
              variant={period === d ? 'default' : 'outline'}
              onClick={() => setPeriod(d)}
              className={period === d ? 'bg-[#FF6B00] hover:bg-[#E55D00] text-white' : ''}
            >
              {d}j
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Revenus totaux', value: `${totalRevenue.toLocaleString('fr-FR')} CFA`, sub: `+${recentRevenue.toLocaleString('fr-FR')} sur ${period}j`, icon: DollarSign, color: 'text-green-600 bg-green-50' },
          { label: 'Apprenants inscrits', value: myEnrollments.length, sub: `${myEnrollments.filter(e => e.status === 'active').length} actifs`, icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Taux d\'achèvement', value: `${avgCompletion}%`, sub: `${completionByCourse.length} cours analysés`, icon: CheckCircle2, color: 'text-[#00C9A7] bg-[#E6FBF6]' },
          { label: 'Score moyen quiz', value: avgQuizScore > 0 ? `${avgQuizScore}%` : 'N/A', sub: `${quizScores.length} quiz évalués`, icon: HelpCircle, color: 'text-purple-600 bg-purple-50' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <Card key={i} className="border-gray-100">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${kpi.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{kpi.label}</p>
                    <p className="text-xl font-extrabold text-[#1B1F3B]">{kpi.value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{kpi.sub}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="sales">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="sales">💰 Ventes</TabsTrigger>
          <TabsTrigger value="completion">✅ Achèvement</TabsTrigger>
          <TabsTrigger value="quiz">🧠 Quiz & Devoirs</TabsTrigger>
          <TabsTrigger value="engagement">🔥 Engagement</TabsTrigger>
        </TabsList>

        {/* ── VENTES ── */}
        <TabsContent value="sales" className="space-y-6">
          <Card className="border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-[#1B1F3B]">Revenus sur les {period} derniers jours</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueByDay.some(d => d.revenue > 0) ? (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={revenueByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={period > 30 ? 6 : period > 14 ? 2 : 0} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={v => [`${v.toLocaleString('fr-FR')} CFA`, 'Revenus']} />
                    <Line type="monotone" dataKey="revenue" stroke="#FF6B00" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-40 flex items-center justify-center text-gray-300 text-sm">Aucune vente sur cette période</div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-gray-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-[#1B1F3B]">Revenus par cours</CardTitle>
              </CardHeader>
              <CardContent>
                {revenueByCourse.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={revenueByCourse} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                      <Tooltip formatter={v => [`${v.toLocaleString('fr-FR')} CFA`]} />
                      <Bar dataKey="revenue" fill="#FF6B00" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-40 flex items-center justify-center text-gray-300 text-sm">Aucune donnée</div>
                )}
              </CardContent>
            </Card>

            <Card className="border-gray-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-[#1B1F3B]">État du catalogue</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                {courseStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={courseStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                        {courseStatusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend iconType="circle" iconSize={10} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-40 flex items-center justify-center text-gray-300 text-sm">Aucun cours</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sales table */}
          <Card className="border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-[#1B1F3B]">Ventes par cours (détail)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-50 bg-gray-50/50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Cours</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">Ventes</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">Revenus</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {courses.filter(c => c.status === 'published').map(course => {
                      const sales = payments.filter(p => p.course_id === course.id).length;
                      const revenue = payments.filter(p => p.course_id === course.id).reduce((acc, p) => acc + (p.instructor_amount || 0), 0);
                      return (
                        <tr key={course.id} className="hover:bg-gray-50/50">
                          <td className="px-5 py-3 font-medium text-[#1B1F3B] max-w-[200px] truncate">{course.title}</td>
                          <td className="px-5 py-3 text-right text-gray-600">{sales}</td>
                          <td className="px-5 py-3 text-right font-semibold text-green-600">{revenue.toLocaleString('fr-FR')} CFA</td>
                          <td className="px-5 py-3 text-right">
                            {course.average_rating > 0 ? (
                              <span className="flex items-center justify-end gap-1">
                                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                {course.average_rating.toFixed(1)}
                              </span>
                            ) : <span className="text-gray-300">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {courses.filter(c => c.status === 'published').length === 0 && (
                  <p className="text-center text-gray-300 py-8 text-sm">Aucun cours publié</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ACHÈVEMENT ── */}
        <TabsContent value="completion" className="space-y-6">
          <Card className="border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-[#1B1F3B]">Taux d'achèvement par cours</CardTitle>
            </CardHeader>
            <CardContent>
              {completionByCourse.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={completionByCourse}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                    <Tooltip formatter={(v, name) => [name === 'taux' ? `${v}%` : v, name === 'taux' ? 'Taux' : name === 'inscrits' ? 'Inscrits' : 'Complétés']} />
                    <Bar dataKey="inscrits" fill="#e0e7ff" radius={[4, 4, 0, 0]} name="inscrits" />
                    <Bar dataKey="taux" fill="#00C9A7" radius={[4, 4, 0, 0]} name="taux" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-40 flex items-center justify-center text-gray-300 text-sm">Pas encore d'inscrits</div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {courses.map(course => {
              const enrolled = myEnrollments.filter(e => e.course_id === course.id);
              if (enrolled.length === 0) return null;
              const completed = enrolled.filter(e => e.status === 'completed').length;
              const active = enrolled.filter(e => e.status === 'active').length;
              const paused = enrolled.filter(e => e.status === 'paused').length;
              const rate = Math.round((completed / enrolled.length) * 100);
              return (
                <Card key={course.id} className="border-gray-100">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-sm text-[#1B1F3B]">{course.title}</h3>
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{enrolled.length} inscrits</span>
                          <span className="flex items-center gap-1 text-green-500"><CheckCircle2 className="w-3 h-3" />{completed} complétés</span>
                          <span className="flex items-center gap-1 text-blue-400"><TrendingUp className="w-3 h-3" />{active} en cours</span>
                          {paused > 0 && <span className="flex items-center gap-1 text-gray-400"><Clock className="w-3 h-3" />{paused} en pause</span>}
                        </div>
                        <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#00C9A7] rounded-full transition-all" style={{ width: `${rate}%` }} />
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-2xl font-extrabold ${rate >= 70 ? 'text-[#00C9A7]' : rate >= 40 ? 'text-yellow-500' : 'text-red-400'}`}>{rate}%</span>
                        <p className="text-xs text-gray-400">achèvement</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {myEnrollments.length === 0 && (
              <div className="text-center py-12 text-gray-300">Pas encore d'inscrits dans tes cours</div>
            )}
          </div>
        </TabsContent>

        {/* ── QUIZ & DEVOIRS ── */}
        <TabsContent value="quiz" className="space-y-6">
          <Card className="border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-[#1B1F3B] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-500" />Scores moyens aux quiz
              </CardTitle>
            </CardHeader>
            <CardContent>
              {quizScores.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={quizScores}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                      <Tooltip formatter={v => [`${v}%`]} />
                      <Bar dataKey="avg" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                        {quizScores.map((entry, i) => (
                          <Cell key={i} fill={entry.avg >= entry.passing ? '#00C9A7' : '#ef4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-gray-400 mt-2 text-center">Vert = score au-dessus du seuil de réussite</p>
                </>
              ) : (
                <div className="h-32 flex items-center justify-center text-gray-300 text-sm">Aucune donnée de quiz disponible</div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizScores.map((quiz, i) => (
              <Card key={i} className="border-gray-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-[#1B1F3B]">{quiz.name}</span>
                    <Badge className={quiz.avg >= quiz.passing ? 'bg-green-100 text-green-700 border-0' : 'bg-red-100 text-red-600 border-0'}>
                      {quiz.avg}%
                    </Badge>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${quiz.avg >= quiz.passing ? 'bg-[#00C9A7]' : 'bg-red-400'}`} style={{ width: `${quiz.avg}%` }} />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-400">
                    <span>{quiz.attempts} tentatives</span>
                    <span>Seuil: {quiz.passing}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-[#1B1F3B] flex items-center gap-2">
                <PenLine className="w-4 h-4 text-amber-500" />Scores moyens aux devoirs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignmentScores.filter(a => a.avg !== null).length > 0 ? (
                <div className="space-y-4">
                  {assignmentScores.filter(a => a.avg !== null).map((a, i) => {
                    const pct = Math.round((a.avg / a.maxScore) * 100);
                    return (
                      <div key={i}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-[#1B1F3B]">{a.name}</span>
                          <span className="text-sm font-bold text-[#FF6B00]">{a.avg}/{a.maxScore} pts ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#FF6B00] rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-gray-400">
                          <span>{a.reviewed} évalués / {a.total} rendus</span>
                          {a.total > a.reviewed && <span className="text-amber-500">{a.total - a.reviewed} en attente</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-300 text-sm">Aucun devoir évalué pour l'instant</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ENGAGEMENT ── */}
        <TabsContent value="engagement" className="space-y-6">
          <Card className="border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-[#1B1F3B]">Progression moyenne par cours</CardTitle>
            </CardHeader>
            <CardContent>
              {engagementByCourse.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={engagementByCourse}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                    <Tooltip formatter={(v, name) => [name === 'progression' ? `${v}%` : v, name === 'progression' ? 'Progression moy.' : 'Actifs 7j']} />
                    <Bar dataKey="progression" fill="#6366f1" radius={[4, 4, 0, 0]} name="progression" />
                    <Bar dataKey="actifsRecents" fill="#FF6B00" radius={[4, 4, 0, 0]} name="actifsRecents" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-40 flex items-center justify-center text-gray-300 text-sm">Pas encore d'inscrits</div>
              )}
              <div className="flex gap-4 mt-3 text-xs text-gray-400 justify-center">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#6366f1] inline-block" />Progression moyenne</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#FF6B00] inline-block" />Actifs (7 derniers jours)</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {engagementByCourse.map((item, i) => (
              <Card key={i} className="border-gray-100">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-sm text-[#1B1F3B] mb-3">{item.name}</h3>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-lg font-extrabold text-[#1B1F3B]">{item.total}</p>
                          <p className="text-xs text-gray-400">Inscrits</p>
                        </div>
                        <div className="bg-[#FFF3E8] rounded-xl p-3">
                          <p className="text-lg font-extrabold text-[#FF6B00]">{item.actifsRecents}</p>
                          <p className="text-xs text-gray-400">Actifs 7j</p>
                        </div>
                        <div className="bg-[#E6FBF6] rounded-xl p-3">
                          <p className="text-lg font-extrabold text-[#00C9A7]">{item.progression}%</p>
                          <p className="text-xs text-gray-400">Progression moy.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {engagementByCourse.length === 0 && (
              <div className="text-center py-12 text-gray-300">Pas encore d'inscrits dans tes cours</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}