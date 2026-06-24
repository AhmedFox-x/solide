import { useEffect, useState } from 'react'
import { testimonialsApi } from '../../lib/api'
import type { Testimonial } from '../../lib/api'
import { Star, Trash2, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

const emptyForm = { name: '', title: '', content: '', rating: 5, company: '' }

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const load = () => {
    testimonialsApi.list()
      .then(r => setTestimonials(r.testimonials))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return
    try { await testimonialsApi.delete(id); toast.success('Deleted'); load() }
    catch (e: any) { toast.error(e.message) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editId) { await testimonialsApi.update(editId, form); toast.success('Updated') }
      else { await testimonialsApi.create(form); toast.success('Created') }
      setShowForm(false); setEditId(null); setForm(emptyForm); load()
    } catch (err: any) { toast.error(err.message) }
  }

  const startEdit = (t: Testimonial) => {
    setForm({ name: t.name, title: t.title, content: t.content, rating: t.rating, company: t.company || '' })
    setEditId(t.id); setShowForm(true)
  }

  if (loading) {
    return <div className="flex items-center gap-2 text-white/40 text-sm py-16 justify-center">
      <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /> Loading...
    </div>
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Testimonials</h1>
          <p className="text-sm text-white/40 mt-0.5">{testimonials.length} total</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm) }}
          className="flex items-center gap-1.5 px-4 py-2 bg-gold text-[#03050D] rounded-lg font-medium text-sm hover:bg-gold/90 transition-all"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1">Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-gold/50 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Title</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-gold/50 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Company</label>
            <input value={form.company} onChange={e => setForm({...form, company: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-gold/50 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Content</label>
            <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={3} required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-gold/50 focus:outline-none" />
          </div>
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1">Rating</label>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={() => setForm({...form, rating: n})}>
                    <Star className={`w-4 h-4 ${n <= form.rating ? 'text-gold fill-gold' : 'text-white/20'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mr-auto">
              <button type="button" onClick={() => { setShowForm(false); setEditId(null) }}
                className="px-3 py-1.5 text-xs text-white/40 hover:text-white/70 transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-1.5 bg-gold text-[#03050D] rounded-lg font-medium text-xs hover:bg-gold/90 transition-all">
                {editId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* list */}
      <div className="space-y-3">
        {testimonials.length === 0 && (
          <p className="text-white/20 text-sm py-16 text-center">No testimonials yet.</p>
        )}
        {testimonials.map(t => (
          <div key={t.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold text-sm shrink-0">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm text-white/80 font-medium">{t.name}</h3>
                  <p className="text-xs text-white/40">{t.title}{t.company ? ` · ${t.company}` : ''}</p>
                  <div className="flex gap-0.5 mt-0.5">
                    {Array.from({length: t.rating}).map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-gold fill-gold" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => startEdit(t)} className="p-1 text-white/30 hover:text-gold transition-colors text-xs">Edit</button>
                <button onClick={() => handleDelete(t.id)} className="p-1 text-white/30 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-sm text-white/50 mt-2.5 leading-relaxed">&ldquo;{t.content}&rdquo;</p>
          </div>
        ))}
      </div>
    </div>
  )
}
