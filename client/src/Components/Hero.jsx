import React from "react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative overflow-hidden p-4 ">
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-600/10 blur-3xl opacity-40" />
      <div className="container mx-auto px-4 md:px-8 relative text-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight"
        >
          Build apps <span className="text-blue-500">with your words.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-gray-400 text-base md:text-lg max-w-2xl mx-auto"
        >
          Type your idea. Watch AI instantly create a React Native + Expo app,
          live in preview, ready to scan and test.
        </motion.p>
      </div>
    </section>
  );
}
