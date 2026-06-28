import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Phone, Globe, MapPin, ArrowRight, ArrowLeft, Send, Check, ImagePlus } from "lucide-react";
import { translations } from "../lib/translations";
import type { Lang } from "../lib/translations";
import { ticketsApi } from "../lib/api";
import type { OrderProject } from "../lib/api";
import toast from "react-hot-toast";

interface Props {
  lang: Lang;
  orderProject?: OrderProject | null;
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
  const baseTypes = translations.projectTypes[lang];
  const projectTypes = [...baseTypes, lang === 'en' ? 'Other' : 'أخرى'];
  const [step, setStep] = useState(orderProject ? 1 : 0);
  const [dir, setDir] = useState(1);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(orderProject?.type ? [orderProject.type] : []);
  interface DimItem { id: number; name: string; length: string; width: string; height: string; unit: string }
  const initialDimName = orderProject?.type || "";
  const [dimItems, setDimItems] = useState<DimItem[]>([{ id: 1, name: initialDimName, length: "", width: "", height: "", unit: "m" }]);
  const dimIdRef = useRef(1);
  const addDimItem = useCallback(() => {
    dimIdRef.current += 1;
    setDimItems(prev => [...prev, { id: dimIdRef.current, name: "", length: "", width: "", height: "", unit: "m" }]);
  }, []);
  const removeDimItem = useCallback((id: number) => {
    setDimItems(prev => prev.filter(i => i.id !== id));
  }, []);
  const updateDimItem = useCallback((id: number, field: keyof DimItem, value: string) => {
    setDimItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  }, []);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [preferredContact, setPreferredContact] = useState<"whatsapp" | "email">("whatsapp");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const next = () => { setDir(1); setStep(s => Math.min(s + 1, 2)) };
  const prev = () => { setDir(-1); setStep(s => Math.max(s - 1, orderProject ? 1 : 0)) };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!orderProject && step === 0 && selectedTypes.length === 0) {
      errs.type = lang === "en" ? "Please select at least one project type" : "اختر نوع عمل واحد على الأقل";
    }
    if (step === (orderProject ? 1 : 2)) {
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
      const msgParts: string[] = []
      if (orderProject) {
        msgParts.push(lang === 'en'
          ? `ORDER: ${orderProject.title}`
          : `طلب: ${orderProject.title}`);
        msgParts.push(`ID: ${orderProject.id}`);
        if (orderProject.category) msgParts.push(`Category: ${orderProject.category}`);
        if (orderProject.description) msgParts.push(`Description: ${orderProject.description}`);
        if (orderProject.images.length > 0) {
          msgParts.push(`---`);
          msgParts.push(lang === 'en' ? 'Project images:' : 'صور المشروع:');
          orderProject.images.forEach(img => msgParts.push(img));
        }
      } else {
        msgParts.push(`${lang === 'en' ? 'Types' : 'أنواع العمل'}: ${selectedTypes.join(' + ')}`);
      }
      const filledItems = dimItems.filter(i => i.name || i.length || i.width || i.height)
      if (filledItems.length > 0) {
        msgParts.push(`--- ${lang === 'en' ? 'Work Items' : 'بنود العمل'} ---`);
        filledItems.forEach((item, idx) => {
          const dimParts: string[] = []
          if (item.length) dimParts.push(`${item.length}${item.unit}`)
          if (item.width) dimParts.push(`${item.width}${item.unit}`)
          if (item.height) dimParts.push(`${item.height}${item.unit}`)
          msgParts.push(`${idx + 1}. ${item.name || (lang === 'en' ? `Item ${idx + 1}` : `بند ${idx + 1}`)}${dimParts.length ? ` — ${dimParts.join(' × ')}` : ''}`)
        })
      }
      if (message) msgParts.push(`${lang === 'en' ? 'Message' : 'الرسالة'}: ${message}`);
      if (file) msgParts.push(`${lang === 'en' ? 'Attached file' : 'ملف مرفق'}: ${file.name}`);
      msgParts.push(`---`);
      msgParts.push(`${lang === 'en' ? 'Name' : 'الاسم'}: ${name}`);
      msgParts.push(`${lang === 'en' ? 'Phone' : 'الهاتف'}: ${phone}`);

      await ticketsApi.create({
        name, email: preferredContact === 'email' ? email : '', phone,
        subject: `Order from ${name}${orderProject ? ` - ${orderProject.title}` : ''}`,
        message: msgParts.join('\n'),
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

  const steps = orderProject ? [1, 2] : [0, 1, 2];
  const stepIndex = steps.indexOf(step);

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

        {!orderProject && (
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
        )}

        {!orderProject && (
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
        )}

        {/* wizard form */}
        <div id="contact-form" className={`${orderProject ? 'mt-0' : 'mt-20'} pt-16 border-t border-ivory/5`} style={{ scrollMarginTop: 100 }}>
          <p className="text-ivory/30 text-sm tracking-[0.2em] uppercase mb-8">
            {done ? (lang === 'en' ? 'Message Sent' : 'تم الإرسال') : t.formTitle}
          </p>

          {/* order guide */}
          {orderProject && !done && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl mx-auto mb-8 p-4 border border-gold/20 bg-gold/[0.03]"
            >
              <p className="text-xs text-gold/70 leading-relaxed">
                {lang === 'en'
                  ? `You are ordering: "${orderProject.title}". Fill in your details below and we will contact you to complete the implementation.`
                  : `أنت بصدد تنفيذ: "${orderProject.title}". قم بإدخال بياناتك وسنقوم بالتواصل معك لإتمام التنفيذ.`}
              </p>
            </motion.div>
          )}

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
                {steps.map((i, idx) => (
                  <div key={i} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all duration-300 ${
                      stepIndex === idx ? 'bg-gold text-obsidian' : stepIndex > idx ? 'bg-gold/30 text-obsidian' : 'bg-ivory/5 text-ivory/30 border border-ivory/10'
                    }`}>
                      {stepIndex > idx ? <Check className="w-4 h-4" /> : idx + 1}
                    </div>
                    {idx < steps.length - 1 && <div className={`w-8 md:w-12 h-[1px] ${stepIndex > idx ? 'bg-gold/50' : 'bg-ivory/10'}`} />}
                  </div>
                ))}
              </div>

              {/* step titles */}
              <p className="text-xs tracking-[0.2em] uppercase text-ivory/40 mb-8">
                {!orderProject && step === 0 ? (lang === 'en' ? 'Choose project type' : 'اختر نوع العمل') :
                 step === (orderProject ? 1 : 1) ? (lang === 'en' ? 'Project details (optional)' : 'تفاصيل المشروع (اختياري)') :
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
                  {/* Step 0: Project type (only when NOT ordering from project) */}
                  {step === 0 && !orderProject && (
                    <div className="grid grid-cols-2 gap-3">
                      {projectTypes.map(ty => {
                        const active = selectedTypes.includes(ty)
                        return (
                          <button key={ty} type="button" onClick={() => {
                            if (active) {
                              setSelectedTypes(prev => prev.filter(t => t !== ty))
                              setDimItems(prev => prev.filter(i => i.name !== ty))
                            } else {
                              setSelectedTypes(prev => [...prev, ty])
                              dimIdRef.current += 1
                              setDimItems(prev => [...prev, { id: dimIdRef.current, name: ty, length: "", width: "", height: "", unit: "m" }])
                            }
                            setErrors({})
                          }}
                            className={`p-4 text-xs tracking-wider border transition-all duration-200 ${
                              active
                                ? 'border-gold/60 bg-gold/10 text-gold'
                                : 'border-ivory/10 text-ivory/50 hover:border-ivory/30 hover:text-ivory/70'
                            }`}
                          >
                            {ty}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Step 1: Work items + dimensions (optional) */}
                  {step === (orderProject ? 1 : 1) && (
                    <div className="space-y-5">
                      <div className="text-left">
                        <label className="block text-xs tracking-[0.15em] uppercase text-ivory/30 mb-2">
                          {lang === 'en' ? 'Work Items & Dimensions' : 'بنود العمل والأبعاد'}
                          <span className="text-ivory/15 text-[10px] mr-2">({lang === 'en' ? 'optional' : 'اختياري'})</span>
                        </label>
                        <p className="text-[10px] text-ivory/20 mb-4 leading-relaxed">
                          {lang === 'en'
                            ? 'Add each item you want us to implement (e.g. main gate, window grill, stair railing) with its dimensions.'
                            : 'أضف كل بند تريد تنفيذه (مثل بوابة رئيسية، شباك حماية، درابزين سلم) مع أبعاده.'}
                        </p>

                        {dimItems.map((item, idx) => (
                          <div key={item.id} className="mb-4 p-4 border border-ivory/5 bg-ivory/[0.01]">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-[10px] tracking-[0.15em] uppercase text-ivory/20">
                                {lang === 'en' ? `Item ${idx + 1}` : `البند ${idx + 1}`}
                              </span>
                              {dimItems.length > 1 && (
                                <button type="button" onClick={() => removeDimItem(item.id)}
                                  className="text-[10px] text-red-400/40 hover:text-red-400/70 uppercase tracking-wider transition-colors"
                                >
                                  {lang === 'en' ? 'Remove' : 'حذف'}
                                </button>
                              )}
                            </div>

                            <div className="mb-3">
                              <label className="block text-[9px] tracking-[0.2em] uppercase text-ivory/20 mb-1">
                                {lang === 'en' ? 'Item name' : 'اسم البند'}
                              </label>
                              <input value={item.name} onChange={(e) => updateDimItem(item.id, 'name', e.target.value)}
                                className="w-full bg-ivory/5 border border-ivory/10 px-3 py-2 text-ivory text-sm outline-none transition-colors placeholder:text-ivory/20 focus:border-gold/50"
                                placeholder={lang === 'en' ? 'e.g. Main entrance gate' : 'مثال: بوابة رئيسية'}
                              />
                            </div>

                            <div className="flex items-end gap-2">
                              <div className="flex-1">
                                <label className="block text-[9px] tracking-[0.2em] uppercase text-ivory/20 mb-1">{lang === 'en' ? 'Length' : 'الطول'}</label>
                                <input value={item.length} onChange={(e) => updateDimItem(item.id, 'length', e.target.value)}
                                  className="w-full bg-ivory/5 border border-ivory/10 px-2 py-2 text-ivory text-sm outline-none transition-colors placeholder:text-ivory/20 focus:border-gold/50 text-left"
                                  placeholder="0"
                                  style={{ direction: 'ltr' }}
                                />
                              </div>
                              <span className="text-ivory/15 text-xs pb-2">×</span>
                              <div className="flex-1">
                                <label className="block text-[9px] tracking-[0.2em] uppercase text-ivory/20 mb-1">{lang === 'en' ? 'Width' : 'العرض'}</label>
                                <input value={item.width} onChange={(e) => updateDimItem(item.id, 'width', e.target.value)}
                                  className="w-full bg-ivory/5 border border-ivory/10 px-2 py-2 text-ivory text-sm outline-none transition-colors placeholder:text-ivory/20 focus:border-gold/50 text-left"
                                  placeholder="0"
                                  style={{ direction: 'ltr' }}
                                />
                              </div>
                              <span className="text-ivory/15 text-xs pb-2">×</span>
                              <div className="flex-1">
                                <label className="block text-[9px] tracking-[0.2em] uppercase text-ivory/20 mb-1">{lang === 'en' ? 'Height' : 'الارتفاع'}</label>
                                <input value={item.height} onChange={(e) => updateDimItem(item.id, 'height', e.target.value)}
                                  className="w-full bg-ivory/5 border border-ivory/10 px-2 py-2 text-ivory text-sm outline-none transition-colors placeholder:text-ivory/20 focus:border-gold/50 text-left"
                                  placeholder="0"
                                  style={{ direction: 'ltr' }}
                                />
                              </div>
                              <div className="flex-shrink-0 pb-2">
                                <select value={item.unit} onChange={(e) => updateDimItem(item.id, 'unit', e.target.value)}
                                  className="bg-ivory/5 border border-ivory/10 px-1.5 py-2 text-ivory text-xs outline-none transition-colors focus:border-gold/50"
                                  style={{ direction: 'ltr' }}
                                >
                                  <option value="m">m</option>
                                  <option value="cm">cm</option>
                                  <option value="mm">mm</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}

                        <button type="button" onClick={addDimItem}
                          className="w-full py-3 border border-dashed border-ivory/10 text-ivory/30 text-xs tracking-[0.15em] uppercase hover:border-gold/30 hover:text-gold/50 transition-all"
                        >
                          + {lang === 'en' ? 'Add another item' : 'أضف بند آخر'}
                        </button>

                        {/* reference image upload */}
                        <div className="mt-6 pt-6 border-t border-ivory/5">
                          <label className="block text-xs tracking-[0.15em] uppercase text-ivory/30 mb-2 text-left" style={{ direction: 'ltr' }}>
                            {lang === 'en' ? 'Upload reference image' : 'ارفع صورة للتصميم المطلوب'}
                            <span className="text-ivory/15 text-[10px] mr-2">({lang === 'en' ? 'optional' : 'اختياري'})</span>
                          </label>
                          <p className="text-[10px] text-ivory/20 mb-3 leading-relaxed text-left">
                            {lang === 'en'
                              ? 'Upload a photo of the desired design or the execution location so our sales team can understand your request before contacting you.'
                              : 'ارفع صورة للتصميم المطلوب أو لمكان التنفيذ عشان فريق المبيعات يفهم طلبك بالظبط قبل ما يكلموك.'}
                          </p>
                          <label className="flex items-center justify-center gap-3 w-full p-4 border border-dashed border-ivory/10 bg-ivory/[0.015] cursor-pointer hover:border-gold/30 transition-colors">
                            <input type="file" accept="image/*" className="hidden"
                              onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                            <ImagePlus className="w-5 h-5 text-gold/50" />
                            <span className="text-xs text-ivory/40">
                              {file ? file.name : (lang === 'en' ? 'Click to upload' : 'اضغط لاختيار صورة')}
                            </span>
                          </label>
                        </div>

                        {/* additional notes */}
                        <div className="mt-5">
                          <label className="block text-xs tracking-[0.15em] uppercase text-ivory/30 mb-2 text-left" style={{ direction: 'ltr' }}>
                            {lang === 'en' ? 'Additional specifications' : 'أي تفاصيل أو مواصفات أخرى تود إضافتها؟'}
                            <span className="text-ivory/15 text-[10px] mr-2">({lang === 'en' ? 'optional' : 'اختياري'})</span>
                          </label>
                          <p className="text-[10px] text-ivory/20 mb-3 leading-relaxed text-left">
                            {lang === 'en'
                              ? 'e.g. electrostatic paint, moisture-resistant, motorized opening, curved design, specific material...'
                              : 'مثال: دهان إلكتروستاتيك مقاوم للرطوبة، دوران مش مستقيم، فتح بمحرك تلقائي، خامة معينة...'}
                          </p>
                          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3}
                            className="w-full bg-ivory/5 border border-ivory/10 px-4 py-3 text-ivory text-sm outline-none transition-colors placeholder:text-ivory/20 focus:border-gold/50 resize-none"
                            placeholder={lang === 'en' ? 'Any other details or specifications...' : 'أي تفاصيل أو مواصفات أخرى...'}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Name + phone + message + submit */}
                  {step === (orderProject ? 1 : 2) && (
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

                      {preferredContact === 'email' && (
                        <div>
                          <label className="block text-xs tracking-[0.15em] uppercase text-ivory/30 mb-2">{t.email}</label>
                          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-ivory/5 border border-ivory/10 px-4 py-3 text-ivory text-sm outline-none transition-colors placeholder:text-ivory/20 focus:border-gold/50"
                            placeholder={lang === "en" ? "your@email.com" : "بريدك الإلكتروني"}
                          />
                        </div>
                      )}

                      
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* navigation buttons */}
              <div className={`flex gap-3 mt-8 ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
                {step > (orderProject ? 1 : 0) && (
                  <button onClick={prev}
                    className="flex-1 py-3 border border-ivory/10 text-ivory/50 text-xs tracking-[0.15em] uppercase hover:border-ivory/30 transition-all"
                  >
                    {lang === 'ar' ? 'السابق' : 'Back'}
                  </button>
                )}
                {step < (orderProject ? 1 : 2) ? (
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
                    {sending ? (lang === "en" ? "Sending..." : "جار الإرسال...") : (orderProject ? (lang === 'en' ? 'Send Order' : 'إرسال الطلب') : t.submit)}
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
              {orderProject ? (
                <div>
                  <p className="text-ivory/80 text-sm font-serif mb-3">
                    {lang === 'en'
                      ? `Your order for "${orderProject.title}" has been received.`
                      : `تم استلام طلبك لتنفيذ "${orderProject.title}".`}
                  </p>
                  <p className="text-ivory/50 text-xs">
                    {lang === 'en'
                      ? 'We will contact you within 24 hours to start the implementation.'
                      : 'سنتواصل معك خلال ٢٤ ساعة لبدء التنفيذ.'}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-ivory/60 text-sm">
                    {lang === 'en' ? 'We will contact you shortly.' : 'سنقوم بالتواصل معك قريباً.'}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}