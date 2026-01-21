import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CV Optimizer | AI-Powered Resume Enhancement",
  description: "Optimize your LaTeX CV for specific job descriptions using AI. Get tailored recommendations to improve your resume and land your dream job.",
  keywords: ["CV optimizer", "resume builder", "AI resume", "LaTeX CV", "job application"],
  authors: [{ name: "Johny" }],
  openGraph: {
    title: "CV Optimizer | AI-Powered Resume Enhancement",
    description: "Optimize your LaTeX CV for specific job descriptions using AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
