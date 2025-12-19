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
  CreditCard,
  DollarSign,
  LayoutDashboard,
  LogOut,
  PieChart,
  Pizza,
  TrendingUp,
  Users,
  Wallet
} from "lucide-react";
import { useState } from "react";
import StandardsView from "../modules/pizzero/StandardsView";
import FinanzasView from "../modules/propietario/FinanzasView";
import MenuGestionView from "../modules/propietario/MenuGestionView";
import UsuariosView from "../modules/propietario/UsuariosView";

export default function DashboardPropietario() {
  const { user, profile } = useAuth();
  const { orders } = useOrders(); // For metrics
  const [activeView, setActiveView] = useState<'global' | 'finanzas' | 'usuarios' | 'estandares' | 'menu'>('global');
  const [hoveredBar, setHoveredBar] = useState<{ day: string, val: number } | null>(null);
  const [chartView, setChartView] = useState<'weekly' | 'daily'>('weekly');

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
    { id: 'menu', label: 'Gestión Menú', icon: Pizza },
    { id: 'usuarios', label: 'Personal', icon: Users },
    { id: 'estandares', label: 'Estándares', icon: Building2 },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">

      {/* SIDEBAR */}
      <aside className="w-72 flex-shrink-0 flex flex-col border-r border-slate-200 bg-white hidden lg:flex z-20">
        <div className="flex h-full flex-col justify-between p-6">
          <div className="flex flex-col gap-6">
            {/* Brand */}
            <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
              <div className="bg-red-600 p-2 rounded-lg text-white shadow-md shadow-red-200">
                <PieChart size={24} />
              </div>
              <h1 className="text-slate-900 text-xl font-bold tracking-tight">Pizzería Claren'z <span className="text-red-600 text-sm block font-medium">Propietario</span></h1>
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
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-left group ${isActive
                      ? 'bg-red-50 text-red-600 border border-red-100 shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                  >
                    <Icon size={20} className={isActive ? 'text-red-600' : 'text-slate-400 group-hover:text-slate-600'} />
                    <p className={`text-sm font-medium leading-normal ${isActive ? 'font-bold' : ''}`}>{item.label}</p>
                    {isActive && <ChevronRight size={16} className="ml-auto text-red-400" />}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="size-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 font-bold shadow-sm">
                {profile?.nombre?.[0] || 'A'}
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-bold text-slate-900">{profile?.nombre || 'Admin'}</p>
                <p className="text-xs text-slate-500">Propietario</p>
              </div>
            </div>
            <button onClick={() => signOut(auth)} className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all text-sm font-medium">
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
            <div className="bg-slate-50">
              <UsuariosView />
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
                    <h3 className="text-3xl font-bold text-slate-900 mt-1">${(orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString() && o.estado !== 'cancelado').reduce((acc, o) => acc + (o.total || o.items.length * 12.50), 0)).toFixed(2)}</h3>
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
                    <h3 className="text-3xl font-bold text-slate-900 mt-1">
                      ${(() => {
                        const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString() && o.estado !== 'cancelado');
                        const totalSales = todayOrders.reduce((acc, o) => acc + (o.total || o.items.length * 12.50), 0);
                        return todayOrders.length > 0 ? (totalSales / todayOrders.length).toFixed(2) : "0.00";
                      })()}
                    </h3>
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
                  <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Ventas {chartView === 'weekly' ? 'Semanales' : 'Diarias'}</h3>
                      <p className="text-slate-500 text-sm">
                        {chartView === 'weekly' ? 'Rendimiento últimos 7 días' : 'Desglose por horas (Hoy)'}
                      </p>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                      <button
                        onClick={() => setChartView('weekly')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${chartView === 'weekly' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Semanal
                      </button>
                      <button
                        onClick={() => setChartView('daily')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${chartView === 'daily' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Diario
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 flex items-end justify-between h-64 gap-2 relative z-0" onMouseLeave={() => setHoveredBar(null)}>
                    {/* Background Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                      <div className="border-t border-slate-900 w-full dashed"></div>
                      <div className="border-t border-slate-900 w-full dashed"></div>
                      <div className="border-t border-slate-900 w-full dashed"></div>
                      <div className="border-t border-slate-900 w-full dashed"></div>
                    </div>

                    {(() => {
                      const today = new Date();
                      let salesData: { day: string, val: number, fullDate?: Date }[] = [];

                      if (chartView === 'weekly') {
                        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                        const last7Days = Array.from({ length: 7 }, (_, i) => {
                          const d = new Date(today);
                          d.setDate(d.getDate() - (6 - i));
                          return d;
                        });

                        salesData = last7Days.map(date => {
                          const dayStr = date.toDateString();
                          const dailyTotal = orders
                            .filter(o => o.createdAt && new Date(o.createdAt).toDateString() === dayStr && o.estado !== 'cancelado')
                            .reduce((sum, o) => sum + (o.total || o.items.reduce((s, i) => s + i.precio * i.cantidad, 0)), 0);
                          return { day: days[date.getDay()], val: dailyTotal, fullDate: date };
                        });
                      } else {
                        // DAILY 0-23
                        const todayStr = today.toDateString();
                        salesData = Array.from({ length: 24 }, (_, hour) => {
                          const hourlyTotal = orders
                            .filter(o => {
                              if (o.estado === 'cancelado') return false;
                              const d = new Date(o.createdAt);
                              return d.toDateString() === todayStr && d.getHours() === hour;
                            })
                            .reduce((sum, o) => sum + (o.total || o.items.reduce((s, i) => s + i.precio * i.cantidad, 0)), 0);
                          return { day: `${hour}h`, val: hourlyTotal, fullDate: today };
                        });
                      }

                      const realMax = Math.max(...salesData.map(d => d.val));
                      const maxSale = realMax > 0 ? realMax : 100;

                      return salesData.map((data, idx) => {
                        const height = (data.val / maxSale) * 100;
                        const isHovered = hoveredBar?.day === data.day;

                        return (
                          <div
                            key={idx}
                            className="flex-1 flex flex-col items-center gap-3 group cursor-pointer relative z-10"
                            onMouseEnter={() => setHoveredBar({ day: data.day, val: data.val })}
                          >
                            <div className="w-full bg-slate-50 rounded-lg relative overflow-visible h-full flex items-end">
                              <div
                                className={`w-full rounded-t-lg transition-all duration-300 shadow-sm ${data.val > 0 ? 'bg-red-600' : 'bg-slate-100'} ${isHovered ? 'bg-red-500 scale-105 shadow-md' : ''}`}
                                style={{ height: `${height}%`, minHeight: data.val > 0 ? '4px' : '4px' }}
                              >
                              </div>

                              {/* Hover Tooltip */}
                              {isHovered && (
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none transform -translate-y-1">
                                  <div className="text-[10px] text-slate-400 font-medium mb-0.5">{data.fullDate?.toLocaleDateString()}</div>
                                  ${data.val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                              )}
                            </div>
                            <span className={`text-xs font-bold ${data.fullDate?.toDateString() === today.toDateString() ? 'text-red-600' : 'text-slate-400'} group-hover:text-slate-600`}>
                              {data.day}
                            </span>
                          </div>
                        )
                      });
                    })()}
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
            <FinanzasView orders={orders} />
          )}

          {activeView === 'menu' && (
            <MenuGestionView />
          )}

        </div>
      </main>
    </div>
  );
}
