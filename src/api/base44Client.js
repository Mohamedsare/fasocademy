// Compatibility layer to keep existing Base44-based code working
// while using Supabase + custom APIs under the hood.
/// <reference path="../vite-env.d.ts" />

import { supabase } from '@/lib/supabase';
import {
  AuthAPI,
  CoursesAPI,
  EnrollmentsAPI,
  PaymentsAPI,
  ReviewsAPI,
  NotificationsAPI,
  CertificatesAPI,
  CommentsAPI,
  TestimonialsAPI,
} from '@/lib/api';
import { getAriaReply } from '@/lib/ariaChat';

const toOrderParams = (order, fallbackField = 'created_at') => {
  if (!order) return { field: fallbackField, ascending: false };
  let field = order.startsWith('-') ? order.slice(1) : order;
  if (field === 'created_date') field = 'created_at';
  if (field === 'updated_date') field = 'updated_at';
  const ascending = !order.startsWith('-');
  return { field, ascending };
};

const wrapListWithOrderAndLimit = async (table, filters = {}, order, limit) => {
  const { field, ascending } = toOrderParams(order);
  let query = supabase.from(table).select('*').order(field, { ascending });
  if (limit) query = query.limit(limit);
  Object.entries(filters).forEach(([k, v]) => {
    query = query.eq(k, v);
  });
  const { data, error } = await query;
  if (error) {
    console.error(`Supabase query error on ${table}:`, error);
    return [];
  }
  return data || [];
};

