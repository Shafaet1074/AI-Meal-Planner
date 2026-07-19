import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        <p>© 2025 SmartMealAI. All rights reserved.</p>
        <div className="space-x-4 mt-4 md:mt-0">
          <a
            href="https://github.com/Shafaet1074"
            target="_blank"
            rel="noreferrer"
            className="hover:text-green-500"
          >
            GitHub
          </a>
          {/* <a href="mailto:hossainshafaet05@gmail.com" className="hover:text-green-500">
            Contact
          </a> */}
        </div>
      </div>
    </footer>
  );
}
