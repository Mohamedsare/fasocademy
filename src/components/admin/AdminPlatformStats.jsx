import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';
import { format, subDays, parseISO, isAfter } from 'date-fns';

export default function AdminPlatformStats({ allUsers, allEnrollments, allCourses }) {
  // New users over last 30 days
  const usersByDay = useMemo(() => {
    const map = {};
    for (let i = 29; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'dd/MM');
      map[d] = { date: d, users: 0, enrollments: 0 };
    }
    allUsers.forEach(u => {
      if (u.created_at) {
        const d = format(parseISO(u.created_at), 'dd/MM');
        if (map[d]) map[d].users++;
      }
    });
    allEnrollments.forEach(e => {
      if (e.created_at) {
        const d = format(parseISO(e.created_at), 'dd/MM');
        if (map[d]) map[d].enrollments++;
      }
    });
    return Object.values(map);
  }, [allUsers, allEnrollments]);

  // Top instructors by students
  const topInstructors = useMemo(() => {
    const map = {};
    allCourses.forEach(c => {
      if (!c.instructor_name) return;
      if (!map[c.instructor_name]) map[c.instructor_name] = { name: c.instructor_name, students: 0, courses: 0 };
      map[c.instructor_name].students += c.total_students || 0;
      map[c.instructor_name].courses++;
    });
    return Object.values(map).sort((a, b) => b.students - a.students).slice(0, 8);
  }, [allCourses]);

  // Completion funnel
  const completionStats = [
    { label: 'Inscrits', value: allEnrollments.length, color: '#6366f1' },
    { label: 'Actifs', value: allEnrollments.filter(e => e.status === 'active').length, color: '#FF6B00' },
    { label: 'En cours (>0%)', value: allEnrollments.filter(e => (e.progress_percent || 0) > 0).length, color: '#f59e0b' },
    { label: 'Mi-parcours (>50%)', value: allEnrollments.filter(e => (e.progress_percent || 0) >= 50).length, color: '#00C9A7' },
    { label: 'Complétés', value: allEnrollments.filter(e => e.status === 'completed').length, color: '#10b981' },
    { label: 'Certifiés', value: allEnrollments.filter(e => e.certificate_issued).length, color: '#8b5cf6' },
  ];

  // Category breakdown
  const categoryStats = useMemo(() => {
    const map = {};
    allCourses.forEach(c => {
      const cat = c.category || 'Non catégorisé';
      if (!map[cat]) map[cat] = { name: cat, count: 0, students: 0 };
      map[cat].count++;
      map[cat].students += c.total_students || 0;
    });
    return Object.values(map).sort((a, b) => b.students - a.students);
  }, [allCourses]);

  return (
    <div className="space-y-6">
      {/* Growth chart */}
      <Card className="border-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-[#1B1F3B]">Croissance — Nouveaux utilisateurs & Inscriptions (30 jours)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={usersByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#FF6B00" strokeWidth={2} dot={false} name="Nouveaux utilisateurs" />
              <Line type="monotone" dataKey="enrollments" stroke="#6366f1" strokeWidth={2} dot={false} name="Inscriptions" />
              <Legend iconType="circle" iconSize={10} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Completion funnel */}
        <Card className="border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-[#1B1F3B]">Entonnoir d'engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completionStats.map((stat, i) => {
                const pct = allEnrollments.length > 0 ? Math.round((stat.value / allEnrollments.length) * 100) : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-[#1B1F3B]">{stat.label}</span>
                      <span className="text-gray-500">{stat.value} ({pct}%)</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: stat.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top instructors */}
        <Card className="border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-[#1B1F3B]">Top formateurs</CardTitle>
          </CardHeader>
          <CardContent>
            {topInstructors.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topInstructors} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
                  <Tooltip formatter={(v, name) => [v, name === 'students' ? 'Étudiants' : 'Cours']} />
                  <Bar dataKey="students" fill="#FF6B00" radius={[0, 4, 4, 0]} name="students" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-300 text-sm">Aucun formateur</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <Card className="border-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-[#1B1F3B]">Répartition par catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categoryStats.map((cat, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs font-semibold text-[#1B1F3B] truncate">{cat.name}</p>
                <p className="text-xl font-extrabold text-[#FF6B00] mt-1">{cat.count}</p>
                <p className="text-xs text-gray-400">{cat.students} étudiants</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}