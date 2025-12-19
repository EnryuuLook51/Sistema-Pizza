'use client';

import { useAuth } from "@/components/auth/ProveedorAutenticacion";
import { useOrders } from "@/hooks/useOrders";
import { auth } from "@/lib/firebase";
import { OrderStatus } from "@/lib/types";
import { signOut } from "firebase/auth";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Calendar,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Pizza,
  Search,
  Settings,
  Timer
} from "lucide-react";
import { useState } from "react";
import ReportsView from "../modules/gerente/ReportsView";

export default function DashboardGerente() {
  const { user, profile } = useAuth();
  const { orders } = useOrders();
  const [activeView, setActiveView] = useState<'dashboard' | 'pedidos' | 'tiempos' | 'defectos' | 'reportes'>('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pedidos', label: 'Pedidos', icon: Pizza },
    { id: 'tiempos', label: 'Tiempos', icon: Timer },
    { id: 'defectos', label: 'Defectos', icon: AlertTriangle },
    { id: 'reportes', label: 'Reportes', icon: BarChart3 },
  ];

  // METRICS CALCULATIONS
  const todayStr = new Date().toDateString();
  const activeOrders = orders.filter(o => o.estado !== 'entregado' && o.estado !== 'cancelado');

  // Kitchen Avg Time (Completed Today)
  const completedToday = orders.filter(o =>
    o.estado === 'entregado' &&
    o.timestamps?.entregado &&
    new Date(o.timestamps.entregado).toDateString() === todayStr
  );

  let totalKitchenTime = 0;
  let kitchenCount = 0;
  let onTimeCount = 0;

  completedToday.forEach(o => {
    // Check if we have prep start (preparando) and ready (listo_para_servir)
    if (o.timestamps?.preparando && o.timestamps?.listo_para_servir) {
      const start = new Date(o.timestamps.preparando).getTime();
      const end = new Date(o.timestamps.listo_para_servir).getTime();
      const mins = (end - start) / (1000 * 60);

      if (mins > 0 && mins < 180) { // Sanity check
        totalKitchenTime += mins;
        kitchenCount++;
        if (mins <= 15) onTimeCount++;
      }
    }
  });

  const avgKitchenTime = kitchenCount > 0 ? totalKitchenTime / kitchenCount : 0;
  const onTimePercentage = kitchenCount > 0 ? Math.round((onTimeCount / kitchenCount) * 100) : 100;

  // Defects (Cancelled or flagged today)
  const defectsToday = orders.filter(o => {
    const isToday = o.createdAt && new Date(o.createdAt).toDateString() === todayStr;
    const isCancelled = o.estado === 'cancelado';
    const hasDefectNote = o.items.some(i => i.notas?.toLowerCase().includes('defecto') || i.notas?.toLowerCase().includes('error'));
    return isToday && (isCancelled || hasDefectNote);
  });

  // Helper for status colors
  const stateColors = (state: OrderStatus) => {
    switch (state) {
      case 'pendiente': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'preparando': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'en_horno': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'listo_para_servir': return 'bg-green-50 text-green-600 border-green-100';
      case 'en_delivery': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'entregado': return 'bg-slate-100 text-slate-500 border-slate-200';
      case 'cancelado': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">

      {/* SIDEBAR */}
      <aside className="w-72 flex-shrink-0 flex flex-col border-r border-slate-200 bg-white hidden lg:flex z-20">
        <div className="flex h-full flex-col justify-between p-6">
          <div className="flex flex-col gap-6">
            {/* User Profile */}
            <div className="flex gap-4 items-center pb-6 border-b border-slate-100">
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 shadow-sm ring-2 ring-slate-100"
                style={{ backgroundImage: user?.photoURL ? `url(${user.photoURL})` : 'none' }}>
                {!user?.photoURL && <div className="h-full w-full bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-400">G</div>}
              </div>
              <div className="flex flex-col">
                <h1 className="text-slate-900 text-base font-bold leading-normal">{profile?.nombre || user?.email?.split('@')[0]}</h1>
                <p className="text-slate-500 text-xs font-medium leading-normal">Gerente General</p>
              </div>
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
            <button onClick={() => signOut(auth)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
              <LogOut size={20} />
              <span className="text-sm font-medium">Cerrar Sesión</span>
            </button>
            <div className="px-3">
              <p className="text-xs text-slate-400 text-center opacity-60">v2.4.0 © PizzaOps</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-slate-50 relative overflow-hidden">

        {/* HEADER */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 px-6 py-4 bg-white/95 backdrop-blur-sm z-10 sticky top-0">
          <div className="flex items-center gap-4 lg:gap-8">
            <button className="lg:hidden text-slate-700">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="size-8 text-red-600 flex items-center justify-center bg-red-50 rounded-lg">
                <Pizza size={20} />
              </div>
              <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight hidden sm:block">Dashboard Operativo</h2>
            </div>
            {/* Search Bar */}
            <div className="hidden md:flex items-center h-10 w-64 bg-slate-100 rounded-lg px-3 focus-within:ring-2 focus-within:ring-red-100 transition-all">
              <Search size={18} className="text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Buscar..."
                className="bg-transparent border-none outline-none text-sm w-full text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button className="relative flex items-center justify-center rounded-lg size-10 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-red-600 transition-colors shadow-sm">
              <Bell size={20} />
              <span className="absolute top-2 right-2 size-2 bg-red-600 rounded-full animate-pulse ring-2 ring-white"></span>
            </button>
            <button className="flex items-center justify-center rounded-lg size-10 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors shadow-sm">
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* DYNAMIC VIEW CONTENT */}
        {activeView === 'reportes' ? (
          <ReportsView />
        ) : activeView === 'dashboard' ? (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth animate-in fade-in zoom-in-95 duration-300">
            <div className="max-w-[1200px] mx-auto flex flex-col gap-8">

              {/* Dashboard Summary Header */}
              <div className="flex flex-wrap justify-between items-end gap-4">
                <div className="flex flex-col gap-1">
                  <h1 className="text-slate-900 text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Resumen Operativo</h1>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar size={18} />
                    <p className="text-sm font-medium">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    <span className="mx-1 text-slate-300">•</span>
                    <span className="flex size-2.5 rounded-full bg-green-500 ring-2 ring-green-100"></span>
                    <p className="text-sm font-medium text-slate-900">Tienda Operativa</p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Active Orders */}
                <div className="flex flex-col gap-3 rounded-xl p-5 bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="absolute -top-2 -right-2 p-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                    <Pizza size={80} className="text-red-600" />
                  </div>
                  <div className="flex items-center justify-between z-10">
                    <p className="text-slate-500 text-sm font-semibold uppercase tracking-wide">Pedidos Activos</p>
                    <span className="size-8 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                      <Pizza size={20} />
                    </span>
                  </div>
                  <div className="z-10">
                    <p className="text-slate-900 text-3xl font-bold leading-tight">{activeOrders.length}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp size={18} className="text-green-600" />
                      <p className="text-green-600 text-sm font-semibold">En proceso</p>
                    </div>
                  </div>
                </div>

                {/* Avg Kitchen Time */}
                <div className="flex flex-col gap-3 rounded-xl p-5 bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="absolute -top-2 -right-2 p-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                    <Timer size={80} className="text-slate-800" />
                  </div>
                  <div className="flex items-center justify-between z-10">
                    <p className="text-slate-500 text-sm font-semibold uppercase tracking-wide">Promedio Cocina</p>
                    <span className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                      <Timer size={20} />
                    </span>
                  </div>
                  <div className="z-10">
                    <p className="text-slate-900 text-3xl font-bold leading-tight">{Math.round(avgKitchenTime)}m</p>
                    <div className="flex items-center gap-1 mt-2">
                      <p className="text-slate-500 text-sm font-semibold">Últimos completados</p>
                    </div>
                  </div>
                </div>

                {/* On Time % (Simulated based on standard 15m) */}
                <div className="flex flex-col gap-3 rounded-xl p-5 bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="absolute -top-2 -right-2 p-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                    <Bell size={80} className="text-slate-800" />
                  </div>
                  <div className="flex items-center justify-between z-10">
                    <p className="text-slate-500 text-sm font-semibold uppercase tracking-wide">A Tiempo (&lt;15m)</p>
                    <span className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                      <Bell size={20} />
                    </span>
                  </div>
                  <div className="z-10">
                    <p className="text-slate-900 text-3xl font-bold leading-tight">{onTimePercentage}%</p>
                    <div className="flex items-center gap-1 mt-2">
                      <div className={`text-sm font-semibold ${onTimePercentage > 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {onTimePercentage > 90 ? 'Excelente' : onTimePercentage > 75 ? 'Regular' : 'Atención'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Defects */}
                <div className="flex flex-col gap-3 rounded-xl p-5 bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="absolute -top-2 -right-2 p-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                    <AlertTriangle size={80} className="text-red-600" />
                  </div>
                  <div className="flex items-center justify-between z-10">
                    <p className="text-slate-500 text-sm font-semibold uppercase tracking-wide">Defectos (Hoy)</p>
                    <span className="size-8 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                      <AlertTriangle size={20} />
                    </span>
                  </div>
                  <div className="z-10">
                    <p className="text-slate-900 text-3xl font-bold leading-tight">{defectsToday.length}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <p className="text-slate-500 text-sm font-semibold">Reportados</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Hourly Production Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Producción por Hora</h3>
                      <p className="text-slate-500 text-sm">Pizzas completadas hoy</p>
                    </div>
                    <BarChart3 className="text-slate-300" />
                  </div>
                  <div className="flex items-end justify-between h-48 gap-2">
                    {[12, 18, 10, 25, 30, 22, 15, 8].map((val, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="w-full bg-slate-100 rounded-t-lg relative overflow-hidden h-full">
                          <div
                            className="absolute bottom-0 w-full bg-red-600 rounded-t-lg transition-all duration-500 group-hover:bg-red-500"
                            style={{ height: `${(val / 30) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold text-slate-400">{12 + idx}:00</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Defects Distribution */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Distribución de Defectos</h3>
                      <p className="text-slate-500 text-sm">Categorías frecuentes</p>
                    </div>
                    <PieChart className="text-slate-300" />
                  </div>
                  <div className="flex flex-col gap-4">
                    {[
                      { label: 'Borde Quemado', val: 40, color: 'bg-red-600' },
                      { label: 'Ingr. Incorrectos', val: 25, color: 'bg-red-400' },
                      { label: 'Retraso Cocina', val: 20, color: 'bg-red-300' },
                      { label: 'Temp. Incorrecta', val: 15, color: 'bg-slate-300' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                          <span>{item.label}</span>
                          <span>{item.val}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.val}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                      <AlertTriangle className="text-red-600 flex-shrink-0" size={20} />
                      <div>
                        <p className="text-sm font-bold text-red-900">Alerta de Calidad</p>
                        <p className="text-xs text-red-700">Revisar temperatura del Horno 2 (Tendencia alta)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Monitoring Table */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-slate-900 text-xl font-bold leading-tight">Monitoreo en Vivo</h2>
                  <button onClick={() => setActiveView('pedidos')} className="text-red-600 hover:text-red-800 text-sm font-bold hover:underline">Ver Todo</button>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                          <th className="p-4 font-semibold">Pedido ID</th>
                          <th className="p-4 font-semibold">Cliente</th>
                          <th className="p-4 font-semibold">Estado</th>
                          <th className="p-4 font-semibold">Inicio</th>
                          <th className="p-4 font-semibold text-right">Mesa/Dirección</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-slate-100">
                        {activeOrders.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">No hay pedidos activos en este momento.</td>
                          </tr>
                        ) : activeOrders.slice(0, 5).map(order => (
                          <tr key={order.id} className="group hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-bold text-slate-900">#{order.id.slice(-4)}</td>
                            <td className="p-4 text-slate-800">{order.cliente}</td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${stateColors(order.estado)}`}>
                                {order.estado.replace(/_/g, ' ').toUpperCase()}
                              </span>
                            </td>
                            <td className="p-4 text-slate-600 font-mono">
                              {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </td>
                            <td className="p-4 text-right text-slate-600">
                              {order.mesa ? `Mesa ${order.mesa}` : order.direccion || 'Para llevar'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <p className="text-lg font-bold">Vista en construcción: {navItems.find(i => i.id === activeView)?.label}</p>
          </div>
        )}

      </main>
    </div>
  );
}
