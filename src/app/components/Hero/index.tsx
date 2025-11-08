"use client";
import React from "react";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-green-50 via-white to-green-100 overflow-hidden">
      <div className="max-w-7xl mx-auto gap-20 px-6 py-24 flex flex-col md:flex-row items-center">
        {/* Left Content Section */}
        <div className="md:w-1/2 space-y-6 text-center md:text-left relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
            Smarter Eating Starts with <br />
            <span className="text-green-600">AI Meal Planning</span>
          </h1>

          <p className="text-gray-600 text-lg max-w-md mx-auto md:mx-0">
            Get personalized meal plans, track your daily nutrition, and achieve
            your fitness goals — all powered by intelligent AI insights.
          </p>

          <div className="flex justify-center md:justify-start space-x-4 mt-8">
            <a
              href="/register"
              className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition"
            >
              Get Started
            </a>
            <a
              href="#features"
              className="px-6 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Right Image Section */}
        <div className="md:w-1/2 mt-12 md:mt-0 relative">
          <div className="absolute -top-10 -left-10 w-72 h-72 bg-green-300/30 blur-3xl rounded-full z-0"></div>
          <Image
            src="/hero.jpg"
            alt="Healthy AI meal planning"
            width={500}
            height={500}
            className="rounded-2xl shadow-xl relative z-10 object-cover"
            priority
          />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-green-200/40 blur-2xl rounded-full z-0"></div>
        </div>
      </div>

      {/* Optional Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(74,222,128,0.1),transparent_70%)] pointer-events-none"></div>
    </section>
  );
}
