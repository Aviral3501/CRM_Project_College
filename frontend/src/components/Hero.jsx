"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import FlippingWords from "./FlippingWords";

/* ==============================
   Hero Utilities
   ============================== */
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut", delay },
  },
});

/* ==============================
   Background Beams (Inline CSS gradients, no purge)
   ============================== */
const BackgroundBeamsWithCollision = ({ children, className = "" }) => {
  const containerRef = useRef(null); // bottom collision plane
  const parentRef = useRef(null);

  // Use pixels so we can place beams predictably. Adjust/add more as you like.
  const beams = [
    { initialX: 60,  duration: 7,  delay: 0.6 },
    { initialX: 180, duration: 6,  delay: 1.2 },
    { initialX: 320, duration: 8,  delay: 0.9, height: "95vh" },
    { initialX: 480, duration: 5.5,delay: 1.8 },
    { initialX: 640, duration: 9,  delay: 1.1, height: "92vh" },
    { initialX: 820, duration: 7.5,delay: 1.6 },
    { initialX: 980, duration: 10, delay: 1.4, height: "96vh" },
  ];

  return (
    <div
      ref={parentRef}
      className={[
        "relative flex items-center justify-center overflow-hidden w-full h-[100vh]",
        "bg-gradient-to-b from-gray-950 via-black to-gray-900",
        className,
      ].join(" ")}
    >
      {/* Falling beams */}
      {beams.map((beam, idx) => (
        <CollisionMechanism
          key={`beam-${idx}`}
          beamOptions={beam}
          containerRef={containerRef}
          parentRef={parentRef}
        />
      ))}

      {/* Content sits above beams */}
      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>

      {/* Shadow plane for collisions (bottom “ground”) */}
      <div
        ref={containerRef}
        className="absolute bottom-0 w-full h-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(17,24,39,1) 0%, rgba(17,24,39,0) 100%)",
          boxShadow:
            "0 0 24px rgba(34,42,53,0.06), 0 1px 1px rgba(0,0,0,0.05), 0 0 0 1px rgba(34,42,53,0.04), 0 0 4px rgba(34,42,53,0.08)",
        }}
      />
    </div>
  );
};

/* ==============================
   Beam + Explosion System
   ============================== */
const CollisionMechanism = ({ parentRef, containerRef, beamOptions = {} }) => {
  const beamRef = useRef(null);
  const [collision, setCollision] = useState({ detected: false, coordinates: null });
  const [beamKey, setBeamKey] = useState(0);
  const [cycleCollisionDetected, setCycleCollisionDetected] = useState(false);

  // Collision detector: when the beam's bottom reaches the top of bottom plane (containerRef)
  useEffect(() => {
    const checkCollision = () => {
      if (!beamRef.current || !containerRef.current || !parentRef.current || cycleCollisionDetected) return;

      const beamRect = beamRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      const parentRect = parentRef.current.getBoundingClientRect();

      if (beamRect.bottom >= containerRect.top) {
        const relativeX = beamRect.left - parentRect.left + beamRect.width / 2;
        const relativeY = beamRect.bottom - parentRect.top;
        setCollision({ detected: true, coordinates: { x: relativeX, y: relativeY } });
        setCycleCollisionDetected(true);
      }
    };

    const interval = setInterval(checkCollision, 50);
    return () => clearInterval(interval);
  }, [cycleCollisionDetected]);

  // Reset collision & recycle beam key for stochastic desync
  useEffect(() => {
    if (collision.detected && collision.coordinates) {
      const t1 = setTimeout(() => {
        setCollision({ detected: false, coordinates: null });
        setCycleCollisionDetected(false);
      }, 1200);
      const t2 = setTimeout(() => setBeamKey((prev) => prev + 1), 1500);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [collision]);

  // Bright, clearly visible beam via inline CSS gradient (no Tailwind purge issue)
  const beamHeight = beamOptions.height || "90vh";
  const beamGlow = "drop-shadow(0 0 10px rgba(16,185,129,0.85))";
  const beamGradient = "linear-gradient(to bottom, rgba(16,185,129,0.95), rgba(34,211,238,0.7), rgba(0,0,0,0))";

  return (
    <>
      {/* The actual beam */}
      <motion.div
        key={beamKey}
        ref={beamRef}
        initial={{ translateY: "-320px", translateX: beamOptions.initialX }}
        animate={{ translateY: "1200px", translateX: beamOptions.initialX }}
        transition={{
          duration: beamOptions.duration || 8,
          repeat: Infinity,
          repeatType: "loop",
          ease: "linear",
          delay: beamOptions.delay || 0,
        }}
        className="absolute top-0 z-0"
        style={{
          width: "3px",
          height: beamHeight,
          borderRadius: "9999px",
          backgroundImage: beamGradient,
          filter: beamGlow,
          opacity: 0.9,
          mixBlendMode: "screen",
        }}
      />

      {/* Spark explosion when beam hits bottom */}
      <AnimatePresence>
        {collision.detected && collision.coordinates && (
          <Explosion
            key={`${collision.coordinates.x}-${collision.coordinates.y}`}
            style={{
              left: `${collision.coordinates.x}px`,
              top: `${collision.coordinates.y}px`,
              transform: "translate(-50%, -50%)",
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

/* ==============================
   Explosion Particle Animation
   ============================== */
const Explosion = (props) => {
  const spans = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    dx: Math.floor(Math.random() * 60 - 30),
    dy: Math.floor(Math.random() * -40 - 12),
    dur: Math.random() * 0.9 + 0.5,
  }));

  return (
    <div {...props} className="absolute z-20 pointer-events-none">
      {spans.map((s) => (
        <motion.span
          key={s.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: s.dx, y: s.dy, opacity: 0, scale: 0.5 }}
          transition={{ duration: s.dur, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: "3px",
            height: "3px",
            borderRadius: "9999px",
            backgroundImage:
              "linear-gradient(to bottom, rgba(34,211,238,1), rgba(16,185,129,1))",
            filter: "drop-shadow(0 0 6px rgba(34,211,238,0.8))",
          }}
        />
      ))}
    </div>
  );
};

/* ==============================
   Hero Section with Beams
   ============================== */
const Hero = () => {
  return (
    <BackgroundBeamsWithCollision>
      <motion.div
        variants={fadeUp(0.2)}
        initial="hidden"
        animate="visible"
        className="text-center px-6 max-w-4xl"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight text-white">
          A <FlippingWords words={["Smarter", "Unified", "Modern", "AI-powered"]} />{" "}
          <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Workspace
          </span>{" "}
          for Teams & Clients
        </h1>

        <p className="text-gray-300 max-w-2xl mx-auto mb-8 text-lg leading-relaxed">
          Tracksta transforms chaos into clarity — manage tasks, leads, sales, and onboarding from
          one powerful dashboard. Experience fluid collaboration, automation, and insights in one
          unified view.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/login"
            className="px-8 py-3 rounded-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
          >
            Try Tracksta Free
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 rounded-lg font-semibold border border-emerald-500/70 text-emerald-400 hover:bg-emerald-600/10"
          >
            Watch Demo <ArrowRight className="inline w-4 h-4 ml-2" />
          </Link>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mt-10 text-emerald-400 font-light"
        >
          ↓ Scroll to Explore
        </motion.div>
      </motion.div>
    </BackgroundBeamsWithCollision>
  );
};

export default Hero;
