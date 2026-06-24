import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center p-8 text-center">
      <ShieldAlert className="w-20 h-20 text-gold mb-6" />
      <h1 className="text-6xl font-display text-gold mb-4">404</h1>
      <p className="text-ivory/60 text-lg mb-8">الصفحة غير موجودة</p>
      <Link to="/" className="px-8 py-3 bg-gold text-obsidian rounded-lg font-semibold hover:bg-gold-light transition-all">العودة للرئيسية</Link>
    </div>
  )
}
