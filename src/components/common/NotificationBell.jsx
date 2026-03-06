import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, BookOpen, MessageCircle, ClipboardList, FileText, Megaphone, CheckCheck } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const TYPE_CONFIG = {
  new_lesson: { icon: BookOpen, color: 'text-blue-500' },
  question_answered: { icon: MessageCircle, color: 'text-green-500' },
  assignment_reminder: { icon: ClipboardList, color: 'text-amber-500' },
  new_submission: { icon: FileText, color: 'text-purple-500' },
  new_question: { icon: MessageCircle, color: 'text-[#FF6B00]' },
  course_published: { icon: Megaphone, color: 'text-[#00C9A7]' },
};

export default function NotificationBell({ userEmail }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery({
    queryKey: ['notifications', userEmail],
    queryFn: () => base44.entities.Notification.filter({ user_email: userEmail }, '-created_at', 20),
    enabled: !!userEmail,
    initialData: [],
    refetchInterval: 30000,
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

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = notifications.filter(n => !n.is_read);
  const unreadCount = unread.length;

  const handleClick = (notif) => {
    if (!notif.is_read) markRead.mutate(notif.id);
    setOpen(false);
    if (notif.link_page) navigate(createPageUrl(notif.link_page) + (notif.link_params || ''));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
        aria-label={unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}` : 'Notifications'}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#FF6B00] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <span className="font-bold text-sm text-[#1B1F3B]">
              Notifications {unreadCount > 0 && <span className="text-[#FF6B00]">({unreadCount})</span>}
            </span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead.mutate()}
                  className="text-xs text-gray-400 hover:text-[#FF6B00] flex items-center gap-1 transition-colors"
                >
                  <CheckCheck className="w-3 h-3" />Tout lire
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-300 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-100" />
                Aucune notification
              </div>
            ) : (
              notifications.slice(0, 10).map(notif => {
                const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.new_lesson;
                const Icon = cfg.icon;
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleClick(notif)}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!notif.is_read ? 'bg-[#FFFAF7]' : ''}`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs text-[#1B1F3B] leading-snug ${!notif.is_read ? 'font-semibold' : ''}`}>
                        {notif.title}
                        {!notif.is_read && <span className="inline-block w-1.5 h-1.5 bg-[#FF6B00] rounded-full ml-1.5 align-middle" />}
                      </p>
                      {notif.message && <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{notif.message}</p>}
                      <p className="text-[10px] text-gray-300 mt-0.5">
                        {notif.created_at ? formatDistanceToNow(parseISO(notif.created_at), { addSuffix: true, locale: fr }) : ''}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="px-4 py-2 border-t border-gray-50">
            <Link
              to={createPageUrl('Notifications')}
              onClick={() => setOpen(false)}
              className="block text-center text-xs text-[#FF6B00] hover:underline font-medium py-1"
            >
              Voir toutes les notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}