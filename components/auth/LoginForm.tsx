"use client";

import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Eye, EyeOff, Loader2, Lock, Pizza, User } from "lucide-react";
import { useState } from "react";

/**
 * Componente del Formulario de Inicio de Sesión
 *
 * Este componente maneja tanto el inicio de sesión como el registro de nuevos usuarios.
 * Utiliza Firebase Authentication para la validación de credenciales.
 */
export default function LoginForm() {
  // Estados para el manejo del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  /**
   * Maneja el envío del formulario.
   */
  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      // Lógica de inicio de sesión
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error("Error de autenticación:", err);
      // Manejo de errores específicos de Firebase
      if (err.code === "auth/invalid-credential") {
        setError("Correo o contraseña incorrectos.");
      } else if (err.code === "auth/user-not-found") {
        setError("Usuario no encontrado.");
      } else if (err.code === "auth/wrong-password") {
        setError("Contraseña incorrecta.");
      } else {
        setError("Error de autenticación. Intente nuevamente.");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex h-full w-full bg-background-dark font-display overflow-hidden text-white">
      {/* Lado Izquierdo: Imagen y Marca */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC34HGoya0NShxMd_-SSWvwQOjBIooE1jP1zXTQkv0h2ykXafRyDVwfcpV3wgyqlsdJb0HHj37f3-oYRICBfcg8vqJjOJNUb8jLdZq8OQgnb5TlNAi-uEZdzZx_rYJ_p0ZDXOnVoTRib0J5x8k7s7rWLzVQ9lsOT_Ffc_wmNXKUW5JyY6tlYHWHV6jjWKoBD7aV9ruSE9P3fNpNiK_RPrpwLRVyyap_cDflsy4jwlvv7EJc4OqMkdORGdtrKQctxRrEa-9pQYgtiqU")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="relative z-10 flex flex-col justify-end p-12 w-full text-white">
          <div className="mb-6">
            <Pizza size={60} className="text-primary mb-4" />
            <h1 className="text-4xl font-bold tracking-tight mb-2">Pizzeria Claren'z</h1>
            <p className="text-lg text-gray-200 max-w-md">Gestión integral para el control de calidad, tiempos y excelencia en cada rebanada.</p>
          </div>
        </div>
      </div>

      {/* Lado Derecho: Formulario */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-background-dark overflow-y-auto">
        <div className="w-full max-w-[420px] space-y-8">
          {/* Cabecera */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 lg:hidden mb-4 text-primary">
              <Pizza size={40} />
              <span className="text-xl font-bold text-white">Pizzaiolo OS</span>
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Control de Operaciones
            </h2>
            <p className="text-gray-400">
              Ingresa tus credenciales para acceder al panel de administración.
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={manejarEnvio} className="space-y-6">
            {error && (
              <div className="bg-red-900/50 border border-red-500/20 text-red-200 p-4 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Campo de Correo */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-200">
                Correo Electrónico
              </label>
              <div className="relative mt-2 rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User size={20} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border-0 py-3 pl-10 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary bg-white/5 sm:text-sm sm:leading-6 transition-all"
                  placeholder="ej. gerente@pizzeria.com"
                  required
                />
              </div>
            </div>

            {/* Campo de Contraseña */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-200">
                  Contraseña
                </label>
              </div>
              <div className="relative mt-2 rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock size={20} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border-0 py-3 pl-10 pr-10 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary bg-white/5 sm:text-sm sm:leading-6 transition-all"
                  placeholder="••••••••"
                  required
                />
                <div
                  className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer hover:text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} className="text-gray-400" />
                  ) : (
                    <Eye size={20} className="text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Recordarme
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-primary/80 transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            {/* Botón de Envío */}
            <div>
              <button
                type="submit"
                disabled={cargando}
                className="flex w-full justify-center rounded-lg bg-primary px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {cargando ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  "Acceder al Sistema"
                )}
              </button>
            </div>
          </form>

          {/* Pie de Página */}
          <div className="pt-8 border-t border-white/10">
            <p className="text-center text-xs text-gray-500">
              © {new Date().getFullYear()} Pizzeria Claren'z Inc. Todos los derechos reservados.<br />
              Versión 0.9.2
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
