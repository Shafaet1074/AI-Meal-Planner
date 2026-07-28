import type { Metadata } from "next";
import ReduxProvider from "../providers/ReduxProvider";
// Adjust the import path below based on where you saved the ThemeProvider
import {ThemeProvider} from "../app/ThemeProvider";
import './globals.css'


export const metadata: Metadata = {
  // Upgraded the metadata slightly to match your new B2B SaaS positioning
  title: "SmartMealAI | Enterprise Nutrition Coaching",
  description: "Scale your gym's nutrition coaching with AI-powered meal planning.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning is strictly required for next-themes
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-300">
        <ThemeProvider>
          <ReduxProvider>
            {/* If your Navbar is global, you can also place it here above {children} */}
            {children}
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}