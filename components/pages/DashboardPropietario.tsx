'use client';

import { useAuth } from "@/components/auth/ProveedorAutenticacion";
import { useOrders } from "@/hooks/useOrders";
import { auth, db } from "@/lib/firebase";
import { UserProfile, UserRole } from "@/lib/types";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import {
  Building2,
  ChevronRight,
  DollarSign,
  LayoutDashboard,
  LogOut,
  PieChart,
  UserPlus,
  Users,
  Wallet
} from "lucide-react";
import { useState } from "react";
import StandardsView from "../modules/pizzero/StandardsView";

export default function DashboardPropietario() {
  const { user, profile } = useAuth();
  const { orders } = useOrders(); // For metrics
  const [activeView, setActiveView] = useState<'global' | 'finanzas' | 'usuarios' | 'estandares'>('global');

  // Existing User State
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
      alert("ATENCIÓN: Al crear un usuario desde este panel cliente, se cerrará tu sesión actual y tendrás que volver a entrar. Esto es una limitación de Firebase Client SDK sin Backend.");

      const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
      const createdUser = userCredential.user;

      const userData: UserProfile = {
        uid: createdUser.uid,
        nombre: newUser.nombre,
        email: createdUser.email!,
        rol: newUser.rol,
        active: true,
        createdAt: new Date(),
      };

      await setDoc(doc(db, "users", createdUser.uid), {
        ...userData,
        createdAt: Timestamp.now(),
      });

      setMessage("Usuario creado correctamente. Redirigiendo...");
    } catch (error: any) {
      console.error(error);
      setMessage("Error al crear usuario: " + error.message);
      setLoading(false);
    }
  };

  const navItems = [
    { id: 'global', label: 'Visión Global', icon: LayoutDashboard },
    { id: 'finanzas', label: 'Finanzas', icon: Wallet },
    { id: 'usuarios', label: 'Personal', icon: Users },
    { id: 'estandares', label: 'Estándares', icon: Building2 },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">

      {/* SIDEBAR */}
      <aside className="w-72 flex-shrink-0 flex flex-col border-r border-slate-200 bg-slate-900 text-slate-300 hidden lg:flex z-20">
        <div className="flex h-full flex-col justify-between p-6">
          <div className="flex flex-col gap-8">
            {/* Brand */}
            <div className="flex items-center gap-3 px-2">
              <div className="bg-red-600 p-2 rounded-lg text-white">
                <PieChart size={24} />
              </div>
              <h1 className="text-white text-xl font-bold tracking-tight">PizzaOps <span className="text-red-500">.Owner</span></h1>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = activeView === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id as any)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left group ${isActive
                      ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
                      : 'hover:bg-slate-800 hover:text-white'
                      }`}
                  >
                    <Icon size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'} />
                    <p className={`text-sm font-medium leading-normal ${isActive ? 'font-bold' : ''}`}>{item.label}</p>
                    {isActive && <ChevronRight size={16} className="ml-auto text-white/50" />}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700/50">
              <div className="size-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 font-bold">
                {profile?.nombre?.[0] || 'A'}
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-bold text-white">{profile?.nombre || 'Admin'}</p>
                <p className="text-xs text-slate-500">Propietario</p>
              </div>
            </div>
            <button onClick={() => signOut(auth)} className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-red-400 transition-colors text-sm font-medium">
              <LogOut size={18} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-slate-50 relative overflow-hidden">

        {/* HEADER */}
        <header className="flex items-center justify-between border-b border-slate-200 px-8 py-5 bg-white">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {navItems.find(i => i.id === activeView)?.label}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {new Date().toLocaleDateString('es-ES', { dateStyle: 'long' })}
            </span>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-8">

          {activeView === 'usuarios' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Gestión de Personal</h3>
                    <p className="text-slate-500 text-sm">Registrar nuevos empleados y asignar roles</p>
                  </div>
                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                    Admin Access
                  </div>
                </div>

                <div className="p-8">
                  <form onSubmit={handleCreateUser} className="space-y-6 max-w-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre Completo</label>
                        <input
                          type="text"
                          required
                          value={newUser.nombre}
                          onChange={e => setNewUser({ ...newUser, nombre: e.target.value })}
                          className="w-full rounded-lg border-slate-300 shadow-sm focus:border-red-500 focus:ring-red-500 py-2.5"
                          placeholder="Ej. Juan Pérez"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Rol Asignado</label>
                        <select
                          value={newUser.rol}
                          onChange={e => setNewUser({ ...newUser, rol: e.target.value as UserRole })}
                          className="w-full rounded-lg border-slate-300 shadow-sm focus:border-red-500 focus:ring-red-500 py-2.5"
                        >
                          <option value="admin">Administrador</option>
                          <option value="gerente">Gerente</option>
                          <option value="pizzero">Pizzero (Cocina)</option>
                          <option value="atencion">Atención al Cliente</option>
                          <option value="delivery">Delivery</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Correo Corporativo</label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={newUser.email}
                          onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                          className="w-full rounded-lg border-slate-300 shadow-sm focus:border-red-500 focus:ring-red-500 py-2.5 pl-10"
                          placeholder="usuario@pizzeria.com"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-slate-400">@</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Contraseña Inicial</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={newUser.password}
                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                        className="w-full rounded-lg border-slate-300 shadow-sm focus:border-red-500 focus:ring-red-500 py-2.5"
                        placeholder="••••••••"
                      />
                      <p className="mt-1 text-xs text-slate-400">Mínimo 6 caracteres.</p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <p className="text-xs text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg max-w-xs border border-yellow-100">
                        <strong>Nota:</strong> Crear usuario cerrará la sesión actual debido a políticas de seguridad.
                      </p>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex justify-center items-center gap-2 py-2.5 px-6 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-50 hover:shadow-lg"
                      >
                        <UserPlus size={18} />
                        Registrar Usuario
                      </button>
                    </div>
                  </form>

                  {message && (
                    <div className={`mt-6 p-4 rounded-lg text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 ${message.includes('Error') ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                      {message.includes('Error') ? <div className="size-2 rounded-full bg-red-500" /> : <div className="size-2 rounded-full bg-green-500" />}
                      {message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeView === 'estandares' && (
            <StandardsView orders={orders} />
          )}

          {activeView === 'global' && (
            <div className="max-w-[1600px] mx-auto flex flex-col gap-8">
              {/* Financial Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Sales Today */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                      <DollarSign size={24} />
                    </div>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12.5%</span>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Ventas Hoy (Est.)</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-1">${(orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString() && o.estado !== 'cancelado').reduce((acc, o) => acc + (o.items.length * 12.50), 0)).toFixed(2)}</h3>
                  </div>
                </div>

                {/* Active Orders */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                      <Pizza size={24} />
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">En curso</span>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Pedidos Activos</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-1">{orders.filter(o => o.estado !== 'entregado' && o.estado !== 'cancelado').length}</h3>
                  </div>
                </div>

                {/* Average Ticket */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <CreditCard size={24} />
                    </div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Steady</span>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Ticket Promedio</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-1">$12.50</h3>
                  </div>
                </div>

                {/* Defect Rate */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                      <TrendingUp size={24} />
                    </div>
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">Attention</span>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Tasa de Defectos</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-1">
                      {orders.length > 0 ? ((orders.filter(o => o.estado === 'cancelado').length / orders.length) * 100).toFixed(1) : 0}%
                    </h3>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Weekly Sales Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Ventas Semanales</h3>
                      <p className="text-slate-500 text-sm">Rendimiento últimos 7 días</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <div className="size-2 rounded-full bg-red-600"></div> Ventas
                      </span>
                    </div>
                  </div>

                  {/* SVG Chart */}
                  <div className="flex-1 flex items-end justify-between h-64 gap-3">
                    {[65, 45, 75, 55, 85, 95, 60].map((val, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-3 group cursor-pointer">
                        <div className="w-full bg-slate-50 rounded-lg relative overflow-hidden h-full flex items-end">
                          <div
                            className="w-full bg-red-600 opacity-90 group-hover:opacity-100 transition-all duration-300 rounded-lg shadow-sm"
                            style={{ height: `${val}%` }}
                          >
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
                              ${(val * 15).toFixed(0)}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600">
                          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][idx]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions / Activity */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Actividad Reciente</h3>
                  <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[300px]">
                    {orders.slice(0, 5).map(order => (
                      <div key={order.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                        <div className={`size-10 rounded-full flex items-center justify-center flex-shrink-0 ${order.estado === 'entregado' ? 'bg-green-100 text-green-600' :
                            order.estado === 'cancelado' ? 'bg-red-100 text-red-600' :
                              'bg-blue-100 text-blue-600'
                          }`}>
                          {order.estado === 'entregado' ? <DollarSign size={18} /> :
                            order.estado === 'cancelado' ? <TrendingUp size={18} /> :
                              <Pizza size={18} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            Pedido #{order.id.slice(-4)} {order.estado === 'entregado' ? 'Completado' : order.estado}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {order.cliente} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-slate-400">
                          ${(order.items.length * 12.50).toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100">
                    Ver Todo el Historial
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeView === 'finanzas' && (
            <div className="flex flex-col items-center justify-center h-96 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <DollarSign size={48} className="mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-slate-600">Módulo Financiero</h3>
              <p>Detalle de ingresos y gastos.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
