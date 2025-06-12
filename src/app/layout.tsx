import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "HealthConnect Pro - Plateforme de RDV entre Professionnels de Santé",
  description: "Plateforme sécurisée pour la prise de rendez-vous entre professionnels de santé. Simplifiez la coordination des soins pour vos patients.",
  keywords: "santé, professionnel, rendez-vous, médecin, infirmier, kinésithérapeute",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
