import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertCircle } from 'lucide-react';

import AdminKPICards from '@/components/admin/AdminKPICards';
import AdminRevenueCharts from '@/components/admin/AdminRevenueCharts';
import AdminUsersTable from '@/components/admin/AdminUsersTable';
import AdminCoursesTable from '@/components/admin/AdminCoursesTable';
import AdminPaymentsTable from '@/components/admin/AdminPaymentsTable';
import AdminPlatformStats from '@/components/admin/AdminPlatformStats';
import AdminTestimonialsTable from '@/components/admin/AdminTestimonialsTable';
import AdminInstructorRequests from '@/components/admin/AdminInstructorRequests';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    const load = async () => {
      try {
        const auth = await base44.auth.isAuthenticated();
        if (!auth) { base44.auth.redirectToLogin(); return; }
        const u = await base44.auth.me();
        if (!u || u.role !== 'admin') { window.location.href = '/'; return; }
        setUser(u);
      } catch (err) {
        console.error('Admin load error:', err);
        window.location.href = '/';
      }
    };
    load();
  }, []);

  const { data: allCourses } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 500),
    enabled: !!user, initialData: [],
  });

  const { data: allPayments } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => base44.entities.Payment.filter({ status: 'completed' }, '-created_date', 500),
    enabled: !!user, initialData: [],
  });

  const { data: allUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list('-created_date', 500),
    enabled: !!user, initialData: [],
  });

  const { data: allEnrollments } = useQuery({
    queryKey: ['admin-enrollments'],
    queryFn: () => base44.entities.Enrollment.list('-created_date', 500),
    enabled: !!user, initialData: [],
  });

  if (!user) return null;

  const pendingReview = allCourses.filter(c => c.status === 'review');
  const pendingInstructorRequests = (allUsers || []).filter((u) => u.role === 'user' && u.instructor_requested_at).length;

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#1B1F3B] to-[#FF6B00] rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#1B1F3B]">Super Admin</h1>
              <p className="text-gray-400 text-sm">Contrôle total de la plateforme FasoCademy</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {pendingReview.length > 0 && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-sm text-amber-700">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="font-semibold">{pendingReview.length} cours en attente</span>
              </div>
            )}
            <div className="flex gap-1">
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
        </div>

        {/* KPI Cards */}
        <AdminKPICards
          allPayments={allPayments}
          allUsers={allUsers}
          allCourses={allCourses}
          allEnrollments={allEnrollments}
        />

        {/* Tabs */}
        <Tabs defaultValue="analytics">
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="analytics">📊 Analytiques</TabsTrigger>
            <TabsTrigger value="platform">🌍 Plateforme</TabsTrigger>
            <TabsTrigger value="courses" className="relative">
              📚 Cours
              {pendingReview.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {pendingReview.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="instructor-requests" className="relative">
              🎓 Demandes formateur
              {pendingInstructorRequests > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF6B00] text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold px-1">
                  {pendingInstructorRequests}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="users">👥 Utilisateurs</TabsTrigger>
            <TabsTrigger value="payments">💳 Paiements</TabsTrigger>
            <TabsTrigger value="testimonials">💬 Témoignages</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <AdminRevenueCharts allPayments={allPayments} allCourses={allCourses} period={period} />
          </TabsContent>

          <TabsContent value="platform">
            <AdminPlatformStats allUsers={allUsers} allEnrollments={allEnrollments} allCourses={allCourses} />
          </TabsContent>

          <TabsContent value="courses">
            <AdminCoursesTable allCourses={allCourses} allPayments={allPayments} />
          </TabsContent>

          <TabsContent value="instructor-requests">
            <AdminInstructorRequests allUsers={allUsers} />
          </TabsContent>
          <TabsContent value="users">
            <AdminUsersTable allUsers={allUsers} allEnrollments={allEnrollments} allPayments={allPayments} />
          </TabsContent>

          <TabsContent value="payments">
            <AdminPaymentsTable allPayments={allPayments} />
          </TabsContent>

          <TabsContent value="testimonials">
            <AdminTestimonialsTable />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}