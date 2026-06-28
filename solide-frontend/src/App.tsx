import { lazy, Suspense } from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'

const HomePage = lazy(() => import('./pages/HomePage'))
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'))
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'))
const VideosPage = lazy(() => import('./pages/VideosPage'))
const NotFound = lazy(() => import('./pages/NotFound'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects'))
const AdminProjectForm = lazy(() => import('./pages/admin/AdminProjectForm'))
const AdminTestimonials = lazy(() => import('./pages/admin/AdminTestimonials'))
const AdminTickets = lazy(() => import('./pages/admin/AdminTickets'))
const AdminMedia = lazy(() => import('./pages/admin/AdminMedia'))
const AdminLayout = lazy(() => import('./layout/AdminLayout'))

const Loader = () => (
  <div className="min-h-screen bg-obsidian flex items-center justify-center">
    <div className="w-6 h-6 border border-gold/30 border-t-gold rounded-full animate-spin" />
  </div>
)

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        <Suspense fallback={<Loader />}>
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/project/:id" element={<ProjectDetailPage />} />
            <Route path="/videos" element={<VideosPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="projects/new" element={<AdminProjectForm />} />
              <Route path="projects/:id" element={<AdminProjectForm />} />
              <Route path="testimonials" element={<AdminTestimonials />} />
              <Route path="tickets" element={<AdminTickets />} />
              <Route path="media" element={<AdminMedia />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  return (
    <HashRouter>
      <Toaster position="top-center" toastOptions={{
        style: { background: '#0C1128', color: '#F2E8D0', border: '1px solid #C8963C' },
      }} />
      <AnimatedRoutes />
    </HashRouter>
  )
}
