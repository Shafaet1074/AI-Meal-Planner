"use client";
import React, { useState } from "react";
import { Check, Zap, X, ShieldCheck, Loader2, Mail, Lock } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Firebase & Redux Imports for Modal Auth
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase"; // <-- Adjust path if needed
import { setUser } from "@/store/userSlice"; // <-- Adjust path if needed

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

// ------------------------------------------------------------------
// 1. Step 1: Authentication Sub-Component (For Guests)
// ------------------------------------------------------------------
const CheckoutAuthStep = ({ onSuccess }: { onSuccess: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }
      
      const user = userCredential.user;
      
      // Update Redux immediately so the rest of the app knows they are logged in
      dispatch(
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        })
      );
      
      // Move to Step 2 (Payment)
      onSuccess();
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Email already in use. Please log in.");
      } else {
        setError(err.message || "Authentication failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {isLogin ? "Log in to continue" : "Create an account"}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Secure your account before completing the purchase.
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        <div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="email"
              placeholder="Email address"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isLogin ? "Log In" : "Sign Up")}
        </button>
      </form>

      <p className="text-center text-sm mt-6 text-slate-600 dark:text-slate-400">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
        >
          {isLogin ? "Sign up" : "Log in"}
        </button>
      </p>
    </div>
  );
};

// ------------------------------------------------------------------
// 2. Step 2: Checkout Form Sub-Component (Stripe)
// ------------------------------------------------------------------
const CheckoutForm = ({ selectedPlan, isAnnual, user, onSuccess }: any) => {
  const stripe = useStripe();
  const elements = useElements();
  const { theme } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage("");
    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement!,
      billing_details: {
        email: user?.email || "",
        name: user?.displayName || "",
      },
    });

    if (error) {
      setErrorMessage(error.message || "An error occurred.");
      setIsProcessing(false);
    } else {
      console.log("Success! Payment Method Created:", paymentMethod.id);
      setTimeout(() => {
        setIsProcessing(false);
        onSuccess();
      }, 1000);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        color: theme === "dark" ? "#ffffff" : "#0f172a",
        fontFamily: '"Inter", sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": { color: theme === "dark" ? "#94a3b8" : "#64748b" },
      },
      invalid: { color: "#ef4444", iconColor: "#ef4444" },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8">
      <div className="mb-8">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          {selectedPlan.name} Subscription
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{user?.email}</p>
        <div className="flex justify-between items-center py-3 border-t border-b border-slate-100 dark:border-slate-800">
          <span className="text-slate-600 dark:text-slate-300 font-medium">Total Due Today</span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
            ${isAnnual ? (selectedPlan.annualPrice * 12).toFixed(2) : selectedPlan.monthlyPrice}
          </span>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 text-right mt-2">
          {isAnnual ? "Billed annually" : "Billed monthly. Cancel anytime."}
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="relative border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 p-4 shadow-sm">
          <CardElement options={cardElementOptions} />
        </div>
        {errorMessage && <div className="text-red-500 text-sm font-medium text-center">{errorMessage}</div>}
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-all shadow-lg disabled:opacity-70"
      >
        {isProcessing ? (
          <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
        ) : (
          `Subscribe for $${isAnnual ? (selectedPlan.annualPrice * 12).toFixed(2) : selectedPlan.monthlyPrice}`
        )}
      </button>

      <div className="mt-4 text-center">
        <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5" /> Payments processed securely by Stripe
        </p>
      </div>
    </form>
  );
};

// ------------------------------------------------------------------
// 3. Main Pricing Component
// ------------------------------------------------------------------
export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  
  // Modal Step State: 1 = Auth, 2 = Payment
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1); 
  
  const user = useSelector((state: any) => state.user);
  const router = useRouter();

  const tiers = [
    {
      id: "price_basic",
      name: "Basic Access",
      badge: "Included",
      description: "Provided by your gym. Perfect for getting started with macro tracking.",
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        "3 AI meal generations per day",
        "Basic calorie & macro tracking",
        "Sync daily gym workouts",
      ],
      ctaText: "Start for Free",
      isPremium: false,
    },
    {
      id: "price_pro",
      name: "Pro Athlete",
      badge: "Most Popular",
      description: "For dedicated members who want zero limits on their nutrition.",
      monthlyPrice: 650,
      annualPrice: 500,
      features: [
        "Unlimited AI meal generations",
        "Infinite recipe variations & tweaks",
        "Export plans to grocery apps",
      ],
      ctaText: "Upgrade to Pro",
      isPremium: true,
    }
  ];

  const handleActionClick = (tier: any) => {
    if (!tier.isPremium) {
      router.push("/register");
      return;
    }

    // Set the plan and decide which step of the modal to show first
    setSelectedPlan(tier);
    setCheckoutStep(user?.email ? 2 : 1);
    setIsCheckoutOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsCheckoutOpen(false);
    // Routing directly to setup-profile after successful payment!
    router.push("/setup-profile");
  };

  return (
    <section id="pricing" className="relative py-24 sm:py-32 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-sm font-bold tracking-wide text-emerald-600 dark:text-emerald-400 uppercase mb-3 transition-colors">
            Simple Pricing
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-5 tracking-tight transition-colors">
            Unlock your full physical potential.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-16">
          <span className={`text-sm font-medium ${!isAnnual ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
            Monthly
          </span>
          <button 
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative inline-flex h-7 w-14 items-center rounded-full bg-emerald-600 focus:outline-none"
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${isAnnual ? "translate-x-8" : "translate-x-1"}`} />
          </button>
          <span className={`flex items-center gap-2 text-sm font-medium ${isAnnual ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
            Annually 
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {tiers.map((tier) => (
            <div key={tier.id} className={`relative flex flex-col p-8 rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-300 ${tier.isPremium ? "border-emerald-500 shadow-2xl scale-100 hover:scale-[1.02] z-10" : "border-slate-200 dark:border-slate-800 scale-100"}`}>
              
              <div className="mb-8 mt-4 text-center">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{tier.name}</h3>
              </div>

              <div className="mb-8 text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-extrabold text-slate-900 dark:text-white">{isAnnual ? tier.annualPrice : tier.monthlyPrice} BDT</span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">/mo</span>
                </div>
              </div>

              <ul className="flex-1 space-y-4 mb-8 px-2">
                {tier.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-3">
                    <Check className={`h-5 w-5 shrink-0 ${tier.isPremium ? "text-emerald-500" : "text-slate-400"}`} />
                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handleActionClick(tier)}
                className={`block w-full py-4 px-4 rounded-xl text-center font-bold transition-all duration-300 ${tier.isPremium ? "bg-emerald-600 !text-white hover:bg-emerald-500" : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"}`}
              >
                {tier.ctaText}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Step Checkout Modal */}
      {isCheckoutOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0">
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsCheckoutOpen(false)} />
          
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
                <span className="font-bold text-sm tracking-wide uppercase">Secure Checkout</span>
              </div>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Step Logic: Render Auth OR Payment */}
            {checkoutStep === 1 ? (
              <CheckoutAuthStep onSuccess={() => setCheckoutStep(2)} />
            ) : (
              <Elements stripe={stripePromise}>
                <CheckoutForm 
                  selectedPlan={selectedPlan} 
                  isAnnual={isAnnual} 
                  user={user} 
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            )}

          </div>
        </div>
      )}
    </section>
  );
}