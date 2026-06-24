import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../lib/api'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authApi.login(email, password)
      authApi.saveToken(res.token)
      toast.success('Welcome back')
      navigate('/admin')
    } catch (err: any) {
      toast.error(err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#03050D] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* brand */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gold to-gold/70 flex items-center justify-center text-[#03050D] font-bold text-2xl">
            S
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Solide Admin</h1>
          <p className="text-sm text-white/40 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/5 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-white/20 focus:border-gold/50 focus:outline-none transition-colors"
              placeholder="admin@solide.com"
            />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-white/20 focus:border-gold/50 focus:outline-none transition-colors"
                placeholder="··········"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gold text-[#03050D] font-medium rounded-lg hover:bg-gold/90 transition-all text-sm disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
