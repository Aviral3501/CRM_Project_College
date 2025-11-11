import React, { useState } from "react";
import { motion } from "framer-motion";
import { Layers, ListTodo, LayoutGrid, Inbox, Handshake, BarChart3, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const imageSources = {
  bentoLeads: "/assets/bento/leads.png",
  bentoPipeline: "/assets/bento/pipeline.png",
  bentoClients: "/assets/bento/clients.png",
  bentoAnalytics: "/assets/bento/analytics.png",
};

const tiles = [
  {
    key: "leads",
    title: "Leads",
    icon: <Inbox className="w-5 h-5 text-emerald-400" />,
    img: imageSources.bentoLeads,
    desc: "Capture leads, qualify in seconds, and handoff seamlessly.",
  },
  {
    key: "pipeline",
    title: "Pipeline",
    icon: <Layers className="w-5 h-5 text-emerald-400" />,
    img: imageSources.bentoPipeline,
    desc: "Visualize deals as they move from hot to won — in real time.",
  },
  {
    key: "clients",
    title: "Clients",
    icon: <Handshake className="w-5 h-5 text-emerald-400" />,
    img: imageSources.bentoClients,
    desc: "One truth for every client — notes, billing, and contracts.",
  },
  {
    key: "analytics",
    title: "Analytics",
    icon: <BarChart3 className="w-5 h-5 text-emerald-400" />,
    img: imageSources.bentoAnalytics,
    desc: "Instant trends, team performance, and revenue forecasts.",
  },
];

const BentoGrid = () => {
  const [hovered, setHovered] = useState(null);

  return (
    <section id="bento" className="relative bg-gray-950 py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-white text-center"
        >
          Your <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Command Center</span> for Everything
        </motion.h2>
        <p className="text-gray-400 text-center mt-3 mb-12">
          The Bento Workspace adapts to your needs — from CRM to team management.
        </p>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 perspective-1000">
          {tiles.map((tile, i) => (
            <motion.div
              key={tile.key}
              onMouseEnter={() => setHovered(tile.key)}
              onMouseLeave={() => setHovered(null)}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className={`relative bg-gray-900/40 border border-white/10 rounded-2xl p-6 text-white cursor-pointer group hover:shadow-lg hover:shadow-emerald-500/10 transition-transform ${
                hovered === tile.key ? "scale-[1.03] rotate-[0.5deg]" : "scale-[1]"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-emerald-500/10">{tile.icon}</div>
                <h3 className="font-semibold text-lg">{tile.title}</h3>
              </div>

              <p className="text-gray-400 text-sm mb-4">{tile.desc}</p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: hovered === tile.key ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-2xl"
              />

              <Link to="/login" className="text-emerald-400 text-sm hover:underline flex items-center gap-1">
                Open {tile.title} <ChevronRight className="w-3 h-3" />
              </Link>

              <motion.div
                animate={{ rotateY: hovered === tile.key ? 15 : 0 }}
                transition={{ type: "spring", stiffness: 80 }}
                className="absolute bottom-2 right-2 w-24 h-16 rounded-md bg-gradient-to-t from-gray-800 to-gray-700 opacity-50 blur-sm"
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* floating fun easter eggs */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-4 h-4 rounded-full bg-emerald-500/40 blur-sm"
          initial={{ x: Math.random() * 1000, y: Math.random() * 500 }}
          animate={{
            x: [Math.random() * 1000, Math.random() * 1000],
            y: [Math.random() * 500, Math.random() * 500],
          }}
          transition={{ duration: 8 + Math.random() * 6, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </section>
  );
};

export default BentoGrid;
