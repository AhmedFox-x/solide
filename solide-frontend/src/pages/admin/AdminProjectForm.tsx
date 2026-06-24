import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { projectsApi, mediaApi } from '../../lib/api'
import { assetUrl } from '../../lib/asset'
import toast from 'react-hot-toast'
import { Upload, X, Image, FileVideo, Box } from 'lucide-react'
import { translations } from '../../lib/translations'

interface MediaItem { url: string; type: 'image' | 'video' | '3d'; thumbnail?: string }

type FormData = {
  title: string
  description: string
  category: string
  type: string
  images: string
  videos: string
  models3d: string
  beforeImage: string
  status: string
}

// const CATEGORIES = ['تشكيل معادن', 'تركيبات', 'ديكور', 'هياكل فولاذية', 'أعمال حرفية']

export default function AdminProjectForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [form, setForm] = useState<FormData>({
    title: '', description: '', category: 'تشكيل معادن',
    type: 'تشكيل معادن', images: '[]', videos: '[]', models3d: '[]', beforeImage: '', status: 'draft',
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const thumbInputRef = useRef<HTMLInputElement>(null)
  const [uploadTarget, setUploadTarget] = useState<'images' | 'videos' | 'models3d'>('images')
  const [uploadForCover, setUploadForCover] = useState(false)
  const [thumbnailForIdx, setThumbnailForIdx] = useState<number | null>(null)

  useEffect(() => {
    if (id) {
      projectsApi.byId(id).then(r => {
        const p = r.project
        setForm({
          title: p.title, description: p.description, category: p.category,
          type: p.type, images: p.images, videos: p.videos,
          models3d: p.models3d, beforeImage: p.beforeImage || '', status: p.status,
        })
      }).catch(() => navigate('/admin/projects'))
    }
  }, [id])

  const parseItems = (field: 'images' | 'videos' | 'models3d'): MediaItem[] => {
    try {
      const arr = JSON.parse(form[field])
      if (!Array.isArray(arr)) return []
      if (field === 'videos') {
        return arr.filter(Boolean).map((item: any): MediaItem => {
          if (typeof item === 'string') return { url: item, type: 'video' }
          return { url: item.url, type: 'video', thumbnail: item.thumbnail }
        })
      }
      return (arr as string[]).filter(Boolean).map(url => ({
        url,
        type: field === 'images' ? 'image' : '3d',
      }))
    } catch { return [] }
  }

  const addItem = (field: 'images' | 'videos' | 'models3d', url: string) => {
    const arr = parseItems(field)
    if (field === 'videos') {
      arr.push({ url, type: 'video' })
      setForm({ ...form, [field]: JSON.stringify(arr.map(i => ({ url: i.url, thumbnail: (i as any).thumbnail }))) })
    } else {
      arr.push({ url, type: field === 'images' ? 'image' : '3d' })
      setForm({ ...form, [field]: JSON.stringify(arr.map(i => i.url)) })
    }
  }

  const removeItem = (field: 'images' | 'videos' | 'models3d', idx: number) => {
    const arr = parseItems(field)
    arr.splice(idx, 1)
    if (field === 'videos') {
      setForm({ ...form, [field]: JSON.stringify(arr.map(i => ({ url: i.url, thumbnail: (i as any).thumbnail }))) })
    } else {
      setForm({ ...form, [field]: JSON.stringify(arr.map(i => i.url)) })
    }
  }

  const setVideoThumbnail = (idx: number, thumbUrl: string) => {
    const arr = parseItems('videos')
    if (arr[idx]) {
      (arr[idx] as any).thumbnail = thumbUrl
      setForm({ ...form, videos: JSON.stringify(arr.map(i => ({ url: i.url, thumbnail: (i as any).thumbnail }))) })
    }
  }

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      if (thumbnailForIdx !== null) {
        const res = await mediaApi.upload(file, file.name)
        setVideoThumbnail(thumbnailForIdx, res.file.url)
        setThumbnailForIdx(null)
        toast.success('Thumbnail set')
      } else {
        const res = await mediaApi.upload(file, file.name)
        if (uploadForCover) {
          setForm({ ...form, beforeImage: res.file.url })
          setUploadForCover(false)
        } else {
          addItem(uploadTarget, res.file.url)
        }
        toast.success('File uploaded')
      }
    } catch (err: any) { toast.error(err.message) }
    finally { setUploading(false); [inputRef, thumbInputRef].forEach(r => { if (r.current) r.current.value = '' }) }
  }

  const handleThumbnailPick = (idx: number) => {
    setThumbnailForIdx(idx)
    thumbInputRef.current?.click()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit) { await projectsApi.update(id!, form); toast.success('Project updated') }
      else { await projectsApi.create(form); toast.success('Project created') }
      navigate('/admin/projects')
    } catch (err: any) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const projectTypeOptions = translations.projectTypes.ar
  // show Arabic labels, store the Arabic value (matches what PortfolioPage compares)
  const fields: { key: keyof FormData; label: string; rows?: number }[] = [
    { key: 'title', label: 'Title' },
    { key: 'description', label: 'Description', rows: 4 },
    { key: 'category', label: 'Category' },
  ]

  const mediaFields: { key: 'images' | 'videos' | 'models3d'; label: string; icon: typeof Image }[] = [
    { key: 'images', label: 'Images', icon: Image },
    { key: 'videos', label: 'Videos', icon: FileVideo },
    { key: 'models3d', label: '3D Models', icon: Box },
  ]

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-xl font-semibold text-white tracking-tight">
        {isEdit ? 'Edit Project' : 'New Project'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* basic fields */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-4">
          <p className="text-xs text-white/30 tracking-wider uppercase">Details</p>
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-xs text-white/50 mb-1.5">{f.label}</label>
              {f.rows ? (
                <textarea
                  value={form[f.key]}
                  onChange={e => setForm({...form, [f.key]: e.target.value})}
                  rows={f.rows}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-gold/50 focus:outline-none transition-colors resize-none"
                />
              ) : (
                <input
                  value={form[f.key]}
                  onChange={e => setForm({...form, [f.key]: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-gold/50 focus:outline-none transition-colors"
                />
              )}
            </div>
          ))}
          {/* project type dropdown */}
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Type</label>
            <select
              value={form.type}
              onChange={e => setForm({...form, type: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-gold/50 focus:outline-none transition-colors"
            >
              {projectTypeOptions.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* cover image */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-4">
          <p className="text-xs text-white/30 tracking-wider uppercase">Cover Image</p>
          {form.beforeImage ? (
            <div className="group relative inline-block">
              <img src={assetUrl(form.beforeImage)} alt="Cover" className="h-32 w-auto rounded-lg object-cover border border-white/10" />
              <button type="button" onClick={() => setForm({...form, beforeImage: ''})}
                className="absolute -top-2 -right-2 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              ><X className="w-3 h-3 text-white/80" /></button>
            </div>
          ) : (
            <button type="button" onClick={() => { setUploadForCover(true); setUploadTarget('images'); inputRef.current?.click() }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-white/20 text-white/40 text-xs hover:border-gold/30 hover:text-gold/60 transition-all"
            ><Upload className="w-3.5 h-3.5" /> Upload Cover</button>
          )}
        </div>

        {/* media upload */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-4">
          <p className="text-xs text-white/30 tracking-wider uppercase">Media</p>

          {/* upload bar */}
          <div className="flex flex-wrap gap-2">
            {mediaFields.map(mf => (
              <button
                key={mf.key}
                type="button"
                onClick={() => {
                  setUploadTarget(mf.key)
                  inputRef.current?.click()
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                  uploadTarget === mf.key
                    ? 'bg-gold/20 text-gold border border-gold/30'
                    : 'bg-white/5 text-white/40 border border-white/10 hover:border-white/30'
                }`}
              >
                <mf.icon className="w-3.5 h-3.5" />
                {mf.label}
              </button>
            ))}
            <input
              ref={inputRef}
              type="file"
              onChange={handleFilePick}
              accept="image/*,video/*,.glb,.obj,.stl"
              className="hidden"
            />
            <input
              ref={thumbInputRef}
              type="file"
              accept="image/*"
              onChange={handleFilePick}
              className="hidden"
            />
            {uploading && (
              <span className="text-xs text-gold/60 animate-pulse flex items-center gap-1">
                <Upload className="w-3 h-3" /> Uploading...
              </span>
            )}
          </div>

          {/* preview grids */}
          {mediaFields.map(mf => {
            const items = parseItems(mf.key)
            if (items.length === 0) return null
            return (
              <div key={mf.key}>
                <p className="text-[10px] text-white/30 tracking-wider uppercase mb-2">{mf.label} ({items.length})</p>
                <div className="flex flex-wrap gap-2">
                  {items.map((item, i) => (
                    <div key={i} className="group relative w-20 h-20 rounded-lg overflow-hidden bg-white/5 border border-white/10">
                      {item.type === 'image' ? (
                        <img src={assetUrl(item.url)} alt="" className="w-full h-full object-cover" />
                      ) : item.type === 'video' ? (
                        <div className="w-full h-full flex items-center justify-center text-white/20 relative bg-black/30">
                          {item.thumbnail ? (
                            <img src={assetUrl(item.thumbnail)} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                          ) : null}
                          <FileVideo className="w-6 h-6 relative z-10" />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleThumbnailPick(i) }}
                            className="absolute bottom-1 left-1/2 -translate-x-1/2 z-10 text-[8px] px-1.5 py-0.5 rounded bg-black/60 text-white/50 hover:text-gold hover:bg-black/80 transition-all"
                          >
                            {item.thumbnail ? 'Change' : 'Thumb'}
                          </button>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">
                          <Box className="w-6 h-6" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeItem(mf.key, i)}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-white/80" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* status */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-4">
          <p className="text-xs text-white/30 tracking-wider uppercase">Publishing</p>
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={e => setForm({...form, status: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-gold/50 focus:outline-none transition-colors"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gold text-[#03050D] font-semibold rounded-lg hover:bg-gold/90 transition-all text-sm disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Project' : 'Create Project'}
        </button>
      </form>
    </div>
  )
}
