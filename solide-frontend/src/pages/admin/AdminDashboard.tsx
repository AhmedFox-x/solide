import { useEffect, useState } from 'react'
import { projectsApi, testimonialsApi, ticketsApi } from '../../lib/api'
import type { Project, Testimonial, Ticket } from '../../lib/api'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])

  useEffect(() => {
    Promise.all([projectsApi.all(), testimonialsApi.list(), ticketsApi.list()])
      .then(([p, t, tk]) => { setProjects(p.projects); setTestimonials(t.testimonials); setTickets(tk.tickets) })
      .catch(() => {})
  }, [])

  const published = projects.filter(p => p.status === 'published').length
  const openTickets = tickets.filter(t => t.status === 'open').length

  const cards = [
    {
      label: 'Total Projects',
      value: projects.length,
      sub: `${published} published`,
      gradient: 'from-gold/20 to-gold/5',
      border: 'border-gold/20',
      link: '/admin/projects',
    },
    {
      label: 'Testimonials',
      value: testimonials.length,
      sub: 'Client reviews',
      gradient: 'from-emerald-500/10 to-emerald-500/5',
      border: 'border-emerald-500/20',
      link: '/admin/testimonials',
    },
    {
      label: 'Open Tickets',
      value: openTickets,
      sub: `${tickets.length} total`,
      gradient: 'from-amber-500/10 to-amber-500/5',
      border: 'border-amber-500/20',
      link: '/admin/tickets',
    },
    {
      label: 'Media Files',
      value: '—',
      sub: 'Uploaded assets',
      gradient: 'from-sky-500/10 to-sky-500/5',
      border: 'border-sky-500/20',
      link: '/admin/media',
    },
  ]

  return (
    <div className="max-w-6xl space-y-8">
      {/* page header */}
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Dashboard</h1>
        <p className="text-sm text-white/40 mt-1">Overview of your Solide platform</p>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.link}
            className={`relative group bg-gradient-to-br ${c.gradient} ${c.border} border rounded-xl p-5 hover:brightness-110 transition-all duration-300 overflow-hidden`}
          >
            <div className="absolute top-3 right-3 w-20 h-20 rounded-full bg-white/[0.02] blur-xl" />
            <div className="relative">
              <p className="text-xs text-white/40 tracking-wider uppercase mb-1">{c.label}</p>
              <p className="text-3xl font-bold text-white tracking-tight">{c.value}</p>
              <p className="text-[11px] text-white/30 mt-1.5">{c.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ticket summary */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 lg:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-sm font-semibold text-white/80">Ticket Summary</h2>
            <p className="text-xs text-white/30 mt-0.5">Support requests overview</p>
          </div>
          <Link to="/admin/tickets"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs tracking-wider uppercase hover:bg-amber-500/20 transition-all"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            View All Tickets
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: tickets.length, color: 'text-white' },
            { label: 'Open', value: tickets.filter(t => t.status === 'open').length, color: 'text-amber-400' },
            { label: 'Resolved', value: tickets.filter(t => t.status === 'resolved').length, color: 'text-emerald-400' },
            { label: 'Other', value: tickets.filter(t => t.status !== 'open' && t.status !== 'resolved').length, color: 'text-white/50' },
          ].map(s => (
            <div key={s.label} className="bg-white/[0.02] border border-white/5 rounded-lg p-4 text-center">
              <p className="text-xs text-white/40 tracking-wider uppercase mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* charts-like bars */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* projects status */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white/80 mb-4">Project Status</h2>
          <div className="space-y-3">
            {[
              { label: 'Published', count: published, color: 'bg-emerald-500' },
              { label: 'Draft', count: projects.length - published, color: 'bg-white/30' },
            ].map((s) => {
              const pct = projects.length ? (s.count / projects.length) * 100 : 0
              return (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/50">{s.label}</span>
                    <span className="text-white/70">{s.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${s.color} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* tickets status */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white/80 mb-4">Ticket Status</h2>
          <div className="space-y-3">
            {[
              { label: 'Open', count: openTickets, color: 'bg-amber-500' },
              { label: 'Resolved', count: tickets.filter(t => t.status === 'resolved').length, color: 'bg-emerald-500' },
              { label: 'Other', count: tickets.filter(t => t.status !== 'open' && t.status !== 'resolved').length, color: 'bg-white/30' },
            ].map((s) => {
              const pct = tickets.length ? (s.count / tickets.length) * 100 : 0
              return (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/50">{s.label}</span>
                    <span className="text-white/70">{s.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${s.color} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* recent lists */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white/80 mb-4">Recent Projects</h2>
          {projects.length === 0 ? (
            <p className="text-white/20 text-sm py-6 text-center">No projects yet.</p>
          ) : (
            <div className="divide-y divide-white/5">
              {projects.slice(0, 5).map((p) => (
                <Link key={p.id} to={`/admin/projects/${p.id}`} className="flex items-center justify-between py-2.5 group">
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors truncate">{p.title}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ml-3 ${
                    p.status === 'published'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-white/5 text-white/40'
                  }`}>
                    {p.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white/80 mb-4">Recent Tickets</h2>
          {tickets.length === 0 ? (
            <p className="text-white/20 text-sm py-6 text-center">No tickets yet.</p>
          ) : (
            <div className="divide-y divide-white/5">
              {tickets.slice(0, 5).map((t) => (
                <div key={t.id} className="py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70 truncate">{t.subject}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ml-3 ${
                      t.status === 'open' ? 'bg-amber-500/10 text-amber-400'
                      : t.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-white/5 text-white/40'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="text-xs text-white/30 mt-0.5">{t.name} &middot; {t.email}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
