"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function LandingPage() {
  const supabase = createClientComponentClient();

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-5 border-b border-slate-200 bg-white/70 backdrop-blur-md">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-semibold"
        >
          DepScan
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Button onClick={handleSignIn} className="flex items-center gap-2">
            <Github className="w-4 h-4" />
            Sign in with GitHub
          </Button>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center mt-24 px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Scan your GitHub dependencies <br /> with one click.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-slate-600 max-w-xl mb-10"
        >
          DepScan helps you track outdated, risky, or vulnerable packages across all your repositories. Just connect your GitHub.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            size="lg"
            className="px-6 py-6 text-base bg-gray-600 hover:bg-gray-700 transition-all"
            onClick={handleSignIn}
          >
            Get Started
          </Button>
        </motion.div>
      </section>

      {/* Feature Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-20 px-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 transition-all"
        >
          <h3 className="text-xl font-semibold mb-3">Smart Dependency Scanning</h3>
          <p className="text-slate-600">
            Instantly analyze your repos and find outdated or risky packages with AI-assisted insights.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 transition-all"
        >
          <h3 className="text-xl font-semibold mb-3">Automatic GitHub Sync</h3>
          <p className="text-slate-600">
            Connect once, and DepScan automatically keeps your repositories up-to-date with the latest data.
          </p>
        </motion.div>
      </section>
    </main>
  );
}
