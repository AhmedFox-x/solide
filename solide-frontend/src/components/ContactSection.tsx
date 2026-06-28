import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Phone, Globe, MapPin, ArrowRight, ArrowLeft, Send, Upload, Check } from "lucide-react";
import { translations } from "../lib/translations";
import type { Lang } from "../lib/translations";
import { ticketsApi } from "../lib/api";
import toast from "react-hot-toast";

interface Props {
  lang: Lang;
  orderProject?: { id: string; title: string; images: string[] } | null;
}

const iconMap: Record<string, React.ElementType> = {
  MessageCircle, Phone, Globe, MapPin,
};
const EG_PHONE = /^01[0-25][0-9]{8}$/;

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export default function ContactSection({ lang, orderProject }: Props) {
  const t = translations.contact[lang];
  const projectTypes = translations.projectTypes[lang];
  const initialMessage = orderProject
    ? (lang === 'en'
      ? `I'd like to order this design:\n\nProject: ${orderProject.title}\nID: ${orderProject.id}${orderProject.images[0] ? `\nImage: ${orderProject.images[0]}` : ''}\n\nPlease contact me with more details.`
      : `أريد طلب هذا التصميم:\n\nالمشروع: ${orderProject.title}\nالرقم: ${orderProject.id}${orderProject.images[0] ? `\nصورة: ${orderProject.images[0]}` : ''}\n\nيرجى التواصل معي للتفاصيل.`)
    : "";

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [selectedType, setSelectedType] = useState<string>("");
  const [dimensions, setDimensions] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState(orderProject?.title ? `طلب ${orderProject.title}` : "");
  const [phone, setPhone] = useState("");
  const [preferredContact, setPreferredContact] = useState<"whatsapp" | "email">("whatsapp");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const next = () => { setDir(1); setStep(s => Math.min(s + 1, 2)) };
  const prev = () => { setDir(-1); setStep(s => Math.max(s - 1, 0)) };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (step === 0 && !selectedType) errs.type = lang === "en" ? "Please select a project type" : "اختر نوع العمل";
    if (step === 2) {
      if (!name.trim()) errs.name = lang === "en" ? "Name is required" : "الاسم مطلوب";
      const clean = phone.replace(/\s/g, "");
      if (!clean) errs.phone = lang === "en" ? "Phone is required" : "رقم الهاتف مطلوب";
      else if (!EG_PHONE.test(clean)) errs.phone = lang === "en" ? "Enter a valid Egyptian phone number" : "أدخل رقم مصري صحيح";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    next();
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSending(true);
    try {
      const message = orderProject
        ? initialMessage
        : (lang === 'en'
          ? `Project type: ${selectedType}\nDimensions: ${dimensions || 'N/A'}\n\nName: ${name}\nPhone: ${phone}`
          : `نوع العمل: ${selectedType}\nالأبعاد: ${dimensions || 'لا يوجد'}\n\nالاسم: ${name}\nرقم الهاتف: ${phone}`);
      await ticketsApi.create({
        name, email: preferredContact === 'email' ? name : '', phone,
        subject: `Contact from ${name}`,
        message,
        preferredContact,
      });
      setDone(true);
      toast.success(t.success);
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

        <motion.button
          onClick={() => document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" })}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="group inline-flex items-center gap-3 px-12 py-4 bg-gradient-to-br from-gold/80 to-gold text-obsidian font-sans text-sm tracking-[0.25em] uppercase transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(200,150,60,0.28)] cursor-pointer"
          style={{ clipPath: "polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)" }}
        >
          <span>{t.cta}</span>
          {lang === "ar" ? (
            <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
          ) : (
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          )}
        </motion.button>

        {/* wizard form */}
        <div id="contact-form" className="mt-20 pt-16 border-t border-ivory/5">
          <p className="text-ivory/30 text-sm tracking-[0.2em] uppercase mb-8">
            {done ? (lang === 'en' ? 'Message Sent' : 'تم الإرسال') : t.formTitle}
          </p>

          {!done ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-xl mx-auto"
            >
              {/* step indicators */}
              <div className="flex items-center justify-center gap-2 mb-10">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all duration-300 ${
                      step === i ? 'bg-gold text-obsidian' : step > i ? 'bg-gold/30 text-obsidian' : 'bg-ivory/5 text-ivory/30 border border-ivory/10'
                    }`}>
                      {step > i ? <Check className="w-4 h-4" /> : i + 1}
                    </div>
                    {i < 2 && <div className={`w-8 md:w-12 h-[1px] ${step > i ? 'bg-gold/50' : 'bg-ivory/10'}`} />}
                  </div>
                ))}
              </div>

              {/* step titles */}
              <p className="text-xs tracking-[0.2em] uppercase text-ivory/40 mb-8">
                {step === 0 ? (lang === 'en' ? 'Choose project type' : 'اختر نوع العمل') :
                 step === 1 ? (lang === 'en' ? 'Project details (optional)' : 'تفاصيل المشروع (اختياري)') :
                 (lang === 'en' ? 'Your contact info' : 'معلومات التواصل')}
              </p>

              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={step}
                  custom={dir}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                  className="text-right"
                  style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}
                >
                  {/* Step 1: Project type */}
                  {step === 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {projectTypes.map(ty => (
                        <button key={ty} type="button" onClick={() => { setSelectedType(ty); setErrors({}) }}
                          className={`p-4 text-xs tracking-wider border transition-all duration-200 ${
                            selectedType === ty
                              ? 'border-gold/60 bg-gold/10 text-gold'
                              : 'border-ivory/10 text-ivory/50 hover:border-ivory/30 hover:text-ivory/70'
                          }`}
                        >
                          {ty}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Step 2: Dimensions + file upload */}
                  {step === 1 && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs tracking-[0.15em] uppercase text-ivory/30 mb-2 text-left" style={{ direction: 'ltr' }}>
                          {lang === 'en' ? 'Approximate dimensions' : 'الأبعاد التقريبية'}
                          <span className="text-ivory/15 text-[10px] mr-2">({lang === 'en' ? 'optional' : 'اختياري'})</span>
                        </label>
                        <input value={dimensions} onChange={(e) => setDimensions(e.target.value)}
                          className="w-full bg-ivory/5 border border-ivory/10 px-4 py-3 text-ivory text-sm outline-none transition-colors placeholder:text-ivory/20 focus:border-gold/50"
                          placeholder={lang === 'en' ? 'e.g. 2m x 1.5m' : 'مثلاً: ٢م × ١.٥م'}
                        />
                      </div>

                      <div>
                        <label className="block text-xs tracking-[0.15em] uppercase text-ivory/30 mb-2 text-left" style={{ direction: 'ltr' }}>
                          {lang === 'en' ? 'Upload a sketch or reference image' : 'ارفع صورة أو رسمة توضيحية'}
                          <span className="text-ivory/15 text-[10px] mr-2">({lang === 'en' ? 'optional' : 'اختياري'})</span>
                        </label>
                        <label className="flex items-center justify-center gap-3 w-full p-6 border border-dashed border-ivory/10 bg-ivory/[0.015] cursor-pointer hover:border-gold/30 transition-colors">
                          <input type="file" accept="image/*" className="hidden"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                          />
                          <Upload className="w-5 h-5 text-gold/50" />
                          <span className="text-xs text-ivory/40">
                            {file ? file.name : (lang === 'en' ? 'Click to upload' : 'اضغط لرفع صورة')}
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Name + phone + submit */}
                  {step === 2 && (
                    <div className="space-y-5 text-left" style={{ direction: 'ltr' }}>
                      <div>
                        <label className="block text-xs tracking-[0.15em] uppercase text-ivory/30 mb-2">{t.name}</label>
                        <input required value={name} onChange={(e) => setName(e.target.value)}
                          className={`w-full bg-ivory/5 border px-4 py-3 text-ivory text-sm outline-none transition-colors placeholder:text-ivory/20 ${
                            errors.name ? "border-red-400/50" : "border-ivory/10 focus:border-gold/50"
                          }`}
                          placeholder={lang === "en" ? "Your name" : "اسمك"}
                        />
                        {errors.name && <p className="text-[10px] text-red-400/70 mt-1">{errors.name}</p>}
                      </div>

                      <div>
                        <label className="block text-xs tracking-[0.15em] uppercase text-ivory/30 mb-3">{t.preferredContact}</label>
                        <div className="flex gap-3">
                          {(["whatsapp", "email"] as const).map(m => (
                            <button key={m} type="button" onClick={() => setPreferredContact(m)}
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
                        <input value={phone} onChange={(e) => setPhone(e.target.value)}
                          className={`w-full bg-ivory/5 border px-4 py-3 text-ivory text-sm outline-none transition-colors placeholder:text-ivory/20 ${
                            errors.phone ? "border-red-400/50" : "border-ivory/10 focus:border-gold/50"
                          }`}
                          placeholder={lang === "en" ? "01X-XXXX-XXXX " : " 01X-XXXX-XXXX "}
                        />
                        {errors.phone && <p className="text-[10px] text-red-400/70 mt-1">{errors.phone}</p>}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* navigation buttons */}
              <div className={`flex gap-3 mt-8 ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
                {step > 0 && (
                  <button onClick={prev}
                    className="flex-1 py-3 border border-ivory/10 text-ivory/50 text-xs tracking-[0.15em] uppercase hover:border-ivory/30 transition-all"
                  >
                    {lang === 'ar' ? 'السابق' : 'Back'}
                  </button>
                )}
                {step < 2 ? (
                  <button onClick={handleNext}
                    className="flex-1 py-3 bg-gold text-obsidian text-xs tracking-[0.15em] uppercase font-semibold hover:bg-gold/90 transition-all"
                  >
                    {lang === 'ar' ? 'التالي' : 'Next'}
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={sending}
                    className="flex-1 py-3 bg-gold text-obsidian text-xs tracking-[0.15em] uppercase font-semibold hover:bg-gold/90 transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {sending ? (lang === "en" ? "Sending..." : "جار الإرسال...") : t.submit}
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto py-12"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/20 flex items-center justify-center">
                <Check className="w-8 h-8 text-gold" />
              </div>
              <p className="text-ivory/60 text-sm">
                {lang === 'en' ? 'We will contact you shortly.' : 'سنقوم بالتواصل معك قريباً.'}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}