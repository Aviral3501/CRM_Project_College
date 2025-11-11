import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Users,
  Workflow,
  BarChart3,
  Zap,
  ShieldCheck,
  LineChart,
  TimerReset,
  Sparkles,
  PanelsTopLeft,
  NotebookPen,
  Building2,
  Rocket,
  Handshake,
  ListTodo,
  Inbox,
  Layers,
  LayoutGrid,
  ChevronRight,
  Star,
  Shield,
} from "lucide-react";
import BentoGrid from "../components/Bentogrid";
import OnboardingFlow from "../components/OnboardingFlow";
import CompareUI from "../components/CompareUI";

/* =========================================================
   Replace imageSources with your own later in one place
   ========================================================= */
const imageSources = {
  heroIllustration: "/assets/hero-illustration.png",
  bentoLeads: "/assets/bento/leads.png",
  bentoPipeline: "/assets/bento/pipeline.png",
  bentoQuotes: "/assets/bento/quotes.png",
  bentoClients: "/assets/bento/clients.png",
  bentoTasks: "/assets/bento/tasks.png",
  bentoAnalytics: "/assets/bento/analytics.png",
  onboardingFlow: "/assets/onboarding-flow.png",
  testimonial1: "/assets/testimonials/user-1.png",
  testimonial2: "/assets/testimonials/user-2.png",
  testimonial3: "/assets/testimonials/user-3.png",
};

/* =========================================================
   Reusable animations
   ========================================================= */
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay } },
});
const scaleIn = (delay = 0) => ({
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut", delay } },
});
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } };

/* =========================================================
   Hooks and Effects
   ========================================================= */
function useMousePosition() {
  const [pos, setPos] = useState({ x: -9999, y: -9999 });
  useEffect(() => {
    const handler = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);
  return pos;
}

/* =========================================================
   Accent Highlight Cursor
   ========================================================= */
const HighlightCursor = () => {
  const { x, y } = useMousePosition();
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1]"
      style={{
        background: `radial-gradient(200px 200px at ${x}px ${y}px, rgba(16,185,129,0.25), rgba(16,185,129,0.1) 40%, transparent 65%)`,
        transition: "background 120ms linear",
      }}
    />
  );
};

/* =========================================================
   FlippingWords — rotating words with 3D flip
   ========================================================= */
const FlippingWords = ({ words, interval = 1800, className = "" }) => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  return (
    <span className={`inline-block perspective-1000 ${className}`}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={index}
          initial={{ rotateX: 90, opacity: 0, y: -8 }}
          animate={{ rotateX: 0, opacity: 1, y: 0 }}
          exit={{ rotateX: -90, opacity: 0, y: 8 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-block origin-bottom bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

/* =========================================================
   Counter
   ========================================================= */
const Counter = ({ to, duration = 1.2, className, prefix = "", suffix = "" }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / (duration * 1000));
      setVal(Math.floor(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return (
    <span className={className}>
      {prefix}
      {val.toLocaleString()}
      {suffix}
    </span>
  );
};

/* =========================================================
   Navbar
   ========================================================= */
const NavBar = () => (
  <div className="fixed top-0 z-50 w-full">
    <div className="mx-auto max-w-7xl px-4">
      <div className="mt-4 rounded-2xl border border-white/10 bg-gray-900/40 backdrop-blur-xl shadow-lg">
        <div className="flex items-center justify-between px-5 py-3">
          <Link to="/" className="flex items-center gap-2">
            <PanelsTopLeft className="h-6 w-6 text-emerald-400" />
            <span className="font-bold text-white">Tracksta</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-300">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#bento" className="hover:text-white">Bento</a>
            <a href="#compare" className="hover:text-white">Compare</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="rounded-lg px-4 py-2 text-sm text-emerald-400 hover:bg-emerald-500/10">Log in</Link>
            <Link to="/login" className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:from-green-600 hover:to-emerald-700">Get Started</Link>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* =========================================================
   Hero Section
   ========================================================= */
const Hero = () => (
  <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-6">
    <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-900" />
    <motion.div variants={fadeUp(0.1)} initial="hidden" animate="visible" className="relative z-10 max-w-5xl">
      <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight text-white">
        A <FlippingWords words={["Smarter", "Unified", "Modern", "AI-powered"]} /> Workspace for{" "}
        <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Teams & Clients</span>
      </h1>
      <p className="text-gray-300 max-w-3xl mx-auto mb-8 text-lg">
        Tracksta transforms chaos into clarity — manage tasks, leads, sales, and onboarding from one powerful dashboard.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link to="/login" className="px-8 py-3 rounded-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg">
          Try Tracksta Free
        </Link>
        <Link to="/login" className="px-8 py-3 rounded-lg font-semibold border border-emerald-500/70 text-emerald-400 hover:bg-emerald-600/10">
          Watch Demo <ArrowRight className="inline w-4 h-4 ml-2" />
        </Link>
      </div>
    </motion.div>
    <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute bottom-10 text-emerald-400">
      ↓ Scroll to Explore
    </motion.div>
  </section>
);

/* =========================================================
   Features Section
   ========================================================= */
const Features = () => {
  const features = [
    { icon: <Users className="h-6 w-6 text-emerald-400" />, title: "Collaborative Teams", desc: "Centralize communication & roles with clarity." },
    { icon: <Workflow className="h-6 w-6 text-emerald-400" />, title: "Automation", desc: "Smart tasking and pipelines with no chaos." },
    { icon: <BarChart3 className="h-6 w-6 text-emerald-400" />, title: "Pipeline & Analytics", desc: "Leads, forecasts, and dashboards unified." },
  ];
  return (
    <section id="features" className="py-28 bg-gray-950 relative">
      <motion.h2 variants={fadeUp(0)} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-4xl font-bold text-center text-white">
        Everything you need to stay{" "}
        <FlippingWords words={["organized", "fast", "connected", "focused"]} />
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-16 px-6">
        {features.map((f, i) => (
          <motion.div key={i} variants={fadeUp(i * 0.1)} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="bg-gray-900/40 border border-white/10 p-8 rounded-2xl backdrop-blur-xl hover:shadow-emerald-500/10 hover:shadow-xl hover:-translate-y-1 transition-transform">
            <div className="inline-flex items-center justify-center w-12 h-12 mb-5 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400/20">{f.icon}</div>
            <h3 className="text-xl font-semibold text-white mb-2">{f.title}</h3>
            <p className="text-gray-400 text-sm">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

/* =========================================================
   Main Page
   ========================================================= */
const HomePage = () => (
  <div className="relative min-h-screen bg-gray-950 text-white">
    <HighlightCursor />
    <NavBar />
    <Hero />
    <Features />
    {/* Add Bento, Onboarding, Compare, Testimonials, etc. next */}
    <BentoGrid/>
    <OnboardingFlow/>
    <CompareUI/>


    {/* Fun floating sparks */}
{[...Array(6)].map((_, i) => (
  <motion.div
    key={i}
    className="fixed w-3 h-3 rounded-full bg-emerald-400/30 blur-sm"
    animate={{
      x: [Math.random() * 1000, Math.random() * 800],
      y: [Math.random() * 500, Math.random() * 600],
    }}
    transition={{ duration: 12 + i * 2, repeat: Infinity, ease: "easeInOut" }}
  />
))}

    
  </div>
);

export default HomePage;
