import { supabase } from './supabase'
import { getCurrentUser } from './supabase'

// ============================================
// COURSES
// ============================================
export const CoursesAPI = {
  async list(filters = {}, orderBy = 'created_at', limit = 50) {
    let query = supabase
      .from('courses')
      .select('*')
      .order(orderBy, { ascending: false })
      .limit(limit)

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })

    const { data, error } = await query
    if (error) {
      console.error('CoursesAPI.list error:', error)
      return []
    }
    return data || []
  },

  async get(id) {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('CoursesAPI.get error:', error)
      return null
    }
    return data
  },

  async create(data) {
    const { data: created, error } = await supabase
      .from('courses')
      .insert(data)
      .select()
      .single()

    if (error) {
      console.error('CoursesAPI.create error:', error)
      throw error
    }
    return created
  },

  async update(id, data) {
    const { data: updated, error } = await supabase
      .from('courses')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('CoursesAPI.update error:', error)
      throw error
    }
    return updated
  },

  async delete(id) {
    const { error } = await supabase.from('courses').delete().eq('id', id)
    if (error) {
      console.error('CoursesAPI.delete error:', error)
      throw error
    }
  },
}

// ============================================
// ENROLLMENTS
// ============================================
export const EnrollmentsAPI = {
  async list(filters = {}) {
    let query = supabase
      .from('enrollments')
      .select('*')
      .order('created_at', { ascending: false })

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })

    const { data, error } = await query
    if (error) {
      console.error('EnrollmentsAPI.list error:', error)
      return []
    }
    return data || []
  },

  async create(data) {
    const { data: created, error } = await supabase
      .from('enrollments')
      .insert(data)
      .select()
      .single()

    if (error) {
      console.error('EnrollmentsAPI.create error:', error)
      throw error
    }
    return created
  },

  async update(id, data) {
    const { data: updated, error } = await supabase
      .from('enrollments')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('EnrollmentsAPI.update error:', error)
      throw error
    }
    return updated
  },

  async delete(id) {
    const { error } = await supabase.from('enrollments').delete().eq('id', id)
    if (error) {
      console.error('EnrollmentsAPI.delete error:', error)
      throw error
    }
  },
}

// ============================================
// PAYMENTS
// ============================================
export const PaymentsAPI = {
  async list(filters = {}) {
    let query = supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })

    const { data, error } = await query
    if (error) {
      console.error('PaymentsAPI.list error:', error)
      return []
    }
    return data || []
  },

  async create(data) {
    const { data: created, error } = await supabase
      .from('payments')
      .insert(data)
      .select()
      .single()

    if (error) {
      console.error('PaymentsAPI.create error:', error)
      throw error
    }
    return created
  },

  async update(id, data) {
    const { error } = await supabase
      .from('payments')
      .update(data)
      .eq('id', id)

    if (error) {
      console.error('PaymentsAPI.update error:', error)
      throw error
    }
  },
}

// ============================================
// REVIEWS
// ============================================
export const ReviewsAPI = {
  async list(courseId) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('ReviewsAPI.list error:', error)
      return []
    }
    return data || []
  },

  async create(data) {
    const { data: created, error } = await supabase
      .from('reviews')
      .insert(data)
      .select()
      .single()

    if (error) {
      console.error('ReviewsAPI.create error:', error)
      throw error
    }
    return created
  },
}

// ============================================
// NOTIFICATIONS
// ============================================
export const NotificationsAPI = {
  async list(userEmail) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('NotificationsAPI.list error:', error)
      return []
    }
    return data || []
  },

  async markRead(id) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)

    if (error) {
      console.error('NotificationsAPI.markRead error:', error)
      throw error
    }
  },

  async markAllRead(userEmail) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_email', userEmail)

    if (error) {
      console.error('NotificationsAPI.markAllRead error:', error)
      throw error
    }
  },
}

// ============================================
// CERTIFICATES
// ============================================
export const CertificatesAPI = {
  async list(userEmail) {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_email', userEmail)

    if (error) {
      console.error('CertificatesAPI.list error:', error)
      return []
    }
    return data || []
  },

  async create(data) {
    const { data: created, error } = await supabase
      .from('certificates')
      .insert(data)
      .select()
      .single()

    if (error) {
      console.error('CertificatesAPI.create error:', error)
      throw error
    }
    return created
  },

  async getByNumber(num) {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('certificate_number', num)
      .single()

    if (error) {
      console.error('CertificatesAPI.getByNumber error:', error)
      return null
    }
    return data
  },
}

// ============================================
// COMMENTS
// ============================================
export const CommentsAPI = {
  async list(courseId, lessonId) {
    let query = supabase
      .from('comments')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: true })

    if (lessonId) {
      query = query.eq('lesson_id', lessonId)
    }

    const { data, error } = await query
    if (error) {
      console.error('CommentsAPI.list error:', error)
      return []
    }
    return data || []
  },

  async create(data) {
    const { data: created, error } = await supabase
      .from('comments')
      .insert(data)
      .select()
      .single()

    if (error) {
      console.error('CommentsAPI.create error:', error)
      throw error
    }
    return created
  },
}

// ============================================
// TESTIMONIALS
// ============================================
export const TestimonialsAPI = {
  async listApproved() {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('status', 'approved')

    if (error) {
      console.error('TestimonialsAPI.listApproved error:', error)
      return []
    }
    return data || []
  },

  async create(data) {
    const { data: created, error } = await supabase
      .from('testimonials')
      .insert(data)
      .select()
      .single()

    if (error) {
      console.error('TestimonialsAPI.create error:', error)
      throw error
    }
    return created
  },
}

// ============================================
// CATEGORIES
// ============================================
export const CategoriesAPI = {
  async list() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('"order"', { ascending: true })

    if (error) {
      console.error('CategoriesAPI.list error:', error)
      return []
    }
    return data || []
  },
}

// ============================================
// AUTH (Supabase)
// ============================================
export const AuthAPI = {
  async signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })

    if (error) {
      console.error('AuthAPI.signUp error:', error)
      throw error
    }
    return data
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('AuthAPI.signIn error:', error)
      throw error
    }
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('AuthAPI.signOut error:', error)
      throw error
    }
  },

  me: getCurrentUser,

  async updateMe(data) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('AuthAPI.updateMe getUser error:', userError)
      throw userError || new Error('No authenticated user')
    }

    const allowed = ['full_name', 'bio', 'phone', 'payment_method', 'payment_phone', 'avatar_url']
    const safe = Object.fromEntries(
      Object.entries(data).filter(([k]) => allowed.includes(k))
    )

    const { error } = await supabase
      .from('profiles')
      .update(safe)
      .eq('id', user.id)

    if (error) {
      console.error('AuthAPI.updateMe update error:', error)
      throw error
    }
  },

  async requestInstructorAccess() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      throw userError || new Error('Non connecté')
    }

    const { error } = await supabase
      .from('profiles')
      .update({ instructor_requested_at: new Date().toISOString() })
      .eq('id', user.id)

    if (error) {
      console.error('AuthAPI.requestInstructorAccess error:', error)
      throw error
    }
  },
}

