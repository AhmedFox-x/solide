import { useState, useEffect, useCallback } from 'react'
import { api } from '../../lib/api'
import { Smartphone, RefreshCw, CheckCircle, XCircle, Clock, Loader } from 'lucide-react'

interface WhatsAppStatus {
  connected: boolean
  qrCode: string | null
  status: string
}

export default function AdminWhatsApp() {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchStatus = useCallback(async () => {
    try {
      setError('')
      const data = await api.get<WhatsAppStatus>('/api/whatsapp/qr')
      setStatus(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStatus() }, [fetchStatus])

  const connected = status?.connected ?? false

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">WhatsApp</h1>
          <p className="text-sm text-white/40 mt-0.5">اربط واتساب عشان الأوردرات توصل تلقائياً</p>
        </div>
        <button onClick={fetchStatus} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/40 hover:text-white/70 transition-colors">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </button>
      </div>

      {/* status card */}
      <div className={`rounded-xl p-5 border ${connected ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${connected ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
            {connected ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <Clock className="w-5 h-5 text-amber-400" />}
          </div>
          <div>
            <p className={`text-sm font-medium ${connected ? 'text-emerald-400' : 'text-amber-400'}`}>
              {connected ? 'متصل ✅' : 'غير متصل'}
            </p>
            <p className="text-xs text-white/40 mt-0.5">
              {connected ? 'الأوردرات هتتبعت تلقائياً' : 'امسح QR عشان تربط الجهاز'}
            </p>
          </div>
        </div>
      </div>

      {/* QR code section */}
      {!connected && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gold/10">
              <Smartphone className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h3 className="text-white text-sm font-medium">اربط جهاز واتساب</h3>
              <p className="text-xs text-white/40 mt-1">
                افتح واتساب ← الأجهزة المرتبطة ← ربط جهاز ← امسح QR
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
              </div>
            ) : status?.qrCode ? (
              <div className="inline-block p-3 bg-white rounded-xl">
                <img src={`data:image/png;base64,${status.qrCode}`} alt="QR Code" className="w-56 h-56" />
              </div>
            ) : (
              <div className="py-8 text-white/20 text-sm">...جاري تجهيز QR</div>
            )}

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              onClick={fetchStatus}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gold text-[#03050D] rounded-lg text-sm font-medium hover:bg-gold/90 transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              {loading ? '...جاري' : 'تحديث QR'}
            </button>
          </div>
        </div>
      )}

      {/* info box */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-xs text-white/30 leading-relaxed">
        <p className="font-medium text-white/50 mb-1">معلومة:</p>
        <p>الـ QR بيتجدد تلقائياً. لو اتعطل الاتصال، ارجع امسح QR تاني من الصفحة دي.</p>
      </div>
    </div>
  )
}
