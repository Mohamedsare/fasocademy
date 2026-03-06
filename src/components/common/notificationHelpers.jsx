import { base44 } from '@/api/base44Client';

export async function createNotification({ user_email, type, title, message, link_page, link_params }) {
  return base44.entities.Notification.create({
    user_email,
    type,
    title,
    message: message || '',
    link_page: link_page || '',
    link_params: link_params || '',
    is_read: false,
  });
}