import React from "react";
import { Link } from "react-router-dom";
import { PanelsTopLeft } from "lucide-react";

const NavBar = () => {
  return (
    <div className="fixed top-0 z-50 w-full backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 mt-3">
        <div className="rounded-2xl border border-white/10 bg-gray-900/40 shadow-lg">
          <div className="flex items-center justify-between px-5 py-3">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-2">
              <PanelsTopLeft className="h-6 w-6 text-emerald-400" />
              <span className="font-bold text-white tracking-wide">Tracksta</span>
            </Link>

            {/* Navigation */}
            <div className="hidden md:flex items-center gap-6 text-sm text-gray-300">
              <a href="#features" className="hover:text-white">Features</a>
              <a href="#bento" className="hover:text-white">Bento</a>
              <a href="#compare" className="hover:text-white">Compare</a>
              <a href="#faq" className="hover:text-white">FAQ</a>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm text-emerald-400 hover:bg-emerald-500/10"
              >
                Log in
              </Link>
              <Link
                to="/login"
                className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:from-green-600 hover:to-emerald-700"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
