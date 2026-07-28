"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/userSlice";
import { auth } from "@/firebase";
import Image from "next/image";
import { Activity, Mail, Lock, ArrowLeft, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      dispatch(
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        })
      );

      // Redirecting straight to dashboard (or setup if new)
      router.push("/setup-profile");
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password. Please try again.");
      } else if (err.code === "auth/user-not-found") {
        setError("No user found with this email.");
      } else {
        setError("Login failed. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-slate-950 transition-colors duration-300">
      
      {/* Left Side: Brand & Social Proof */}
      <div className="relative hidden md:flex md:w-1/2 flex-col justify-between p-12 overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/login-side.jpg" // Note: Suggest using an image of someone meal prepping or checking their phone at the gym
            alt="Gym member checking meal plan"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-slate-900/80 mix-blend-multiply"></div>
          {/* Subtle gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="bg-emerald-500 p-1.5 rounded-lg shadow-lg shadow-emerald-500/20">
            <Activity className="h-6 w-6 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight">
            SmartMeal<span className="text-emerald-400">AI</span>
          </span>
        </div>

        {/* B2C Member Testimonial */}
        <div className="relative z-10 max-w-md">
          <p className="text-2xl font-medium text-white leading-snug mb-6">
            "It takes all the guesswork out of my macros. The AI generates my meals, and I just focus on the heavy lifting."
          </p>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-700 border-2 border-slate-600 overflow-hidden">
              {/* Optional: Add a small user avatar here in the future */}
            </div>
            <div>
              <p className="text-sm font-bold text-white">Alex Rivera</p>
              <p className="text-xs text-emerald-400 font-medium">Pro Tier Member</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex flex-col w-full md:w-1/2 items-center justify-center p-6 sm:p-12 relative">
        
        {/* Mobile Logo & Back Link */}
        <div className="absolute top-6 left-6 md:top-8 md:left-8 w-full flex justify-between pr-12">
          <a href="/" className="inline-flex items-center gap-2 text-sm font-bold text-black dark:text-amber-50 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to website
          </a>
          {/* Mobile Logo only */}
          <div className="flex md:hidden items-center gap-1.5">
            <div className="bg-emerald-600 p-1 rounded-md">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">SmartMealAI</span>
          </div>
        </div>

        <div className="w-full max-w-md mt-24 md:mt-0">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2 transition-colors">
              Welcome back
            </h1>
            <p className="text-slate-500 dark:text-slate-400 transition-colors">
              Enter your details to access your daily AI meal planner.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm dark:shadow-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
                  Password
                </label>
                <a href="#" className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm dark:shadow-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm font-medium transition-colors">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{ color: "white" }}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 py-3.5 rounded-lg font-bold shadow-lg shadow-emerald-600/20 dark:shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:bg-emerald-700 dark:hover:bg-emerald-400 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Log In"
              )}
            </button>
          </form>

          {/* Registration Link */}
          <p className="text-center text-sm mt-8 text-slate-600 dark:text-slate-400 transition-colors">
            Don't have an account yet?{" "}
            <a
              href="/register"
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              Get Started Free
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}