"use client";

import { auth } from "@/lib/firebase";
import { Order } from "@/lib/types";
import { signOut } from "firebase/auth";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Crosshair,
  Map,
  MapPin,
  Minus,
  Navigation,
  Phone,
  Plus
} from "lucide-react";
import { useState } from "react";

// EXTENDED MOCK DATA
const MOCK_DELIVERY_ORDERS: Order[] = [
  {
    id: "402",
    cliente: "Jane Doe",
    tipo: "delivery",
    direccion: "123 Main St, Apt 4B",
    items: [{ id: "p1", nombre: "Pizza Pepperoni", cantidad: 1, precio: 15, estado: "en_delivery" }],
    total: 25,
    estado: "en_delivery",
    pagado: true,
    createdAt: new Date(),
  },
  {
    id: "405",
    cliente: "John Smith",
    tipo: "delivery",
    direccion: "456 Oak Avenue",
    items: [{ id: "p2", nombre: "Pizza Hawaiana", cantidad: 2, precio: 30, estado: "listo_para_servir" }],
    total: 30,
    estado: "listo_para_servir", // "Ready" state for delivery driver to pick up
    pagado: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: "411",
    cliente: "Acme Corp",
    tipo: "delivery",
    direccion: "789 Pine Lane, Suite 200",
    items: [{ id: "p3", nombre: "Vegetariana", cantidad: 3, precio: 45, estado: "listo_para_servir" }],
    total: 45,
    estado: "listo_para_servir",
    pagado: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 20),
  },
  {
    id: "105",
    cliente: "Carlos López",
    tipo: "delivery",
    direccion: "Calle Falsa 123",
    items: [{ id: "p4", nombre: "Pizza Hawaiana", cantidad: 2, precio: 30, estado: "entregado" }],
    total: 30,
    estado: "entregado",
    pagado: true,
    createdAt: new Date(Date.now() - 3600000),
  },
  // Adding more completed for UI match
  { id: "099", cliente: "Ana B.", tipo: "delivery", direccion: "Centro", items: [], total: 20, estado: "entregado", pagado: true, createdAt: new Date() },
  { id: "098", cliente: "Luis G.", tipo: "delivery", direccion: "Norte", items: [], total: 20, estado: "entregado", pagado: true, createdAt: new Date() },
];

