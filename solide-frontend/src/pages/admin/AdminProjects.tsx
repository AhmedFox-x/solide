import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { projectsApi } from '../../lib/api'
import type { Project } from '../../lib/api'
import { assetUrl } from '../../lib/asset'
import { Plus, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    projectsApi.all()
      .then(r => setProjects(r.projects))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return
    try { await projectsApi.delete(id); toast.success('Deleted'); load() }
    catch (e: any) { toast.error(e.message) }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-white/40 text-sm py-16 justify-center">
        <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        Loading...
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Projects</h1>
          <p className="text-sm text-white/40 mt-0.5">{projects.length} total</p>
        </div>
        <Link
          to="/admin/projects/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-gold text-[#03050D] rounded-lg font-medium text-sm hover:bg-gold/90 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-white/20 text-sm py-16 text-center">No projects yet. Create your first one.</div>
      ) : (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
          <div className="divide-y divide-white/5">
            {projects.map(p => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors group">
                {/* thumbnail */}
                {p.beforeImage ? (
                  <img src={assetUrl(p.beforeImage)}
                    alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-white/5" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/20 text-xs shrink-0">
                    {p.title.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm text-white/80 font-medium truncate">{p.title}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${
                      p.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-white/5 text-white/40'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-xs text-white/30 mt-0.5">{p.category}</p>
                </div>

                {/* actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    to={`/admin/projects/${p.id}`}
                    className="p-1.5 text-white/30 hover:text-gold transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 text-white/30 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
