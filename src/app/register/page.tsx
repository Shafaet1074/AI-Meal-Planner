"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/userSlice";
import { auth } from "@/firebase";
import Image from "next/image";
import { Activity, Mail, Lock, User, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (displayName) {
        await updateProfile(user, { displayName });
      }

      dispatch(
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: displayName || user.displayName,
          photoURL: user.photoURL,
        })
      );

      // Send to onboarding flow
      router.push("/setup-profile");
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-slate-950 transition-colors duration-300">
      
      {/* Left Side: Brand & Value Prop */}
      <div className="relative hidden md:flex md:w-1/2 flex-col justify-between p-12 overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/login-side.jpg" // Note: Use an inspiring fitness/healthy food image here
            alt="Healthy meal preparation"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-slate-900/80 mix-blend-multiply"></div>
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

        {/* B2C Member Value Prop */}
        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-extrabold text-white leading-tight mb-6">
            Your gym handles the workouts. We handle the nutrition.
          </h2>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-slate-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>3 free AI-generated meal plans every day.</span>
            </li>
            <li className="flex items-center gap-3 text-slate-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>Dynamic calorie tracking based on your workouts.</span>
            </li>
            <li className="flex items-center gap-3 text-slate-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>Exact macro breakdowns for cutting or bulking.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex flex-col w-full md:w-1/2 items-center justify-center p-6 sm:p-12 relative">
        
        {/* Mobile Logo & Back Link */}
        <div className="absolute top-6 left-6 md:top-8 md:left-8 w-full flex justify-between pr-12">
          <a href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
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
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2 transition-colors">
              Create your account
            </h1>
            <p className="text-slate-500 dark:text-slate-400 transition-colors">
              Start building your personalized AI nutrition profile.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Full Name Input */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm dark:shadow-none"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
            </div>

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
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  placeholder="At least 6 characters"
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
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 py-3.5 rounded-lg font-bold shadow-lg shadow-emerald-600/20 dark:shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:bg-emerald-700 dark:hover:bg-emerald-400 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Get Started Free"
              )}
            </button>
            
            <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-4">
              By registering, you agree to our <a href="#" className="underline hover:text-slate-700 dark:hover:text-slate-300">Terms of Service</a> and <a href="#" className="underline hover:text-slate-700 dark:hover:text-slate-300">Privacy Policy</a>.
            </p>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm mt-8 text-slate-600 dark:text-slate-400 transition-colors">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              Log In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}