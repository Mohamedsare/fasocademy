import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Users, BookOpen, TrendingUp, ShoppingCart, Award, BarChart3, Star } from 'lucide-react';

export default function AdminKPICards({ allPayments, allUsers, allCourses, allEnrollments }) {
  const totalRevenue = allPayments.reduce((a, p) => a + (p.amount_cfa || 0), 0);
  const platformRevenue = allPayments.reduce((a, p) => a + (p.platform_amount || 0), 0);
  const instructorRevenue = allPayments.reduce((a, p) => a + (p.instructor_amount || 0), 0);
  const instructors = allUsers.filter(u => u.role === 'instructor').length;
  const publishedCourses = allCourses.filter(c => c.status === 'published').length;
  const completedEnrollments = allEnrollments.filter(e => e.status === 'completed').length;
  const avgRating = allCourses.filter(c => c.average_rating > 0).length > 0
    ? (allCourses.filter(c => c.average_rating > 0).reduce((a, c) => a + c.average_rating, 0) / allCourses.filter(c => c.average_rating > 0).length).toFixed(1)
    : '—';

  const kpis = [
    { label: 'Revenu total', value: `${totalRevenue.toLocaleString('fr-FR')} CFA`, sub: 'Tous paiements confirmés', icon: DollarSign, color: 'from-green-400 to-emerald-600', text: 'text-white' },
    { label: 'Part plateforme (20%)', value: `${platformRevenue.toLocaleString('fr-FR')} CFA`, sub: `Formateurs: ${instructorRevenue.toLocaleString('fr-FR')} CFA`, icon: BarChart3, color: 'from-[#FF6B00] to-orange-600', text: 'text-white' },
    { label: 'Utilisateurs', value: allUsers.length, sub: `${instructors} formateurs`, icon: Users, color: 'from-blue-400 to-blue-600', text: 'text-white' },
    { label: 'Cours publiés', value: publishedCourses, sub: `${allCourses.length} au total`, icon: BookOpen, color: 'from-purple-400 to-purple-600', text: 'text-white' },
    { label: 'Inscriptions', value: allEnrollments.length, sub: `${completedEnrollments} complétées`, icon: TrendingUp, color: 'from-cyan-400 to-cyan-600', text: 'text-white' },
    { label: 'Ventes', value: allPayments.length, sub: 'Paiements réussis', icon: ShoppingCart, color: 'from-pink-400 to-rose-600', text: 'text-white' },
    { label: 'Certifiés', value: allEnrollments.filter(e => e.certificate_issued).length, sub: 'Certificats émis', icon: Award, color: 'from-yellow-400 to-amber-500', text: 'text-white' },
    { label: 'Note moy. plateforme', value: avgRating, sub: `${allCourses.filter(c => c.average_rating > 0).length} cours notés`, icon: Star, color: 'from-indigo-400 to-indigo-600', text: 'text-white' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {kpis.map((kpi, i) => {
        const Icon = kpi.icon;
        return (
          <Card key={i} className="border-0 overflow-hidden shadow-sm">
            <CardContent className={`p-5 bg-gradient-to-br ${kpi.color}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-white/70 font-medium">{kpi.label}</p>
                  <p className="text-2xl font-extrabold text-white mt-1">{kpi.value}</p>
                  <p className="text-xs text-white/60 mt-1">{kpi.sub}</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}