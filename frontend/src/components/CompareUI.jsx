import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const CompareUI = () => {
  const [showTracksta, setShowTracksta] = useState(true);

  const pros = [
    "Unified workspace & login",
    "Role-based access",
    "Automations & SLAs",
    "Visual pipelines",
    "Analytics & forecasting",
  ];

  const cons = [
    "Manual handoffs",
    "Scattered tools",
    "Email clutter",
    "No real-time updates",
    "No client transparency",
  ];

  return (
    <section id="compare" className="relative bg-gray-950 py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-white"
        >
          Why <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Tracksta</span> Outshines Everything Else
        </motion.h2>

        {/* toggle switch */}
        <div className="flex justify-center items-center gap-4 mt-10 mb-8">
          <button
            onClick={() => setShowTracksta(true)}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
              showTracksta ? "bg-emerald-600 text-white" : "bg-gray-800 text-gray-400"
            }`}
          >
            Tracksta
          </button>
          <button
            onClick={() => setShowTracksta(false)}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
              !showTracksta ? "bg-emerald-600 text-white" : "bg-gray-800 text-gray-400"
            }`}
          >
            Fragmented Stack
          </button>
        </div>

        {/* comparison cards */}
        <motion.div
          key={showTracksta ? "tracksta" : "fragmented"}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl bg-gray-900/50 p-10 rounded-2xl border border-white/10 backdrop-blur-xl"
        >
          {showTracksta ? (
            <ul className="space-y-3 text-left">
              {pros.map((p, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-200">
                  <CheckCircle2 className="text-emerald-400 w-5 h-5 mt-1" /> {p}
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-3 text-left">
              {cons.map((c, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-400">
                  <Shield className="text-red-400 w-4 h-4 mt-1" /> {c}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-emerald-400 hover:underline">
              Log in & Explore <Sparkles className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CompareUI;
