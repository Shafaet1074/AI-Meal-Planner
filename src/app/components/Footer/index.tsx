"use client";
import React from "react";
import { Activity, ArrowRight, Instagram, Twitter, Youtube } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear(); // 2026

  const footerLinks = {
    product: [
      { name: "Features", href: "#features" },
      { name: "How it Works", href: "#how-it-works" },
      { name: "Pricing", href: "#pricing" },
      { name: "iOS App (Beta)", href: "#" },
      { name: "Android App", href: "#" },
    ],
    resources: [
      { name: "Macro Calculator", href: "#" },
      { name: "Nutrition Blog", href: "#" },
      { name: "Recipe Library", href: "#" },
      { name: "Help Center", href: "#" },
    ],
    company: [
      { name: "About Us", href: "#" },
      { name: "Partner Gyms", href: "#" },
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
    ],
  };

  return (
    <footer className="bg-white dark:bg-slate-950 transition-colors duration-300">
      
      {/* Pre-Footer CTA Section */}
      <div className="border-t border-slate-100 dark:border-slate-900 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight transition-colors">
            Stop guessing your macros. <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400">
              Start hitting your goals.
            </span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto font-light transition-colors">
            Join thousands of gym members who have put their nutrition on autopilot. Get your personalized AI meal plan in less than 60 seconds.
          </p>
          <a
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-600/20 dark:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-500 dark:hover:bg-emerald-400 hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-1"
          >
            Get Started for Free
            <ArrowRight className="h-5 w-5" />
          </a>
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-500 transition-colors">
            3 free AI meals daily. No credit card required.
          </p>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 cursor-pointer mb-6">
              <div className="bg-emerald-600 p-1.5 rounded-lg shadow-sm">
                <Activity className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
                SmartMeal<span className="text-emerald-600 dark:text-emerald-500">AI</span>
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-sm font-light transition-colors">
              The smartest way to eat for your physical goals. We combine artificial intelligence with verified nutritional science to build meal plans that actually work.
            </p>
            
            {/* Social Icons */}
            {/* <div className="flex items-center gap-5 mt-8">
              <a href="#" className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                <span className="sr-only">YouTube</span>
                <Youtube className="h-5 w-5" />
              </a>
            </div> */}
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-5 transition-colors">
              Product
            </h3>
            <ul className="space-y-4">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-5 transition-colors">
              Resources
            </h3>
            <ul className="space-y-4">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-5 transition-colors">
              Company
            </h3>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Copyright Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors">
          <p className="text-sm text-slate-500 dark:text-slate-500 transition-colors">
            &copy; {currentYear} SmartMealAI. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-500 transition-colors">
            <span className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}