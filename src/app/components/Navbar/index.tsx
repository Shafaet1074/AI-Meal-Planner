import React from "react";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-green-600">SmartMealAI</div>
        <div className="space-x-6 hidden md:flex">
          <a href="#features" className="hover:text-green-600">Features</a>
          <a href="#how-it-works" className="hover:text-green-600">How It Works</a>
          <a href="#about" className="hover:text-green-600">About</a>
        </div>
        <div className="space-x-4">
          <a
            href="/login"
            className="px-4 py-2 border border-green-600 text-green-600 rounded hover:bg-green-600 hover:text-white transition"
          >
            Login
          </a>
          <a
            href="/register"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Sign Up
          </a>
        </div>
      </div>
    </nav>
  );
}
