import ProveedorAutenticacion from "@/components/ProveedorAutenticacion";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Work_Sans } from "next/font/google";
import "./globals.css";

// Configuración de fuentes
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
});

// Metadatos de la aplicación
export const metadata: Metadata = {
  title: "Sistema Pizza",
  description: "Sistema de gestión para pizzería",
};

/**
 * Layout Principal (RootLayout)
 *
 * Este componente define la estructura base de toda la aplicación.
 * - Configura el idioma y las fuentes.
 * - Envuelve la aplicación en el ProveedorAutenticacion.
 * - Muestra la barra de navegación (nav) que es visible solo cuando hay sesión.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${workSans.variable} antialiased min-h-screen flex flex-col bg-gray-50`}
        suppressHydrationWarning
      >
        <ProveedorAutenticacion>
          <main className="flex-1 w-full bg-gray-50 min-h-screen">
            {children}
          </main>
        </ProveedorAutenticacion>
      </body>
    </html>
  );
}
