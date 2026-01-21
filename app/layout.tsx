import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
      <body className={`${jetbrainsMono.variable} font-mono antialiased`}>
        {children}
      </body>
    </html>
  );
}
