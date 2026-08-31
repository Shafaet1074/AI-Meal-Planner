"use client";
import React, { useState, useEffect, useRef } from "react";
import { Menu, X, Activity, SunDim, User, LogOut, LayoutDashboard } from "lucide-react";
import { useTheme } from "next-themes";
import { MoonFilled } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { signOut } from "firebase/auth";

import { auth } from "@/firebase"; 

import { clearUser } from "@/store/userSlice"; 

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  

  const user = useSelector((state: any) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
    
      await signOut(auth);
 
      dispatch(clearUser()); 
      
  
      setProfileDropdownOpen(false);
      setIsOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="fixed w-full z-50 bg-white dark:bg-slate-950/80 backdrop-blur-lg border-b border-gray-100 dark:border-slate-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <div className="bg-emerald-600 p-1.5 rounded-lg">
              <Activity className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              SmartMeal<span className="text-emerald-600">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              How It Works
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Pricing
            </Link>
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

            {/* Auth State Conditional Rendering */}
            {user?.email ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2 pr-3 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-full transition-colors"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  )}
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate max-w-[100px]">
                    {user.displayName || "Profile"}
                  </span>
                </button>

                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-lg py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 mb-1 bg-slate-50 dark:bg-slate-800/50">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.displayName || "User"}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user.email}</p>
                    </div>
                    <Link 
                      href="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4 text-gray-400" />
                      Go to Dashboard
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="inline-flex items-center justify-center px-5 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all"
                >
                  Get Started Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle & Theme */}
          <div className="md:hidden flex items-center gap-2">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 md:m-6 -m-20 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
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

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800 shadow-xl absolute w-full left-0 transition-colors">
          <div className="px-4 pt-3 pb-6 space-y-1">
            <Link href="#features" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-900 rounded-md transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-900 rounded-md transition-colors">
              How It Works
            </Link>
            <Link href="#pricing" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-900 rounded-md transition-colors">
              Pricing
            </Link>
            
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-3">
              {user?.email ? (
                <>
                  <div className="px-3 mb-2 flex items-center gap-3">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.displayName || "User"}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link href="/dashboard" onClick={() => setIsOpen(false)} className="block w-full text-center px-4 py-2.5 text-base font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-900 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                    Go to Dashboard
                  </Link>
                  <button onClick={handleLogout} className="block w-full text-center px-4 py-2.5 text-base font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-sm transition-colors">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)} className="block w-full text-center px-4 py-2.5 text-base font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-900 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                    Sign In
                  </Link>
                  <Link href="/register" onClick={() => setIsOpen(false)} className="block w-full text-center px-4 py-2.5 text-base font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm transition-colors">
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}