"use client";
import React, { useState, useEffect } from "react";
import { Menu, X, Activity, SunDim } from "lucide-react";
import { useTheme } from "next-themes";
import { MoonFilled } from "@ant-design/icons";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch for the theme toggle icon
  useEffect(() => setMounted(true), []);

  return (
    <nav className="fixed w-full z-50 bg-white dark:bg-slate-950/80 backdrop-blur-lg border-b border-gray-100 dark:border-slate-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="bg-emerald-600 p-1.5 rounded-lg">
              <Activity className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              SmartMeal<span className="text-emerald-600">AI</span>
            </span>
          </div>

          {/* Desktop Navigation - Updated for B2C */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Pricing
            </a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {theme === "dark" ? <SunDim className="h-5 w-5 text-amber-50" /> : <MoonFilled className="h-5 w-5" />}
              </button>
            )}

            {/* <a href="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              Sign In
            </a> */}
            <a 
              href="/register" 
              className="inline-flex items-center justify-center px-5 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all"
            >
              Get Started Free
            </a>
          </div>

          {/* Mobile Menu Toggle & Theme */}
          <div className="md:hidden flex items-center gap-2">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                {theme === "dark" ? <SunDim className="h-5 w-5 text-amber-50" /> : <MoonFilled className="h-5 w-5" />}
              </button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-none p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6 dark:text-amber-50" /> : <Menu className="h-6 w-6 dark:text-amber-50" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown - Updated for B2C */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800 shadow-xl absolute w-full left-0 transition-colors">
          <div className="px-4 pt-3 pb-6 space-y-1">
            <a href="#features" className="block px-3 py-2.5 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-900 rounded-md transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="block px-3 py-2.5 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-900 rounded-md transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="block px-3 py-2.5 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-900 rounded-md transition-colors">
              Pricing
            </a>
            
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-3">
              {/* <a href="/login" className="block w-full text-center px-4 py-2.5 text-base font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-900 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                Sign In
              </a> */}
              <a href="/register" className="block w-full text-center px-4 py-2.5 text-base font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm transition-colors">
                Get Started Free
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}