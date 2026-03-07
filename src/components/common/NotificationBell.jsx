import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, BookOpen, MessageCircle, ClipboardList, FileText, Megaphone, CheckCheck, X } from 'lucide-react';
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

  const deleteNotification = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = notifications.filter(n => !n.is_read);
  const unreadCount = unread.length;

  const handleClick = (notif, e) => {
    if (e?.target?.closest('[data-dismiss]')) return; // Ne pas naviguer si clic sur masquer
    if (!notif.is_read) markRead.mutate(notif.id);
    setOpen(false);
    if (notif.link_page) navigate(createPageUrl(notif.link_page) + (notif.link_params || ''));
  };

  const handleDismiss = (e, notifId) => {
    e.stopPropagation();
    deleteNotification.mutate(notifId);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        aria-label={unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}` : 'Notifications'}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#FF6B00] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-900">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Overlay mobile - ferme au clic */}
          <div
            className="fixed inset-0 bg-black/40 z-40 sm:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed sm:absolute inset-x-0 sm:inset-auto sm:right-0 sm:top-12 sm:w-80 bottom-0 sm:bottom-auto sm:rounded-2xl rounded-t-2xl bg-white dark:bg-gray-900 shadow-2xl dark:shadow-gray-950/80 border-t sm:border border-gray-100 dark:border-gray-700 z-50 overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[calc(100vh-8rem)]">
            <div className="flex items-center justify-between px-4 py-4 sm:py-3 border-b border-gray-100 dark:border-gray-700 shrink-0">
              <span className="font-bold text-base sm:text-sm text-[#1B1F3B] dark:text-gray-100">
                Notifications {unreadCount > 0 && <span className="text-[#FF6B00]">({unreadCount})</span>}
              </span>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllRead.mutate()}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-[#FF6B00] dark:hover:text-orange-400 flex items-center gap-1.5 transition-colors py-2 px-2 -m-2"
                  >
                    <CheckCheck className="w-4 h-4 sm:w-3 sm:h-3" />Tout lire
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 -m-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 sm:hidden"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 min-h-0">
              {notifications.length === 0 ? (
                <div className="text-center py-12 sm:py-8 text-gray-400 dark:text-gray-500 text-sm px-4">
                  <Bell className="w-10 h-10 sm:w-8 sm:h-8 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  Aucune notification
                </div>
              ) : (
                notifications.slice(0, 10).map(notif => {
                  const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.new_lesson;
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={notif.id}
                      onClick={(e) => handleClick(notif, e)}
                      className={`flex items-start gap-3 px-4 py-4 sm:py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!notif.is_read ? 'bg-orange-50/50 dark:bg-orange-950/20' : ''}`}
                    >
                      <Icon className={`w-5 h-5 sm:w-4 sm:h-4 mt-0.5 shrink-0 ${cfg.color}`} />
                      <div className="flex-1 min-w-0 pr-2">
                        <p className={`text-sm sm:text-xs text-[#1B1F3B] dark:text-gray-100 leading-snug ${!notif.is_read ? 'font-semibold' : ''}`}>
                          {notif.title}
                          {!notif.is_read && <span className="inline-block w-2 h-2 sm:w-1.5 sm:h-1.5 bg-[#FF6B00] rounded-full ml-1.5 align-middle" />}
                        </p>
                        {notif.message && <p className="text-xs sm:text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 sm:line-clamp-1">{notif.message}</p>}
                        <p className="text-xs sm:text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                          {notif.created_at ? formatDistanceToNow(parseISO(notif.created_at), { addSuffix: true, locale: fr }) : ''}
                        </p>
                      </div>
                      <button
                        data-dismiss
                        onClick={(e) => handleDismiss(e, notif.id)}
                        disabled={deleteNotification.isPending}
                        className="shrink-0 p-2 -m-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        aria-label="Masquer la notification"
                        title="Masquer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 shrink-0">
              <Link
                to={createPageUrl('Notifications')}
                onClick={() => setOpen(false)}
                className="block text-center text-sm sm:text-xs text-[#FF6B00] dark:text-orange-400 hover:underline font-medium py-2 sm:py-1"
              >
                Voir toutes les notifications →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}