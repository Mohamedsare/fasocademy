import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell, BookOpen, MessageCircle, ClipboardList, CheckCheck,
  FileText, Megaphone, ArrowLeft, Trash2
} from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const TYPE_CONFIG = {
  new_lesson: { icon: BookOpen, color: 'bg-blue-50 text-blue-600', label: 'Nouvelle leçon' },
  question_answered: { icon: MessageCircle, color: 'bg-green-50 text-green-600', label: 'Réponse reçue' },
  assignment_reminder: { icon: ClipboardList, color: 'bg-amber-50 text-amber-600', label: 'Rappel devoir' },
  new_submission: { icon: FileText, color: 'bg-purple-50 text-purple-600', label: 'Nouvelle soumission' },
  new_question: { icon: MessageCircle, color: 'bg-[#FFF3E8] text-[#FF6B00]', label: 'Question apprenant' },
  course_published: { icon: Megaphone, color: 'bg-[#E6FBF6] text-[#00C9A7]', label: 'Cours publié' },
};

export default function Notifications() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const auth = await base44.auth.isAuthenticated();
        if (!auth) { base44.auth.redirectToLogin(); return; }
        setUser(await base44.auth.me());
      } catch (err) {
        console.error('Notifications load error:', err);
      }
    };
    load();
  }, []);

  const { data: notifications } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user.email }, '-created_date', 100),
    enabled: !!user,
    initialData: [],
  });

  const markRead = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const deleteNotif = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const handleClick = (notif) => {
    if (!notif.is_read) markRead.mutate(notif.id);
    if (notif.link_page) {
      navigate(createPageUrl(notif.link_page) + (notif.link_params || ''));
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Retour</Button>
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-[#1B1F3B] flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#FF6B00]" />Notifications
              {unreadCount > 0 && (
                <Badge className="bg-[#FF6B00] text-white border-0 text-xs">{unreadCount}</Badge>
              )}
            </h1>
            <p className="text-gray-400 text-xs">{notifications.length} notification(s) au total</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="text-xs"
          >
            <CheckCheck className="w-3.5 h-3.5 mr-1" />Tout lire
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 text-gray-300">
          <Bell className="w-14 h-14 mx-auto mb-4 text-gray-100" />
          <p className="font-medium">Aucune notification pour l'instant</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => {
            const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.new_lesson;
            const Icon = cfg.icon;
            return (
              <div
                key={notif.id}
                onClick={() => handleClick(notif)}
                className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${
                  notif.is_read
                    ? 'bg-white border-gray-100 opacity-70'
                    : 'bg-white border-[#FF6B00]/20 shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-sm font-semibold text-[#1B1F3B] ${!notif.is_read ? 'font-bold' : ''}`}>
                        {notif.title}
                        {!notif.is_read && <span className="inline-block w-2 h-2 bg-[#FF6B00] rounded-full ml-2 align-middle" />}
                      </p>
                      {notif.message && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${cfg.color} border-0 text-[10px] px-1.5 py-0`}>{cfg.label}</Badge>
                        <span className="text-[10px] text-gray-400">
                          {notif.created_at ? formatDistanceToNow(parseISO(notif.created_at), { addSuffix: true, locale: fr }) : ''}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); deleteNotif.mutate(notif.id); }}
                      className="text-gray-300 hover:text-red-400 transition-colors shrink-0 mt-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}