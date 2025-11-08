import type { Metadata } from "next";
import ReduxProvider from "../providers/ReduxProvider";
import './globals.css'

export const metadata: Metadata = {
  title: "AI Meal Planner",
  description: "Smart Recipe & Meal Planner with Firebase Auth",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
