import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Shield, User, GraduationCap } from 'lucide-react';

const ROLE_COLORS = {
  admin: 'bg-red-100 text-red-700',
  instructor: 'bg-blue-100 text-blue-700',
  user: 'bg-gray-100 text-gray-600',
};

const ROLE_ICONS = { admin: Shield, instructor: GraduationCap, user: User };

export default function AdminUsersTable({ allUsers, allEnrollments, allPayments }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const queryClient = useQueryClient();

  const filtered = allUsers.filter(u => {
    const matchSearch = !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    await base44.entities.User.update(userId, { role: newRole });
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    setUpdatingId(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Rechercher un utilisateur…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="instructor">Formateur</SelectItem>
            <SelectItem value="user">Apprenant</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/70">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Utilisateur</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Email</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500">Rôle</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">Inscriptions</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 hidden lg:table-cell">Dépenses</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(u => {
                const userEnrollments = allEnrollments.filter(e => e.user_email === u.email).length;
                const userPayments = allPayments.filter(p => p.user_email === u.email).reduce((acc, p) => acc + (p.amount_cfa || 0), 0);
                const RoleIcon = ROLE_ICONS[u.role] || User;
                return (
                  <tr key={u.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#FF6B00]/10 flex items-center justify-center text-[#FF6B00] font-bold text-xs shrink-0">
                          {u.full_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="font-semibold text-[#1B1F3B]">{u.full_name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{u.email}</td>
                    <td className="px-5 py-3 text-center">
                      <Badge className={`${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-600'} border-0 text-xs`}>
                        <RoleIcon className="w-3 h-3 mr-1" />
                        {u.role || 'user'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-center text-gray-600 hidden sm:table-cell">{userEnrollments}</td>
                    <td className="px-5 py-3 text-center hidden lg:table-cell">
                      <span className={userPayments > 0 ? 'font-semibold text-green-600' : 'text-gray-300'}>
                        {userPayments > 0 ? `${userPayments.toLocaleString('fr-FR')} CFA` : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <Select
                        value={u.role || 'user'}
                        onValueChange={val => handleRoleChange(u.id, val)}
                        disabled={updatingId === u.id}
                      >
                        <SelectTrigger className="w-32 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Apprenant</SelectItem>
                          <SelectItem value="instructor">Formateur</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-300">Aucun utilisateur trouvé</div>
          )}
        </div>
        <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-50 text-xs text-gray-400">
          {filtered.length} utilisateur(s) affiché(s)
        </div>
      </div>
    </div>
  );
}