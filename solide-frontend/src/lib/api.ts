const BASE = import.meta.env.VITE_API_URL || ''

function getToken() { return localStorage.getItem('solide_token') }

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {}
  if (body && !(body instanceof FormData)) headers['Content-Type'] = 'application/json'
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, {
    method, headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw Object.assign(new Error(err.error || 'Request failed'), { status: res.status })
  }
  return res.json()
}

export const api = {
  get: <T>(p: string) => req<T>('GET', p),
  post: <T>(p: string, b?: unknown) => req<T>('POST', p, b),
  patch: <T>(p: string, b?: unknown) => req<T>('PATCH', p, b),
  delete: <T>(p: string) => req<T>('DELETE', p),
  upload: <T>(p: string, f: FormData) => req<T>('POST', p, f),
}

export interface Project {
  id: string; title: string; description: string; category: string
  type: string; images: string; videos: string; models3d: string
  beforeImage?: string; afterImage?: string
  status: string; featured: boolean; sortOrder: number
  createdAt: string; updatedAt: string
}

export interface OrderProject {
  id: string; title: string; images: string[]; type?: string; category?: string; description?: string
}

export interface Testimonial {
  id: string; name: string; title: string; content: string
  rating: number; imageUrl?: string; company?: string
  featured: boolean; createdAt: string
}

export interface Ticket {
  id: string; name: string; email: string; phone?: string
  subject: string; message: string; type: string
  preferredContact: string
  status: string; priority: string; response?: string
  respondedAt?: string; createdAt: string
}

export interface MediaFile {
  id: string; filename: string; url: string; mimeType: string
  sizeBytes: number; mediaType: string; altText?: string; createdAt: string
}

export const authApi = {
  login: (email: string, password: string) => api.post<{ token: string; admin: { id: string; email: string; name: string } }>('/api/auth/login', { email, password }),
  me: () => api.get<{ admin: { id: string; email: string; name: string } }>('/api/auth/me'),
  saveToken: (t: string) => localStorage.setItem('solide_token', t),
  clearToken: () => localStorage.removeItem('solide_token'),
}

export const projectsApi = {
  list: () => api.get<{ projects: Project[] }>('/api/projects'),
  all: () => api.get<{ projects: Project[] }>('/api/projects/all'),
  byId: (id: string) => api.get<{ project: Project }>(`/api/projects/${id}`),
  create: (d: Record<string, unknown>) => api.post<{ project: Project }>('/api/projects', d),
  update: (id: string, d: Record<string, unknown>) => api.patch<{ project: Project }>(`/api/projects/${id}`, d),
  delete: (id: string) => api.delete(`/api/projects/${id}`),
}

export const testimonialsApi = {
  list: () => api.get<{ testimonials: Testimonial[] }>('/api/testimonials'),
  create: (d: Record<string, unknown>) => api.post<{ testimonial: Testimonial }>('/api/testimonials', d),
  update: (id: string, d: Record<string, unknown>) => api.patch<{ testimonial: Testimonial }>(`/api/testimonials/${id}`, d),
  delete: (id: string) => api.delete(`/api/testimonials/${id}`),
}

export const ticketsApi = {
  create: (d: Record<string, unknown>) => api.post<{ ticket: Ticket }>('/api/tickets', d),
  list: () => api.get<{ tickets: Ticket[] }>('/api/tickets'),
  byId: (id: string) => api.get<{ ticket: Ticket }>(`/api/tickets/${id}`),
  update: (id: string, d: Record<string, unknown>) => api.patch<{ ticket: Ticket }>(`/api/tickets/${id}`, d),
  delete: (id: string) => api.delete(`/api/tickets/${id}`),
}

export const mediaApi = {
  list: () => api.get<{ files: MediaFile[] }>('/api/media'),
  upload: (file: File, altText?: string) => {
    const f = new FormData(); f.append('file', file)
    if (altText) f.append('altText', altText)
    return api.upload<{ file: MediaFile }>('/api/media/upload', f)
  },
  delete: (id: string) => api.delete(`/api/media/${id}`),
}
