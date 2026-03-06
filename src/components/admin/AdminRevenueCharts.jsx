import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { format, subDays, parseISO, isAfter } from 'date-fns';

const COLORS = ['#FF6B00', '#00C9A7', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AdminRevenueCharts({ allPayments, allCourses, period }) {
  const periodStart = subDays(new Date(), period);
  const recent = allPayments.filter(p => p.created_at && isAfter(parseISO(p.created_at), periodStart));

  const revenueByDay = useMemo(() => {
    const map = {};
    for (let i = period - 1; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'dd/MM');
      map[d] = { date: d, total: 0, platform: 0, instructors: 0 };
    }
    recent.forEach(p => {
      const d = format(parseISO(p.created_at), 'dd/MM');
      if (map[d]) {
        map[d].total += p.amount_cfa || 0;
        map[d].platform += p.platform_amount || 0;
        map[d].instructors += p.instructor_amount || 0;
      }
    });
    return Object.values(map);
  }, [recent, period]);

  const revenueByCourse = useMemo(() => {
    const map = {};
    allPayments.forEach(p => {
      const t = p.course_title || 'Inconnu';
      map[t] = (map[t] || 0) + (p.amount_cfa || 0);
    });
    return Object.entries(map)
      .map(([name, revenue]) => ({ name: name.length > 18 ? name.slice(0, 18) + '…' : name, revenue }))
      .sort((a, b) => b.revenue - a.revenue).slice(0, 7);
  }, [allPayments]);

  const methodBreakdown = useMemo(() => {
    const map = {};
    allPayments.forEach(p => { map[p.method || 'autre'] = (map[p.method || 'autre'] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [allPayments]);

  const courseStatusData = [
    { name: 'Publiés', value: allCourses.filter(c => c.status === 'published').length },
    { name: 'Brouillons', value: allCourses.filter(c => c.status === 'draft').length },
    { name: 'En revue', value: allCourses.filter(c => c.status === 'review').length },
    { name: 'Archivés', value: allCourses.filter(c => c.status === 'archived').length },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Area chart revenus */}
      <Card className="border-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-[#1B1F3B]">Revenus sur {period} jours — Total, Plateforme, Formateurs</CardTitle>
        </CardHeader>
        <CardContent>
          {revenueByDay.some(d => d.total > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={revenueByDay}>
                <defs>
                  <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gPlatform" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C9A7" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#00C9A7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={period > 30 ? 6 : period > 14 ? 2 : 0} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => [`${v.toLocaleString('fr-FR')} CFA`]} />
                <Area type="monotone" dataKey="total" stroke="#FF6B00" fill="url(#gTotal)" strokeWidth={2} name="Total" />
                <Area type="monotone" dataKey="platform" stroke="#00C9A7" fill="url(#gPlatform)" strokeWidth={2} name="Plateforme" />
                <Area type="monotone" dataKey="instructors" stroke="#6366f1" fill="none" strokeWidth={1.5} strokeDasharray="5 3" name="Formateurs" />
                <Legend iconType="circle" iconSize={10} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-300">Aucune vente sur cette période</div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue per course */}
        <Card className="border-gray-100 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-[#1B1F3B]">Top cours par revenus</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueByCourse.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={revenueByCourse} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
                  <Tooltip formatter={v => [`${v.toLocaleString('fr-FR')} CFA`]} />
                  <Bar dataKey="revenue" fill="#FF6B00" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-300 text-sm">Aucune donnée</div>
            )}
          </CardContent>
        </Card>

        {/* Method breakdown */}
        <Card className="border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-[#1B1F3B]">Méthodes de paiement</CardTitle>
          </CardHeader>
          <CardContent>
            {methodBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={methodBreakdown} cx="50%" cy="45%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                    {methodBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" iconSize={9} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-300 text-sm">Aucune donnée</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}