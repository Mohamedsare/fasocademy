import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import StatsBar from '@/components/common/StatsBar';
import {
  Play, BookOpen, Award, Clock, ArrowRight, Flame, CheckCircle2, Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MyLearning() {
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('active');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const auth = await base44.auth.isAuthenticated();
        if (!auth) { base44.auth.redirectToLogin(); return; }
        setUser(await base44.auth.me());
      } catch (err) {
        console.error('MyLearning load error:', err);
      }
    };
    load();
  }, []);

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['enrollments', user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ user_email: user.email }, '-updated_date'),
    enabled: !!user,
    initialData: [],
  });

  const { data: certificates } = useQuery({
    queryKey: ['certificates', user?.email],
    queryFn: () => base44.entities.Certificate.filter({ user_email: user.email }),
    enabled: !!user,
    initialData: [],
  });

  const filtered = enrollments.filter(e => {
    if (filter !== 'all' && e.status !== filter) return false;
    if (search && !e.course_title?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const completedCount = enrollments.filter(e => e.status === 'completed').length;

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1B1F3B]">Mon apprentissage</h1>
          <p className="text-gray-500 mt-1">Continue là où tu t'es arrêté</p>
        </div>
        <StatsBar streak={user.streak_days || 0} xp={user.xp_points || 0} coursesCompleted={completedCount} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="active">En cours ({enrollments.filter(e => e.status === 'active').length})</TabsTrigger>
            <TabsTrigger value="completed">Terminés ({completedCount})</TabsTrigger>
            <TabsTrigger value="all">Tout</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-10" />
        </div>
      </div>

      {/* Course cards */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">
            {enrollments.length === 0 ? "Aucune formation achetée" : "Aucun résultat"}
          </h3>
          <p className="text-gray-400 mb-6">
            {enrollments.length === 0 ? "Explore notre catalogue pour commencer à apprendre" : "Essaie d'ajuster tes filtres"}
          </p>
          {enrollments.length === 0 && (
            <Link to={createPageUrl('Catalog')}>
              <Button className="bg-[#FF6B00] hover:bg-[#E55D00] text-white">
                Explorer le catalogue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(enrollment => (
            <div key={enrollment.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-[#1B1F3B] text-sm leading-snug line-clamp-2 flex-1 mr-2">
                    {enrollment.course_title}
                  </h3>
                  {enrollment.status === 'completed' && (
                    <Badge className="bg-[#00C9A7]/10 text-[#00C9A7] border-0 shrink-0">
                      <CheckCircle2 className="w-3 h-3 mr-1" />Terminé
                    </Badge>
                  )}
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>Progression</span>
                    <span className="font-bold text-[#FF6B00]">{enrollment.progress_percent || 0}%</span>
                  </div>
                  <Progress value={enrollment.progress_percent || 0} className="h-2" />
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {enrollment.completed_lessons?.length || 0} leçons faites
                  </span>
                  {enrollment.streak_days > 0 && (
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-[#FF6B00]" />
                      {enrollment.streak_days}j streak
                    </span>
                  )}
                </div>

                <Link to={createPageUrl('LessonPlayer') + `?courseId=${enrollment.course_id}`}>
                  <Button className="w-full bg-[#FF6B00] hover:bg-[#E55D00] text-white h-10 text-sm font-bold">
                    <Play className="w-4 h-4 mr-2" />
                    {enrollment.status === 'completed' ? 'Revoir' : 'Continuer'}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certificates */}
      {certificates.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-extrabold text-[#1B1F3B] mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-[#FF6B00]" />
            Mes certificats
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map(cert => (
              <div key={cert.id} className="bg-gradient-to-br from-[#FFF3E8] to-white rounded-2xl p-5 border border-[#FF6B00]/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#FF6B00]/10 rounded-xl flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 text-[#FF6B00]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-[#1B1F3B]">{cert.course_title}</h4>
                    <p className="text-xs text-gray-500 mt-1">Délivré le {new Date(cert.issued_date).toLocaleDateString('fr-FR')}</p>
                    <p className="text-xs text-gray-400 mt-0.5">ID: {cert.certificate_number}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}