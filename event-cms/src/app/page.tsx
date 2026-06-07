'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Star, Calendar, Users, Sparkles, Globe } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#0f0f1a] text-white overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 bg-black/20 backdrop-blur-md border-b border-white/10">
        <span className="font-cinzel text-xl font-bold gold-text">EventCraft</span>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-sm text-white/70 hover:text-white transition-colors">
            Admin Login
          </Link>
          <Link
            href="/admin"
            className="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-[#D4AF37] to-[#c9a84c] text-[#1a1a2e] hover:opacity-90 transition-opacity"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center pt-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#D4AF37]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/3 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-sm mb-8"
          >
            <Star className="w-4 h-4" />
            <span>Beautiful Event Websites, Effortlessly</span>
          </motion.div>

          <h1 className="font-playfair text-5xl md:text-7xl font-bold leading-tight mb-6">
            Create Your Perfect{" "}
            <span className="gold-text">Event Website</span>
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 font-lato leading-relaxed">
            Wedding, birthday, housewarming — build a stunning event website in minutes.
            Just fill in your details and our templates do the rest.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/admin"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#c9a84c] text-[#1a1a2e] font-bold text-lg hover:opacity-90 transition-all hover:gap-3"
            >
              Start Building
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/event/demo-wedding"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors"
            >
              <Heart className="w-5 h-5 text-[#D4AF37]" />
              View Demo
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-4">
              Everything You <span className="gold-text">Need</span>
            </h2>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              One platform for all your event website needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Heart, title: "Wedding Websites", desc: "Hero, story, timeline, gallery, RSVP & blessing wall — all in one beautiful page." },
              { icon: Calendar, title: "Birthday & Events", desc: "Birthdays, housewarmings, community events — any occasion, perfectly presented." },
              { icon: Users, title: "Guest Management", desc: "RSVP tracking, blessing wall moderation, and CSV export for guest lists." },
              { icon: Star, title: "Luxury Templates", desc: "Professionally designed templates: Luxury Gold, Garden, Modern Minimal, Traditional Thai." },
              { icon: Sparkles, title: "Easy CMS", desc: "No coding required. Fill in fields, upload image URLs, and publish instantly." },
              { icon: Globe, title: "Custom Decorations", desc: "Layer flowers, frames, ribbons and traditional ornaments on any section." },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h3 className="font-playfair text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Event types */}
      <section className="py-24 px-6 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-4">
              Any <span className="gold-text">Occasion</span>
            </h2>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-3">
            {["Wedding", "Birthday Party", "Housewarming", "Community Event", "Family Gathering", "Anniversary", "Baby Shower", "Corporate Event"].map((type) => (
              <motion.span
                key={type}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="px-6 py-3 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37] font-lato font-medium"
              >
                {type}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center border-t border-white/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6">
            Ready to Create Your <span className="gold-text">Event?</span>
          </h2>
          <p className="text-white/60 mb-8 font-lato">
            Sign in to the admin dashboard and start building your beautiful event website today.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#c9a84c] text-[#1a1a2e] font-bold text-lg hover:opacity-90 transition-opacity"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6 text-center text-white/40 text-sm font-lato">
        <p>© {new Date().getFullYear()} EventCraft. Built with love for beautiful events.</p>
      </footer>
    </main>
  );
}
