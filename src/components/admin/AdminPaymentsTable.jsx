import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const METHOD_LABELS = {
  orange_money: 'Orange Money',
  moov_money: 'Moov Money',
  wave: 'Wave',
  card: 'Carte',
  manual: 'Manuel',
};

export default function AdminPaymentsTable({ allPayments }) {
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');

  const filtered = allPayments.filter(p => {
    const matchSearch = !search || p.user_name?.toLowerCase().includes(search.toLowerCase()) || p.user_email?.toLowerCase().includes(search.toLowerCase()) || p.course_title?.toLowerCase().includes(search.toLowerCase());
    const matchMethod = methodFilter === 'all' || p.method === methodFilter;
    return matchSearch && matchMethod;
  });

  const totalFiltered = filtered.reduce((acc, p) => acc + (p.amount_cfa || 0), 0);
  const platformFiltered = filtered.reduce((acc, p) => acc + (p.platform_amount || 0), 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Chercher un paiement…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={methodFilter} onValueChange={setMethodFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les méthodes</SelectItem>
            <SelectItem value="orange_money">Orange Money</SelectItem>
            <SelectItem value="moov_money">Moov Money</SelectItem>
            <SelectItem value="wave">Wave</SelectItem>
            <SelectItem value="card">Carte</SelectItem>
            <SelectItem value="manual">Manuel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <p className="text-xs text-green-600">Total ({filtered.length} ventes)</p>
          <p className="text-lg font-extrabold text-green-700">{totalFiltered.toLocaleString('fr-FR')} CFA</p>
        </div>
        <div className="bg-[#FFF3E8] rounded-xl p-3 text-center">
          <p className="text-xs text-[#FF6B00]">Part plateforme</p>
          <p className="text-lg font-extrabold text-[#FF6B00]">{platformFiltered.toLocaleString('fr-FR')} CFA</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/70">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Apprenant</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Cours</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">Méthode</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">Montant</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 hidden lg:table-cell">Plateforme</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 hidden lg:table-cell">Formateur</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 hidden xl:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.slice(0, 100).map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-semibold text-[#1B1F3B]">{p.user_name || '—'}</p>
                      <p className="text-xs text-gray-400 hidden sm:block">{p.user_email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs hidden md:table-cell max-w-[160px] truncate">{p.course_title}</td>
                  <td className="px-5 py-3 text-center hidden sm:table-cell">
                    <Badge className="bg-gray-100 text-gray-600 border-0 text-xs">{METHOD_LABELS[p.method] || p.method}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-[#1B1F3B]">{(p.amount_cfa || 0).toLocaleString('fr-FR')} CFA</td>
                  <td className="px-5 py-3 text-right text-[#FF6B00] font-semibold hidden lg:table-cell">{(p.platform_amount || 0).toLocaleString('fr-FR')} CFA</td>
                  <td className="px-5 py-3 text-right text-gray-500 hidden lg:table-cell">{(p.instructor_amount || 0).toLocaleString('fr-FR')} CFA</td>
                  <td className="px-5 py-3 text-right text-gray-400 text-xs hidden xl:table-cell">
                    {p.created_at ? format(parseISO(p.created_at), 'dd/MM/yyyy') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-300">Aucun paiement trouvé</div>
          )}
        </div>
        <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-50 text-xs text-gray-400">
          {Math.min(filtered.length, 100)} / {filtered.length} paiement(s)
        </div>
      </div>
    </div>
  );
}