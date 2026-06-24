import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Phone, Globe, MapPin, ArrowRight, ArrowLeft, Send } from "lucide-react";
import { translations } from "../lib/translations";
import type { Lang } from "../lib/translations";
import { ticketsApi } from "../lib/api";
import toast from "react-hot-toast";

interface Props {
  lang: Lang;
}

const iconMap: Record<string, React.ElementType> = {
  MessageCircle, Phone, Globe, MapPin,
};

export default function ContactSection({ lang }: Props) {
  const t = translations.contact[lang];
  const EG_PHONE = /^01[0-2,5]{1}[0-9]{8}$/;
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [preferredContact, setPreferredContact] = useState<"whatsapp" | "email">("whatsapp");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = lang === "en" ? "Name is required" : "الاسم مطلوب";
    if (preferredContact === "whatsapp") {
      const clean = form.phone.replace(/\s/g, "");
      if (!clean) errs.phone = lang === "en" ? "Phone is required for WhatsApp" : "رقم الهاتف مطلوب للواتساب";
      else if (!EG_PHONE.test(clean)) errs.phone = lang === "en" ? "Enter a valid Egyptian phone number" : "أدخل رقم مصري صحيح";
    } else {
      if (!form.email.trim()) errs.email = lang === "en" ? "Email is required" : "البريد الإلكتروني مطلوب";
      else if (!EMAIL_RE.test(form.email)) errs.email = lang === "en" ? "Enter a valid email" : "أدخل بريد إلكتروني صحيح";
    }
    if (!form.message.trim()) errs.message = lang === "en" ? "Message is required" : "الرسالة مطلوبة";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);
    try {
      await ticketsApi.create({
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: `Contact from ${form.name}`,
        message: form.message,
        preferredContact,
      });
      toast.success(t.success);
      setForm({ name: "", email: "", phone: "", message: "" });
      setPreferredContact("whatsapp");
      setErrors({});
    } catch (err: any) {
      toast.error(err.message || t.error);
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="relative py-28 md:py-36 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(200,150,60,0.05),transparent)]" />

      <div className="relative z-[1] max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="block font-sans text-gold text-xs tracking-[0.3em] uppercase mb-6">
            {t.sectionLabel}
          </span>
          <h2 className="font-display text-[clamp(40px,9vw,90px)] font-black tracking-[clamp(5px,2vw,18px)] leading-[0.92] bg-gradient-to-br from-ivory via-gold to-ivory bg-clip-text text-transparent mb-3">
            SOLIDE
          </h2>
          <p className="font-serif italic text-gold text-lg md:text-xl mb-14 tracking-wider">
            {t.tagline}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-14"
        >
          {t.channels.map((ch) => {
            const Icon = iconMap[ch.icon] || MessageCircle;
            return (
              <a
                key={ch.label}
                href={ch.href}
                target={ch.href.startsWith("http") ? "_blank" : undefined}
                rel={ch.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group relative block border border-ivory/10 bg-ivory/[0.015] p-6 md:p-7 transition-all duration-300 overflow-hidden hover:border-gold/40 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(200,150,60,0.1)]"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.04] to-transparent h-0 group-hover:h-full transition-all duration-300" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gold transition-all duration-300 group-hover:w-4/5" />
                <Icon className="w-7 h-7 text-gold/70 mb-3 mx-auto transition-transform duration-300 group-hover:scale-110" />
                <span className="block font-sans text-[10px] tracking-[0.25em] uppercase text-gold/60 mb-1.5">
                  {ch.label}
                </span>
                <span className="block text-sm text-ivory/80 font-medium" style={{ direction: "ltr", unicodeBidi: "embed" }}>
                  {ch.value}
                </span>
              </a>
            );
          })}
        </motion.div>

        <motion.a
          href={t.channels[0].href}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="group inline-flex items-center gap-3 px-12 py-4 bg-gradient-to-br from-gold/80 to-gold text-obsidian font-sans text-sm tracking-[0.25em] uppercase transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(200,150,60,0.28)]"
          style={{ clipPath: "polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)" }}
        >
          <span>{t.cta}</span>
          {lang === "ar" ? (
            <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
          ) : (
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          )}
        </motion.a>

        {/* ticket form */}
        <div className="mt-20 pt-16 border-t border-ivory/5">
          <p className="text-ivory/30 text-sm tracking-[0.2em] uppercase mb-8">{t.formTitle}</p>

          <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            onSubmit={handleSubmit}
            className="max-w-xl mx-auto space-y-5"
          >
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-ivory/30 mb-2">{t.name}</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`w-full bg-ivory/5 border px-4 py-3 text-ivory text-sm outline-none transition-colors placeholder:text-ivory/20 ${
                  errors.name ? "border-red-400/50" : "border-ivory/10 focus:border-gold/50"
                }`}
                placeholder={lang === "en" ? "Your name" : "اسمك"}
              />
              {errors.name && <p className="text-[10px] text-red-400/70 mt-1">{errors.name}</p>}
            </div>

            {/* preferred contact selector */}
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-ivory/30 mb-3">{t.preferredContact}</label>
              <div className="flex gap-3">
                {(["whatsapp", "email"] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPreferredContact(m)}
                    className={`flex-1 py-2.5 text-xs tracking-wider uppercase border transition-all ${
                      preferredContact === m
                        ? "border-gold/50 bg-gold/10 text-gold"
                        : "border-ivory/10 text-ivory/40 hover:border-ivory/30"
                    }`}
                  >
                    {m === "whatsapp" ? t.contactWhatsapp : t.contactEmail}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-ivory/30 mb-2">{t.phone}</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={`w-full bg-ivory/5 border px-4 py-3 text-ivory text-sm outline-none transition-colors placeholder:text-ivory/20 ${
                  errors.phone ? "border-red-400/50" : "border-ivory/10 focus:border-gold/50"
                }`}
                placeholder={lang === "en" ? "01X-XXXX-XXXX " : " 01X-XXXX-XXXX "}
              />
              {errors.phone && <p className="text-[10px] text-red-400/70 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-ivory/30 mb-2">{t.email}</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`w-full bg-ivory/5 border px-4 py-3 text-ivory text-sm outline-none transition-colors placeholder:text-ivory/20 ${
                  errors.email ? "border-red-400/50" : "border-ivory/10 focus:border-gold/50"
                }`}
                placeholder={lang === "en" ? "your@email.com" : "بريدك@ example.com"}
              />
              {errors.email && <p className="text-[10px] text-red-400/70 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-ivory/30 mb-2">{t.message}</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className={`w-full bg-ivory/5 border px-4 py-3 text-ivory text-sm outline-none transition-colors resize-none placeholder:text-ivory/20 ${
                  errors.message ? "border-red-400/50" : "border-ivory/10 focus:border-gold/50"
                }`}
                placeholder={lang === "en" ? "Tell us about your project..." : "أخبرنا عن مشروعك..."}
              />
              {errors.message && <p className="text-[10px] text-red-400/70 mt-1">{errors.message}</p>}
            </div>

            <motion.button
              type="submit"
              disabled={sending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gold text-obsidian font-semibold text-sm tracking-[0.15em] uppercase hover:bg-gold/90 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {sending ? (lang === "en" ? "Sending..." : "جار الإرسال...") : t.submit}
            </motion.button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
