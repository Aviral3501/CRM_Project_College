import React from "react";
import { motion } from "framer-motion";
import { Users, Workflow, BarChart3, ShieldCheck, LineChart, TimerReset, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import FlippingWords from "./FlippingWords";

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay },
  },
});

const Features = () => {
  const features = [
    {
      icon: <Users className="h-6 w-6 text-emerald-400" />,
      title: "Collaborative Teams",
      desc: "Centralize team communication with mentions, comments & real-time updates.",
    },
    {
      icon: <Workflow className="h-6 w-6 text-emerald-400" />,
      title: "Workflow Automation",
      desc: "Reduce manual work with AI-triggered pipelines and SLA-based tasks.",
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-emerald-400" />,
      title: "Pipeline & Analytics",
      desc: "Get visibility into deals, forecasts, and team performance instantly.",
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-emerald-400" />,
      title: "Security by Design",
      desc: "Secure by default with JWT, 2FA, and audit trails for complete control.",
    },
    {
      icon: <TimerReset className="h-6 w-6 text-emerald-400" />,
      title: "Real-Time Notifications",
      desc: "Stay ahead with instant updates and live dashboards.",
    },
    {
      icon: <LineChart className="h-6 w-6 text-emerald-400" />,
      title: "Smart Insights",
      desc: "AI-driven KPIs and predictive trend analysis to make better decisions.",
    },
  ];

  return (
    <section id="features" className="py-28 bg-gray-950 relative">
      <motion.h2
        variants={fadeUp(0)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="text-4xl font-bold text-center text-white"
      >
        Everything you need to stay{" "}
        <FlippingWords words={["organized", "fast", "connected", "focused"]} />
      </motion.h2>

      <p className="text-gray-400 max-w-2xl mx-auto text-center mt-4">
        Tracksta integrates your workflows and teams with a beautiful, fast, and functional interface.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mt-16 px-6">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            variants={fadeUp(i * 0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="group bg-gray-900/40 border border-white/10 p-8 rounded-2xl backdrop-blur-xl hover:shadow-emerald-500/10 hover:shadow-xl hover:-translate-y-1 transition-transform"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 mb-5 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400/20">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-gray-400 text-sm">{feature.desc}</p>
            <div className="mt-4 flex items-center text-emerald-400">
              <ChevronRight className="w-4 h-4 mr-1" />
              <Link to="/login" className="hover:underline">
                Try it now
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Features;
