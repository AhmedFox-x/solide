import { useEffect, useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { authApi } from '../lib/api'
import {
  LayoutDashboard, FolderKanban, MessageSquare, Ticket,
  Image, Smartphone, LogOut, Menu, X, ChevronLeft,
} from 'lucide-react'

const LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { to: '/admin/testimonials', label: 'Testimonials', icon: MessageSquare },
  { to: '/admin/tickets', label: 'Tickets', icon: Ticket },
  { to: '/admin/media', label: 'Media', icon: Image },
  { to: '/admin/whatsapp', label: 'WhatsApp', icon: Smartphone },
]

export default function AdminLayout() {
  const [admin, setAdmin] = useState<{ name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    authApi.me().then(r => setAdmin(r.admin)).catch(() => navigate('/admin/login'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#03050D] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          <span className="text-gold/60 text-xs tracking-widest uppercase">Loading</span>
        </div>
      </div>
    )
  }
  if (!admin) return null

  const isActive = (link: typeof LINKS[0]) => {
    if (link.end) return location.pathname === link.to
    return location.pathname.startsWith(link.to)
  }

  return (
    <div className="min-h-screen bg-[#03050D] flex" dir="ltr">
      {/* sidebar overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40 lg:hidden" />
      )}

      {/* sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:sticky top-0 left-0 z-50 w-64 h-screen bg-[#07091A] border-r border-white/5 transition-transform duration-300 flex flex-col`}
      >
        {/* brand */}
        <div className="h-16 flex items-center px-5 border-b border-white/5 shrink-0">
          <Link to="/admin" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold/70 flex items-center justify-center text-[#03050D] font-bold text-sm">
              S
            </div>
            <div>
              <span className="text-sm font-semibold text-white/90">Solide</span>
              <span className="block text-[10px] text-white/30 tracking-widest uppercase">Admin</span>
            </div>
          </Link>
        </div>

        {/* nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {LINKS.map((link) => {
            const Icon = link.icon
            const active = isActive(link)
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  active
                    ? 'bg-gold/10 text-gold border border-gold/15'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
                {active && <ChevronLeft className="w-3.5 h-3.5 mr-auto opacity-50" />}
              </Link>
            )
          })}
        </nav>

        {/* user & logout */}
        <div className="p-3 border-t border-white/5 shrink-0">
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg mb-1">
            <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[10px] text-white/40 font-semibold">
              {admin.name?.charAt(0) || admin.email.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-white/60 truncate">{admin.name}</p>
              <p className="text-[10px] text-white/30 truncate">{admin.email}</p>
            </div>
          </div>
          <button
            onClick={() => { authApi.clearToken(); navigate('/admin/login') }}
            className="flex items-center gap-2.5 w-full px-3.5 py-2 rounded-lg text-xs text-white/30 hover:text-red-400 hover:bg-red-400/5 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* top bar */}
        <header className="h-16 sticky top-0 z-30 bg-[#03050D]/80 backdrop-blur-lg border-b border-white/5 px-4 md:px-6 flex items-center gap-4 shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-white/40 hover:text-white/70 transition-colors">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-white/20">
            <span className="text-white/50">Admin</span>
            {location.pathname !== '/admin' && (
              <>
                <span>/</span>
                <span className="text-white/70 capitalize">
                  {location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
                </span>
              </>
            )}
          </div>

          <div className="mr-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400/70" />
              <span className="text-[10px] text-white/30 tracking-wider">Online</span>
            </div>
          </div>
        </header>

        {/* page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
