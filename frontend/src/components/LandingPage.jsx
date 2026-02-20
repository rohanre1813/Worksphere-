import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

/* ── icon SVGs (inline, no deps) ─────────────────────── */
const icons = {
  map: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  ),
  shield: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  megaphone: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H6.75a2.25 2.25 0 01-2.25-2.25v-1.5a2.25 2.25 0 012.25-2.25h1.5c.704 0 1.402-.03 2.09-.09m0 6.18c.348.03.7.048 1.057.048h.003c4.97 0 9-2.686 9-6s-4.03-6-9-6h-.003c-.357 0-.709.018-1.057.048m0 11.904v2.706a.75.75 0 01-1.28.53l-2.72-2.72" />
    </svg>
  ),
  chart: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  qr: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75H16.5v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75H16.5v-.75z" />
    </svg>
  ),
};

const FEATURES = [
  {
    icon: icons.map,
    title: "Real-Time Office Map",
    desc: "Track employee positions across zones with a live, animated office map.",
    color: "yellow",
  },
  {
    icon: icons.qr,
    title: "QR Zone Access",
    desc: "Employees scan QR codes to check in/out of zones instantly.",
    color: "cyan",
  },
  {
    icon: icons.megaphone,
    title: "Announcements",
    desc: "Broadcast important updates to your entire team in real time.",
    color: "yellow",
  },
  {
    icon: icons.chart,
    title: "Analytics Dashboard",
    desc: "Visualize zone usage, attendance trends, and productivity metrics.",
    color: "cyan",
  },
  {
    icon: icons.shield,
    title: "Restricted Zones",
    desc: "Control access to sensitive areas with role-based permissions.",
    color: "yellow",
  },
];

/* ── animation variants ──────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ── component ───────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative z-20 min-h-screen flex flex-col items-center px-4 py-8 md:py-16 overflow-y-auto">

      {/* ─── HERO ─────────────────────────────────────── */}
      <motion.div
        className="flex flex-col items-center text-center mt-8 md:mt-16 mb-12 md:mb-20"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Logo / Brand */}
        <motion.div variants={fadeUp} custom={0} className="mb-4">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-yellow-400/30 bg-zinc-950/60 backdrop-blur-md">
            <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.8)] animate-pulse" />
            <span className="text-yellow-400 font-mono text-sm tracking-widest uppercase">
              Worksphere
            </span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={fadeUp}
          custom={1}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight max-w-3xl"
        >
          Your Office,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
            Reimagined
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          custom={2}
          className="mt-4 md:mt-6 text-zinc-400 text-base md:text-lg lg:text-xl max-w-xl leading-relaxed"
        >
          Real-time employee tracking, zone-based access control, and smart analytics — all in one beautifully crafted platform.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={fadeUp} custom={3} className="flex gap-4 mt-8">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(250,204,21,0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/login")}
            className="px-8 py-3 rounded-xl bg-yellow-400 text-black font-bold text-sm md:text-base uppercase tracking-wider shadow-[0_0_20px_rgba(250,204,21,0.3)] transition-all"
          >
            Get Started
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(34,211,238,0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/register")}
            className="px-8 py-3 rounded-xl border border-cyan-400/50 text-cyan-400 font-bold text-sm md:text-base uppercase tracking-wider hover:bg-cyan-400/10 transition-all"
          >
            Register
          </motion.button>
        </motion.div>
      </motion.div>

      {/* ─── FEATURES ─────────────────────────────────── */}
      <motion.div
        className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        {FEATURES.map((feat, i) => (
          <motion.div
            key={feat.title}
            variants={fadeUp}
            custom={i}
            whileHover={{ y: -6, scale: 1.02 }}
            className={`group relative p-5 md:p-6 rounded-2xl border backdrop-blur-md transition-all cursor-default
              ${feat.color === "yellow"
                ? "border-yellow-400/20 bg-zinc-950/70 hover:border-yellow-400/50 hover:shadow-[0_0_30px_rgba(250,204,21,0.15)]"
                : "border-cyan-400/20 bg-zinc-950/70 hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]"
              }`}
          >
            {/* Icon */}
            <div
              className={`mb-3 ${feat.color === "yellow" ? "text-yellow-400" : "text-cyan-400"
                }`}
            >
              {feat.icon}
            </div>

            {/* Title */}
            <h3 className="text-white font-bold text-base md:text-lg mb-1">
              {feat.title}
            </h3>

            {/* Description */}
            <p className="text-zinc-400 text-sm leading-relaxed">
              {feat.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* ─── BOTTOM CTA ───────────────────────────────── */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <p className="text-zinc-500 text-sm mb-4">
          Ready to transform your workspace?
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/login")}
          className="px-10 py-3 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold uppercase tracking-wider shadow-[0_0_30px_rgba(250,204,21,0.3)]"
        >
          Launch Worksphere →
        </motion.button>
      </motion.div>

      {/* ─── FOOTER ───────────────────────────────────── */}
      <div className="text-zinc-600 text-xs font-mono pb-4">
        © 2026 Worksphere — Built with ⚡
      </div>
    </div>
  );
}
