"use client";

import { auth, db } from "@/lib/firebase";
import { UserProfile, UserRole } from "@/lib/types";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { Loader2, Save, UserPlus } from "lucide-react";
import { useState } from "react";

export default function DashboardPropietario() {
  const [activeTab, setActiveTab] = useState("usuarios"); // 'usuarios' | 'metricas'

  // Estado para el formulario de nuevo usuario
  const [newUser, setNewUser] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "cocina" as UserRole,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // NOTA: Al usar createUserWithEmailAndPassword en el cliente,
      // Firebase cerrará la sesión actual y logueará al nuevo usuario.
      // En una app real de producción, esto debería hacerse desde una Cloud Function
      // o un servicio de backend admin para no cerrar la sesión del admin.
      alert("ATENCIÓN: Al crear un usuario desde este panel cliente, se cerrará tu sesión actual y tendrás que volver a entrar. Esto es una limitación de Firebase Client SDK sin Backend.");

      const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
      const user = userCredential.user;

      const userData: UserProfile = {
        uid: user.uid,
        nombre: newUser.nombre,
        email: user.email!,
        rol: newUser.rol,
        active: true,
        createdAt: new Date(),
      };

      await setDoc(doc(db, "users", user.uid), {
        ...userData,
        createdAt: Timestamp.now(),
      });

      setMessage("Usuario creado correctamente. Redirigiendo...");
      // La redirección ocurrirá automáticamente por el cambio de auth state

    } catch (error: any) {
      console.error(error);
      setMessage("Error al crear usuario: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-red-600">Panel de Propietario</h1>
        <button
          onClick={() => auth.signOut()}
          className="text-sm text-gray-500 hover:text-red-500 underline"
        >
          Cerrar Sesión
        </button>
      </header>

      <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => setActiveTab("usuarios")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'usuarios' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
          >
            Gestión de Usuarios
          </button>
          <button
            onClick={() => setActiveTab("metricas")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'metricas' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
          >
            Métricas Globales
          </button>
        </div>

        {activeTab === "usuarios" && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <UserPlus className="text-red-600" />
              Registrar Nuevo Personal
            </h2>

            <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={newUser.nombre}
                    onChange={e => setNewUser({ ...newUser, nombre: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Ej. Juan Pérez"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol Asignado</label>
                  <select
                    value={newUser.rol}
                    onChange={e => setNewUser({ ...newUser, rol: e.target.value as UserRole })}
                    className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="admin">Administrador</option>
                    <option value="gerente">Gerente</option>
                    <option value="cocina">Cocina</option>
                    <option value="atencion">Atención al Cliente</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Corporativo</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="usuario@pizzeria.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Inicial</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newUser.password}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                  Crear Usuario
                </button>
              </div>

              {message && (
                <div className={`p-4 rounded-md text-sm ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {message}
                </div>
              )}
            </form>
          </div>
        )}

        {activeTab === "metricas" && (
          <div className="p-12 text-center text-gray-400">
            <p>Próximamente: Gráficos de Ventas y Rendimiento</p>
          </div>
        )}
      </main>
    </div>
  );
}
