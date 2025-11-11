import React from "react";
import { motion } from "framer-motion";
import { Building2, Inbox, Layers, NotebookPen, Handshake, ListTodo } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  { icon: <Building2 />, title: "Setup Organization", desc: "Create your workspace and invite your team instantly." },
  { icon: <Inbox />, title: "Import Leads", desc: "Pull data from forms, sheets, or integrations in one click." },
  { icon: <Layers />, title: "Qualify Deals", desc: "Use AI to assign scores and owners automatically." },
  { icon: <NotebookPen />, title: "Send Quotes", desc: "Create professional proposals and get e-signs in minutes." },
  { icon: <Handshake />, title: "Convert Clients", desc: "Move deals into client profiles and set up billing." },
  { icon: <ListTodo />, title: "Kickoff Projects", desc: "Automate tasks, deadlines, and review cycles effortlessly." },
];

const OnboardingFlow = () => {
  return (
    <section id="onboarding" className="relative py-24 bg-gray-950 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-white text-center"
        >
          <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Streamlined Client Onboarding</span>
        </motion.h2>
        <p className="text-gray-400 text-center mt-4 max-w-2xl mx-auto">
          Each stage of your client journey — beautifully automated and visible to your whole team.
        </p>

        <div className="relative mt-16 grid md:grid-cols-3 gap-10">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="relative bg-gray-900/50 border border-white/10 p-6 rounded-2xl backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-400/20 text-emerald-400">
                  {step.icon}
                </div>
                <h3 className="text-lg font-semibold text-white">{step.title}</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">{step.desc}</p>
              <Link to="/login" className="text-sm text-emerald-400 hover:underline flex items-center gap-1">
                Continue → 
              </Link>
              {/* Animated timeline glow */}
              {i < steps.length - 1 && (
                <motion.div
                  animate={{ scaleY: [0.8, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute left-[calc(50%-1px)] top-full h-10 w-[2px] bg-gradient-to-b from-emerald-500/60 to-transparent"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* floating orb easter egg */}
      <motion.div
        className="absolute w-10 h-10 rounded-full bg-emerald-500/20 blur-xl"
        animate={{
          x: [100, 400, 200, 600, 300],
          y: [50, 300, 100, 400, 150],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
    </section>
  );
};

export default OnboardingFlow;
