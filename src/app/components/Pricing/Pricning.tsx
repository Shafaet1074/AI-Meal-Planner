"use client";
import React, { useState } from "react";
import { Check, Zap, Infinity } from "lucide-react";

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  const tiers = [
    {
      name: "Basic Access",
      badge: "Included",
      description: "Provided by your gym. Perfect for getting started with macro tracking.",
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        "3 AI meal generations per day",
        "Basic calorie & macro tracking",
        "Sync daily gym workouts",
        "Standard recipe library",
      ],
      ctaText: "Start for Free",
      ctaHref: "/register",
      highlighted: false,
    },
    {
      name: "Pro Athlete",
      badge: "Most Popular",
      description: "For dedicated members who want zero limits on their nutrition.",
      monthlyPrice: 9.99,
      annualPrice: 7.99,
      features: [
        "Unlimited AI meal generations",
        "Infinite recipe variations & tweaks",
        "Advanced macro & micro analytics",
        "Export plans to grocery apps",
        "Priority AI processing speed",
      ],
      ctaText: "Upgrade to Pro",
      ctaHref: "/upgrade",
      highlighted: true,
    }
  ];

  return (
    <section id="pricing" className="py-24 sm:py-32 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-sm font-bold tracking-wide text-emerald-600 dark:text-emerald-400 uppercase mb-3 transition-colors">
            Simple Pricing
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-5 tracking-tight transition-colors">
            Unlock your full physical potential.
          </p>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-light transition-colors">
            Start for free courtesy of your facility. Upgrade anytime to remove daily limits and access advanced nutrition tools.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <span className={`text-sm font-medium ${!isAnnual ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"} transition-colors`}>
            Monthly
          </span>
          
          <button 
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative inline-flex h-7 w-14 items-center rounded-full bg-emerald-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
            role="switch"
            aria-checked={isAnnual}
          >
            <span 
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${isAnnual ? "translate-x-8" : "translate-x-1"}`}
            />
          </button>
          
          <span className={`flex items-center gap-2 text-sm font-medium ${isAnnual ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"} transition-colors`}>
            Annually 
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 shadow-sm transition-colors">
              Save 20%
            </span>
          </span>
        </div>

        {/* Pricing Cards Grid (Max width restricted for 2 cards to look balanced) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {tiers.map((tier, index) => (
            <div 
              key={index}
              className={`relative flex flex-col p-8 rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-300 ${
                tier.highlighted 
                  ? "border-emerald-500 shadow-2xl dark:shadow-emerald-900/20 md:-mt-4 md:mb-4 scale-100 hover:scale-[1.02] z-10" 
                  : "border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md scale-100 hover:scale-[1.01]"
              }`}
            >
              {/* Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                  tier.highlighted 
                    ? "bg-emerald-500 text-white" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                }`}>
                  {tier.highlighted ? <Zap className="h-3.5 w-3.5" fill="currentColor" /> : null}
                  {tier.badge}
                </span>
              </div>

              {/* Header Info */}
              <div className="mb-8 mt-4 text-center">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 transition-colors">
                  {tier.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 h-10 px-4 transition-colors">
                  {tier.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8 text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-extrabold text-slate-900 dark:text-white transition-colors">
                    ${isAnnual ? tier.annualPrice : tier.monthlyPrice}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium transition-colors">/mo</span>
                </div>
                {tier.monthlyPrice > 0 ? (
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-3 transition-colors h-5">
                    {isAnnual ? `Billed $${(tier.annualPrice * 12).toFixed(2)} yearly` : "Billed monthly"}
                  </p>
                ) : (
                  <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-3 transition-colors h-5">
                    Free forever
                  </p>
                )}
              </div>

              {/* Features List */}
              <ul className="flex-1 space-y-4 mb-8 px-2">
                {tier.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-3">
                    <Check className={`h-5 w-5 shrink-0 ${tier.highlighted ? "text-emerald-500" : "text-slate-400 dark:text-slate-500"}`} />
                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium transition-colors">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <a 
                href={tier.ctaHref} 
                className={`block w-full py-4 px-4 rounded-xl text-center font-bold transition-all duration-300 ${
                  tier.highlighted
                    ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 dark:shadow-emerald-900/30 hover:shadow-emerald-500/30"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                }`}
              >
                {tier.ctaText}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}