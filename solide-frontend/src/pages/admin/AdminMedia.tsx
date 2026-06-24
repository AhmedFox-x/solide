import { useEffect, useState, useRef } from 'react'
import { mediaApi } from '../../lib/api'
import type { MediaFile } from '../../lib/api'
import { assetUrl } from '../../lib/asset'
import { Upload, Trash2, Image, FileVideo, Box, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminMedia() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const load = () => {
    mediaApi.list()
      .then(r => setFiles(r.files))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await mediaApi.upload(file, file.name)
      toast.success('Uploaded')
      setFiles(prev => [res.file, ...prev])
    } catch (err: any) { toast.error(err.message) }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = '' }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return
    try { await mediaApi.delete(id); toast.success('Deleted'); setFiles(prev => prev.filter(f => f.id !== id)) }
    catch (e: any) { toast.error(e.message) }
  }

  const formatSize = (b: number) =>
    b < 1024 ? `${b}B` : b < 1048576 ? `${(b/1024).toFixed(0)}KB` : `${(b/1048576).toFixed(1)}MB`

  const typeMeta = (type: string) => {
    if (type === 'video') return { icon: FileVideo, label: 'Video' }
    if (type === '3d') return { icon: Box, label: '3D' }
    return { icon: Image, label: 'Image' }
  }

  if (loading) {
    return <div className="flex items-center gap-2 text-white/40 text-sm py-16 justify-center">
      <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /> Loading...
    </div>
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Media</h1>
          <p className="text-sm text-white/40 mt-0.5">{files.length} files</p>
        </div>
        <div>
          <input ref={inputRef} type="file" onChange={handleUpload} accept="image/*,video/*,.glb,.obj,.stl" className="hidden" />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-4 py-2 bg-gold text-[#03050D] rounded-lg font-medium text-sm hover:bg-gold/90 transition-all disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>

      {files.length === 0 ? (
        <div className="text-center text-white/20 py-16">
          <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No files yet. Upload images, videos, or 3D models.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {files.map(f => {
            const { icon: TypeIcon } = typeMeta(f.mediaType)
            return (
              <div key={f.id} className="group relative bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all">
                {/* preview */}
                <div className="aspect-square bg-white/[0.02]">
                  {f.mediaType === 'video' ? (
                    <video src={assetUrl(f.url)} className="w-full h-full object-cover" />
                  ) : f.mediaType === 'image' ? (
                    <img src={assetUrl(f.url)} alt={f.altText || ''} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10">
                      <Box className="w-10 h-10" />
                    </div>
                  )}
                </div>

                {/* overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a href={assetUrl(f.url)} target="_blank" rel="noopener noreferrer"
                    className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                    <ExternalLink className="w-4 h-4 text-white/70" />
                  </a>
                  <button onClick={() => handleDelete(f.id)}
                    className="p-2 bg-red-400/10 rounded-lg hover:bg-red-400/20 transition-colors">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>

                {/* footer */}
                <div className="p-2 flex items-center gap-1.5">
                  <TypeIcon className="w-3 h-3 text-white/30" />
                  <span className="text-[10px] text-white/30">{typeMeta(f.mediaType).label}</span>
                  <span className="text-[10px] text-white/20 mr-auto">{formatSize(f.sizeBytes)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
