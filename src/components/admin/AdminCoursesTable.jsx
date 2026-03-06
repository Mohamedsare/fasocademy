import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Search, Star, Users, Eye } from 'lucide-react';
import { createNotification } from '@/components/common/notificationHelpers';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const STATUS_COLORS = {
  published: 'bg-green-100 text-green-700',
  review: 'bg-yellow-100 text-yellow-700',
  draft: 'bg-gray-100 text-gray-600',
  archived: 'bg-red-100 text-red-600',
};

export default function AdminCoursesTable({ allCourses, allPayments }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(null);
  const queryClient = useQueryClient();

  const filtered = allCourses.filter(c => {
    const matchSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase()) || c.instructor_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (id, status) => {
    setLoading(id + status);
    const course = allCourses.find(c => c.id === id);
    await base44.entities.Course.update(id, { status });
    if (status === 'published' && course?.instructor_email) {
      await createNotification({
        user_email: course.instructor_email,
        type: 'course_published',
        title: `Cours publié : ${course.title}`,
        message: 'Ton cours a été approuvé et est maintenant visible dans le catalogue.',
        link_page: 'CoursePage',
        link_params: `?id=${id}`,
      });
    }
    queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    setLoading(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Rechercher un cours…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="published">Publiés</SelectItem>
            <SelectItem value="review">En revue</SelectItem>
            <SelectItem value="draft">Brouillons</SelectItem>
            <SelectItem value="archived">Archivés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/70">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Cours</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Formateur</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500">Statut</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">Prix</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 hidden lg:table-cell">Étudiants</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 hidden lg:table-cell">Revenus</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 hidden xl:table-cell">Note</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(course => {
                const courseRevenue = allPayments.filter(p => p.course_id === course.id).reduce((acc, p) => acc + (p.amount_cfa || 0), 0);
                return (
                  <tr key={course.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {course.thumbnail_url && (
                          <img src={course.thumbnail_url} alt="" className="w-10 h-7 rounded object-cover hidden sm:block" />
                        )}
                        <span className="font-semibold text-[#1B1F3B] max-w-[180px] truncate">{course.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs hidden md:table-cell">{course.instructor_name}</td>
                    <td className="px-5 py-3 text-center">
                      <Badge className={`${STATUS_COLORS[course.status] || 'bg-gray-100 text-gray-600'} border-0 text-xs`}>
                        {course.status === 'published' ? 'Publié' : course.status === 'review' ? 'En revue' : course.status === 'archived' ? 'Archivé' : 'Brouillon'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right text-sm font-semibold hidden sm:table-cell">
                      {course.is_free ? <span className="text-[#00C9A7]">Gratuit</span> : `${(course.price_cfa || 0).toLocaleString('fr-FR')} CFA`}
                    </td>
                    <td className="px-5 py-3 text-center hidden lg:table-cell">
                      <span className="flex items-center justify-center gap-1 text-gray-500">
                        <Users className="w-3.5 h-3.5" />{course.total_students || 0}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center hidden lg:table-cell">
                      <span className={courseRevenue > 0 ? 'font-semibold text-green-600' : 'text-gray-300'}>
                        {courseRevenue > 0 ? `${courseRevenue.toLocaleString('fr-FR')} CFA` : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center hidden xl:table-cell">
                      {course.average_rating > 0 ? (
                        <span className="flex items-center justify-center gap-1">
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          {course.average_rating.toFixed(1)}
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {course.status === 'review' && (
                          <>
                            <Button size="sm" className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white text-xs" disabled={loading === course.id + 'published'} onClick={() => updateStatus(course.id, 'published')}>
                              <CheckCircle className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 px-2 text-red-500 border-red-200 text-xs" disabled={loading === course.id + 'draft'} onClick={() => updateStatus(course.id, 'draft')}>
                              <XCircle className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                        {course.status === 'published' && (
                          <Button size="sm" variant="outline" className="h-7 px-2 text-red-400 border-red-100 text-xs" onClick={() => updateStatus(course.id, 'archived')}>
                            Archiver
                          </Button>
                        )}
                        {course.status === 'archived' && (
                          <Button size="sm" variant="outline" className="h-7 px-2 text-green-600 border-green-100 text-xs" onClick={() => updateStatus(course.id, 'published')}>
                            Restaurer
                          </Button>
                        )}
                        <Link to={createPageUrl('CoursePage') + `?id=${course.id}`}>
                          <Button size="sm" variant="ghost" className="h-7 px-2"><Eye className="w-3.5 h-3.5" /></Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-300">Aucun cours trouvé</div>
          )}
        </div>
        <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-50 text-xs text-gray-400">
          {filtered.length} cours affiché(s)
        </div>
      </div>
    </div>
  );
}