export default function DashboardDelivery() {
  const [orders, setOrders] = useState<Order[]>(MOCK_DELIVERY_ORDERS);
  const [activeTab, setActiveTab] = useState<'transit' | 'ready' | 'completed'>('transit');

  const inTransit = orders.filter(o => o.estado === 'en_delivery');
  const ready = orders.filter(o => o.estado === 'listo_para_servir');
  const completed = orders.filter(o => o.estado === 'entregado');

  const activeOrder = inTransit[0]; // For demo, assume first 'en_delivery' is the active one

  const handleLogout = async () => {
    await signOut(auth);
  };

  const markAsDelivered = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, estado: "entregado", pagado: true } : o));
    // If we just delivered the active one, maybe switch tab or show success?
    alert("¡Entrega Confirmada!");
  };

  const pickUpOrder = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, estado: "en_delivery" } : o));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-800">

      {/* SIDEBAR (Left Panel) */}
      <aside className="w-full max-w-[480px] flex flex-col h-full bg-white border-r border-slate-200 z-20 shadow-2xl shrink-0 relative">

        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-200 text-xs font-bold">
              PD
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-900">PizzaOps Delivery</h2>
              <p className="text-slate-500 text-xs font-medium">Ruta #802 • Norte</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center justify-center size-10 rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
              <Bell size={20} />
            </button>
            <button onClick={handleLogout} className="size-10 rounded-full border border-slate-200 overflow-hidden hover:border-red-200 transition-colors">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" className="w-full h-full object-cover" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto flex flex-col bg-slate-50">

          {/* Stats Row */}
          <div className="p-6 pb-2 space-y-6 bg-white border-b border-slate-100">
            <div className="flex gap-3">
              <div className="flex grow basis-0 flex-col items-center gap-1">
                <div className="flex w-full h-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xl font-bold font-mono tracking-widest text-slate-800">04</p>
                </div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Hr</p>
              </div>
              <div className="flex grow basis-0 flex-col items-center gap-1">
                <div className="flex w-full h-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xl font-bold font-mono tracking-widest text-slate-800">12</p>
                </div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Min</p>
              </div>
              <div className="flex grow basis-0 flex-col items-center gap-1">
                <div className="flex w-full h-12 items-center justify-center rounded-xl bg-red-50 border border-red-100">
                  <p className="text-red-600 text-xl font-bold font-mono tracking-widest">30</p>
                </div>
                <p className="text-red-600 text-[10px] font-bold uppercase tracking-wider">Sec</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 rounded-2xl p-4 bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle size={16} className="text-slate-400" />
                  <p className="text-slate-500 text-xs font-bold uppercase">Entregados</p>
                </div>
                <p className="text-slate-800 text-2xl font-bold">{completed.length}</p>
              </div>
              <div className="flex flex-col gap-1 rounded-2xl p-4 bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={16} className="text-slate-400" />
                  <p className="text-slate-500 text-xs font-bold uppercase">Avg Tiempo</p>
                </div>
                <p className="text-slate-800 text-2xl font-bold">18m</p>
              </div>
            </div>
          </div>

          {/* Sticky Tabs */}
          <div className="px-6 py-4 sticky top-0 bg-slate-50/95 backdrop-blur-sm z-10 border-b border-transparent">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('transit')}
                className={`flex h-9 items-center justify-center gap-x-2 rounded-full px-4 transition-all shadow-sm text-sm font-bold whitespace-nowrap ${activeTab === 'transit' ? 'bg-red-600 text-white shadow-red-200' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}
              >
                En Ruta ({inTransit.length})
              </button>
              <button
                onClick={() => setActiveTab('ready')}
                className={`flex h-9 items-center justify-center gap-x-2 rounded-full px-4 transition-all shadow-sm text-sm font-bold whitespace-nowrap ${activeTab === 'ready' ? 'bg-red-600 text-white shadow-red-200' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}
              >
                Listos ({ready.length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`flex h-9 items-center justify-center gap-x-2 rounded-full px-4 transition-all shadow-sm text-sm font-bold whitespace-nowrap ${activeTab === 'completed' ? 'bg-red-600 text-white shadow-red-200' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}
              >
                Completos ({completed.length})
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="p-6 space-y-4 pt-0">

            {activeTab === 'transit' && activeOrder && (
              <div className="relative group animate-in slide-in-from-left-4 duration-500">
                {/* Indicator Line */}
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1.5 h-20 bg-red-600 rounded-r-full shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>

                {/* Active Card */}
                <div className="flex flex-col gap-4 rounded-3xl bg-white border-2 border-red-100 p-5 shadow-xl shadow-red-100/50 relative overflow-hidden ring-1 ring-red-50">
                  <div className="absolute -top-10 -right-10 size-40 bg-red-50 rounded-full blur-3xl opacity-50"></div>

                  <div className="flex justify-between items-start z-10">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold uppercase tracking-wide shadow-sm animate-pulse">Destino Actual</span>
                        <span className="text-slate-400 text-xs font-bold">#{activeOrder.id}</span>
                      </div>
                      <h3 className="text-slate-900 text-xl font-bold leading-tight">{activeOrder.direccion}</h3>
                      <p className="text-slate-500 text-sm mt-1 flex items-center gap-1 font-medium">
                        <MapPin size={14} /> {activeOrder.cliente} • 1.2km
                      </p>
                    </div>
                    <div className="size-12 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0">
                      <Navigation size={24} />
                    </div>
                  </div>

                  <div className="flex gap-2 items-center mt-2 z-10">
                    <button
                      onClick={() => markAsDelivered(activeOrder.id)}
                      className="flex-1 cursor-pointer flex items-center justify-center h-12 rounded-full bg-red-600 text-white gap-2 text-sm font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95"
                    >
                      <CheckCircle size={18} /> Confirmar Entrega
                    </button>
                    <button className="size-12 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-slate-50 hover:text-slate-600 transition-colors shadow-sm">
                      <Phone size={20} />
                    </button>
                    <button className="size-12 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm">
                      <AlertTriangle size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Items List based on Tab */}
            {(activeTab === 'transit' ? inTransit.slice(1) : activeTab === 'ready' ? ready : completed).map((order, idx) => (
              <div key={order.id} className="flex flex-col gap-4 rounded-3xl bg-white p-5 border border-slate-200 shadow-sm hover:border-slate-300 transition-all group animate-in fade-in duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${activeTab === 'completed' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        {order.estado.replace(/_/g, ' ')}
                      </span>
                      <span className="text-slate-400 text-xs font-medium">#{order.id}</span>
                    </div>
                    <h3 className="text-slate-900 text-lg font-bold leading-tight group-hover:text-red-600 transition-colors">{order.direccion || 'Retiro en Local'}</h3>
                    <p className="text-slate-500 text-sm mt-1">{order.cliente}</p>
                  </div>
                  <div className="size-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold text-sm">
                    {idx + (activeTab === 'transit' ? 2 : 1)}
                  </div>
                </div>

                {activeTab === 'ready' && (
                  <button onClick={() => pickUpOrder(order.id)} className="w-full h-10 mt-2 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-black transition-colors">
                    Iniciar Ruta
                  </button>
                )}
              </div>
            ))}

            {((activeTab === 'transit' && inTransit.length === 0) || (activeTab === 'ready' && ready.length === 0)) && (
              <div className="text-center py-12 opacity-50">
                <Map size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="text-slate-400 font-medium">No hay pedidos en esta sección</p>
              </div>
            )}

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <button className="w-full h-12 rounded-full border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-center gap-2 shadow-sm">
            <Map size={18} className="text-red-600" /> Optimizar Ruta
          </button>
        </div>
      </aside>

      {/* MAP AREA (Right Panel) */}
      <main className="flex-1 relative bg-slate-200 overflow-hidden group">
        {/* Map Background (Static Image with Filter) */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-[10s] group-hover:scale-105"
          style={{
            backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDagACG-M2HOY415CI-JmELtPSN3R_8XrC0FvQ81k9QRSKEUOEXhRYKq8oasFuZMITNAEEnEPW5fPAJUk4z48YADOSwnvDBFcKOU_JNGwjOW1NWD7AKpGa1kLLdpVqloCBm6nPw1ZbzkQsY3w0z4X-eOHdsR1ya_VE1W5kmyTtHeGk3-P6eAlWSoQZuUOZpDEdSojwcpIBQa4wUKsdYF5QN2RIZ0YcK6wg4vo4naN_HtMjq2S4VpwRvGydGP5SJvsOiXVyfTd0nHKw")',
            filter: 'grayscale(100%) invert(100%) contrast(0.9)',
            opacity: 0.8
          }}
        ></div>

        {/* Gradient Overlay */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white/80 to-transparent pointer-events-none"></div>

        {/* GPS Status Pill */}
        <div className="absolute top-6 left-6 bg-white/90 backdrop-blur border border-slate-200 px-5 py-3 rounded-full flex items-center gap-4 shadow-xl z-10">
          <div className="flex items-center gap-2">
            <div className="size-2.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_#dc2626]"></div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">GPS Activo</span>
          </div>
          <div className="w-px h-4 bg-slate-300"></div>
          <span className="text-sm font-medium text-slate-600">Giro en <span className="font-bold text-red-600">200m</span></span>
        </div>

        {/* Map Controls */}
        <div className="absolute bottom-10 right-10 flex flex-col gap-2 z-10">
          <button className="size-12 rounded-full bg-white text-slate-700 border border-slate-200 shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors">
            <Plus size={24} />
          </button>
          <button className="size-12 rounded-full bg-white text-slate-700 border border-slate-200 shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors">
            <Minus size={24} />
          </button>
          <button className="size-12 rounded-full bg-red-600 text-white shadow-lg shadow-red-200 flex items-center justify-center mt-2 hover:bg-red-700 transition-transform hover:scale-105">
            <Crosshair size={24} />
          </button>
        </div>

        {/* Active Pin (Center) */}
        <div className="absolute top-[45%] left-[40%] flex flex-col items-center -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative size-16 flex items-center justify-center">
            <div className="absolute inset-0 bg-red-600/20 rounded-full animate-ping"></div>
            <div className="absolute inset-2 bg-red-600/30 rounded-full"></div>
            <div className="relative size-6 bg-white border-4 border-red-600 rounded-full shadow-lg z-10"></div>
          </div>
        </div>

        {/* Pins on Map */}
        {[
          { top: '35%', left: '55%', label: '1', active: true },
          { top: '60%', left: '65%', label: '2', active: false },
          { top: '20%', left: '30%', label: '3', active: false },
        ].map((pin, i) => (
          <div
            key={i}
            className={`absolute flex flex-col items-center -translate-x-1/2 -translate-y-full cursor-pointer z-10 transition-transform hover:scale-110 group/pin`}
            style={{ top: pin.top, left: pin.left, opacity: pin.active ? 1 : 0.6 }}
          >
            {pin.active && (
              <div className="bg-white px-3 py-1.5 rounded-lg border border-red-100 mb-2 shadow-xl opacity-0 group-hover/pin:opacity-100 transition-opacity absolute bottom-full whitespace-nowrap">
                <p className="text-xs font-bold text-slate-800">Próxima Parada</p>
                <p className="text-[10px] text-red-600 font-medium">1.2km • 5 min</p>
              </div>
            )}
            <div className="relative">
              <MapPin className={`drop-shadow-md ${pin.active ? 'text-red-600 w-12 h-12' : 'text-slate-400 w-10 h-10'}`} fill="currentColor" />
              <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-white font-bold ${pin.active ? 'text-[12px]' : 'text-[10px]'}`}>{pin.label}</span>
            </div>
          </div>
        ))}

        {/* Route Lines (SVG Overlay) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-sm opacity-60">
          <path d="M 520 440 L 710 350" fill="none" stroke="#dc2626" strokeDasharray="10 5" strokeLinecap="round" strokeWidth="4"></path>
          <path d="M 710 350 L 840 600" fill="none" stroke="#94a3b8" strokeDasharray="5 5" strokeOpacity="0.5" strokeWidth="3"></path>
        </svg>

      </main>
    </div>
  );
}