export const base44 = {
  auth: {
    async isAuthenticated() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error('Supabase isAuthenticated error:', error);
        return false;
      }
      return !!user;
    },
    async me() {
      return AuthAPI.me();
    },
    async logout(redirectUrl) {
      await AuthAPI.signOut().catch((e) =>
        console.error('Supabase logout error:', e),
      );
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    },
    async updateMe(data) {
      return AuthAPI.updateMe(data);
    },
    async requestInstructorAccess() {
      return AuthAPI.requestInstructorAccess();
    },
    redirectToLogin(redirectUrl) {
      // Store redirect target then go to Profile (or any auth page)
      if (redirectUrl) {
        try {
          localStorage.setItem('fasocademy_post_login_redirect', redirectUrl);
        } catch {
          // ignore
        }
      }
      window.location.href = '/Profile';
    },
  },

  entities: {
    Course: {
      filter(filters = {}, order, limit) {
        return wrapListWithOrderAndLimit('courses', filters, order, limit);
      },
      list(order, limit) {
        return wrapListWithOrderAndLimit('courses', {}, order, limit);
      },
      create(data) {
        return CoursesAPI.create(data);
      },
      update(id, data) {
        return CoursesAPI.update(id, data);
      },
    },
    Enrollment: {
      filter(filters = {}, order, limit) {
        return wrapListWithOrderAndLimit('enrollments', filters, order, limit);
      },
      list(order, limit) {
        return wrapListWithOrderAndLimit('enrollments', {}, order, limit);
      },
      create(data) {
        return EnrollmentsAPI.create(data);
      },
      update(id, data) {
        return EnrollmentsAPI.update(id, data);
      },
    },
    Payment: {
      filter(filters = {}, order, limit) {
        return wrapListWithOrderAndLimit('payments', filters, order, limit);
      },
      list(order, limit) {
        return wrapListWithOrderAndLimit('payments', {}, order, limit);
      },
      create(data) {
        return PaymentsAPI.create(data);
      },
      update(id, data) {
        return PaymentsAPI.update(id, data);
      },
    },
    Review: {
      filter(filters = {}, order, limit) {
        return wrapListWithOrderAndLimit('reviews', filters, order, limit);
      },
      create(data) {
        return ReviewsAPI.create(data);
      },
    },
    Notification: {
      filter(filters = {}, order, limit) {
        return wrapListWithOrderAndLimit(
          'notifications',
          filters,
          order,
          limit,
        );
      },
      create(data) {
        return supabase.from('notifications').insert(data).then(({ error }) => {
          if (error) {
            console.error('Notification.create error:', error);
            throw error;
          }
        });
      },
      update(id) {
        return NotificationsAPI.markRead(id);
      },
      delete(id) {
        return supabase
          .from('notifications')
          .delete()
          .eq('id', id)
          .then(({ error }) => {
            if (error) {
              console.error('Notification.delete error:', error);
              throw error;
            }
          });
      },
    },
    Certificate: {
      filter(filters = {}, order, limit) {
        return wrapListWithOrderAndLimit('certificates', filters, order, limit);
      },
    },
    Testimonial: {
      list(order, limit) {
        return wrapListWithOrderAndLimit(
          'testimonials',
          {},
          order,
          limit,
        );
      },
      filter(filters = {}, order, limit) {
        return wrapListWithOrderAndLimit(
          'testimonials',
          filters,
          order,
          limit,
        );
      },
      create(data) {
        return TestimonialsAPI.create(data);
      },
      update(id, data) {
        return supabase
          .from('testimonials')
          .update(data)
          .eq('id', id)
          .then(({ error }) => {
            if (error) {
              console.error('Testimonial.update error:', error);
              throw error;
            }
          });
      },
    },
    User: {
      list(order, limit) {
        return wrapListWithOrderAndLimit('profiles', {}, order, limit);
      },
      update(id, data) {
        return supabase
          .from('profiles')
          .update(data)
          .eq('id', id)
          .then(({ error }) => {
            if (error) {
              console.error('User.update error:', error);
              throw error;
            }
          });
      },
    },
    CoursePack: {
      filter(filters = {}, order, limit) {
        return wrapListWithOrderAndLimit(
          'course_packs',
          filters,
          order,
          limit,
        );
      },
      list(order, limit) {
        return wrapListWithOrderAndLimit(
          'course_packs',
          {},
          order,
          limit,
        );
      },
      create(data) {
        return supabase
          .from('course_packs')
          .insert(data)
          .select()
          .single()
          .then(({ data: created, error }) => {
            if (error) {
              console.error('CoursePack.create error:', error);
              throw error;
            }
            return created;
          });
      },
      update(id, data) {
        return supabase
          .from('course_packs')
          .update(data)
          .eq('id', id)
          .select()
          .single()
          .then(({ data: updated, error }) => {
            if (error) {
              console.error('CoursePack.update error:', error);
              throw error;
            }
            return updated;
          });
      },
    },
    Quiz: {
      filter(filters = {}, order, limit) {
        return wrapListWithOrderAndLimit('quizzes', filters, order, limit);
      },
      list(order, limit) {
        return wrapListWithOrderAndLimit('quizzes', {}, order, limit);
      },
      create(data) {
        return supabase
          .from('quizzes')
          .insert(data)
          .select()
          .single()
          .then(({ data: created, error }) => {
            if (error) {
              console.error('Quiz.create error:', error);
              throw error;
            }
            return created;
          });
      },
      update(id, data) {
        return supabase
          .from('quizzes')
          .update(data)
          .eq('id', id)
          .select()
          .single()
          .then(({ data: updated, error }) => {
            if (error) {
              console.error('Quiz.update error:', error);
              throw error;
            }
            return updated;
          });
      },
    },
    Assignment: {
      filter(filters = {}, order, limit) {
        return wrapListWithOrderAndLimit('assignments', filters, order, limit);
      },
      list(order, limit) {
        return wrapListWithOrderAndLimit('assignments', {}, order, limit);
      },
      create(data) {
        return supabase
          .from('assignments')
          .insert(data)
          .select()
          .single()
          .then(({ data: created, error }) => {
            if (error) {
              console.error('Assignment.create error:', error);
              throw error;
            }
            return created;
          });
      },
      update(id, data) {
        return supabase
          .from('assignments')
          .update(data)
          .eq('id', id)
          .select()
          .single()
          .then(({ data: updated, error }) => {
            if (error) {
              console.error('Assignment.update error:', error);
              throw error;
            }
            return updated;
          });
      },
    },
  },

  integrations: {
    Core: {
      async SendEmail({ to, subject, body }) {
        const apiBaseUrl = import.meta.env.VITE_API_URL;
        if (!apiBaseUrl) {
          console.warn(
            'VITE_API_URL is not set, SendEmail is a no-op. Email not sent.',
          );
          return;
        }
        const res = await fetch(`${apiBaseUrl}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to, subject, body }),
        });
        if (!res.ok) {
          console.error('SendEmail failed:', await res.text());
        }
      },
      async UploadFile({ file }) {
        const apiBaseUrl = import.meta.env.VITE_API_URL;
        if (!apiBaseUrl) {
          throw new Error('VITE_API_URL is required for file upload');
        }
        const form = new FormData();
        form.append('file', file);
        const res = await fetch(`${apiBaseUrl}/api/upload`, {
          method: 'POST',
          body: form,
        });
        if (!res.ok) {
          const text = await res.text();
          console.error('UploadFile failed:', text);
          throw new Error('Upload failed');
        }
        return res.json();
      },
    },
  },

  // Chat ARIA via DeepSeek (Edge Function Supabase)
  agents: {
    async createConversation() {
      return {
        id: `aria-${Date.now()}`,
        messages: [
          {
            role: 'assistant',
            content:
              "Bonjour, je suis ARIA ✨ Pose-moi tes questions sur les formations FasoCademy et je t'aide à trouver la formation idéale.",
          },
        ],
      };
    },
    subscribeToConversation(/* id, cb */) {
      return () => {};
    },
    async addMessage(conversation, { role, content }) {
      const userMessage = { role, content };
      const allMessages = [...(conversation.messages || []), userMessage];

      let assistantContent;
      try {
        assistantContent = await getAriaReply(
          allMessages.map((m) => ({ role: m.role, content: m.content }))
        );
      } catch (err) {
        console.error('ARIA DeepSeek error:', err);
        assistantContent =
          "Désolée, le chat est temporairement indisponible. Explore le catalogue ou réessaie plus tard.";
      }

      const messages = [
        ...allMessages,
        { role: 'assistant', content: assistantContent },
      ];
      return { ...conversation, messages };
    },
  },
};
