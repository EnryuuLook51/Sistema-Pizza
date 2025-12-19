"use client";

import { useAuth } from "@/components/auth/ProveedorAutenticacion";
import { auth } from "@/lib/firebase";
import { Order, OrderStatus } from "@/lib/types";
import { signOut } from "firebase/auth";
import {
  ChevronDown,
  Clock,
  Grid, List,
  LogOut,
  Search,
  User as UserIcon
} from "lucide-react";
import { useEffect, useState } from "react";
import NewOrderPanel from "../modules/atencion/NewOrderPanel";
import POSView from "../modules/atencion/POSView";
import SalonView from "../modules/atencion/SalonView";

import PaymentModal from "../modules/atencion/PaymentModal";

// MOCK DATA
const MOCK_ORDERS: Order[] = [
  // ... (mock data remains same, simplified here for brevity, assume full array)
  {
    id: "101",
    cliente: "Mesa 4",
    tipo: "mesa",
    mesa: "4",
    items: [
      { id: "p1", nombre: "Pizza Pepperoni", cantidad: 2, precio: 24 },
      { id: "b1", nombre: "Coca-Cola", cantidad: 2, precio: 4 }
    ],
    total: 28,
    estado: "listo_para_servir",
    pagado: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 12), // 12 min
  },
  {
    id: "102",
    cliente: "Juan Pérez",
    tipo: "llevar",
    items: [{ id: "p2", nombre: "Pizza Hawaiana", cantidad: 1, precio: 12 }],
    total: 12,
    estado: "preparando",
    pagado: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "103",
    cliente: "Ana García",
    tipo: "delivery",
    direccion: "Av. Siempre Viva 123",
    items: [{ id: "p3", nombre: "Pizza Suprema", cantidad: 1, precio: 15 }],
    total: 15,
    estado: "en_delivery",
    pagado: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 25),
  },
  {
    id: "104",
    cliente: "Mesa 8",
    tipo: "mesa",
    mesa: "8",
    items: [{ id: "p4", nombre: "Pasta Carbonara", cantidad: 3, precio: 36 }],
    total: 36,
    estado: "preparando",
    pagado: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 8),
  }
];

export default function DashboardAtencion() {
  const { user, profile } = useAuth();
  const [viewMode, setViewMode] = useState<'POS' | 'SALON'>('POS');
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [currentTime, setCurrentTime] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);

  // ESTADO PARA MODAL DE PAGO
  const [orderToPay, setOrderToPay] = useState<Order | null>(null);

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const updateStatus = (id: string, newStatus: OrderStatus) => {
    setOrders(orders.map(o => o.id === id ? { ...o, estado: newStatus } : o));
  };

  // Abre el modal de pago
  const handleRequestPayment = (id: string) => {
    const order = orders.find(o => o.id === id);
    if (order) setOrderToPay(order);
  };

  // Callback exitoso del modal
  const handlePaymentConfirmed = (method: 'Efectivo' | 'Tarjeta') => {
    if (orderToPay) {
      setOrders(orders.map(o => o.id === orderToPay.id ? { ...o, pagado: true } : o));
      setOrderToPay(null);
    }
  };

  const handleCreateOrder = (newOrder: Order) => {
    setOrders([newOrder, ...orders]);
  };

  const toggleView = (mode: 'POS' | 'SALON') => {
    setViewMode(mode);
    setShowViewMenu(false);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans overflow-hidden">

      {/* HEADER TOP-LEVEL */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 z-30 shadow-sm relative">
        <div className="flex items-center gap-6">
          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-xl text-white shadow-lg shadow-red-200">
              <span className="material-symbols-outlined text-xl font-bold">🍕​</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">Pizzería Claren'z</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Gestión de Pedidos</p>
            </div>
          </div>

          {/* VIEW SWITCHER TRIGGER */}
          <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

          <div className="relative">
            <button
              onClick={() => setShowViewMenu(!showViewMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-700 font-bold group"
            >
              <span className="text-lg md:text-xl tracking-tight group-hover:text-red-600 transition-colors">
                {viewMode === 'POS' ? 'Control de Caja' : 'Control de Salón'}
              </span>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${showViewMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* DROPDOWN MENU PARA CAMBIAR VISTA */}
            {showViewMenu && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-2 animate-in fade-in zoom-in-95 duration-200 z-50">
                <p className="text-xs font-bold text-slate-400 uppercase px-3 py-2">Seleccionar Vista</p>
                <button
                  onClick={() => toggleView('POS')}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold transition-all ${viewMode === 'POS' ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <div className={`p-1.5 rounded-md ${viewMode === 'POS' ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                    <List size={16} />
                  </div>
                  <div>
                    <p>Vista Caja</p>
                    <p className="text-[10px] font-medium opacity-60">Para cobrar y crear pedidos</p>
                  </div>
                </button>
                <button
                  onClick={() => toggleView('SALON')}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold transition-all ${viewMode === 'SALON' ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <div className={`p-1.5 rounded-md ${viewMode === 'SALON' ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                    <Grid size={16} />
                  </div>
                  <div>
                    <p>Vista Salón</p>
                    <p className="text-[10px] font-medium opacity-60">Mapa de mesas y servicio</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative w-64 hidden xl:block">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input type="text" placeholder="Buscar pedido..." className="w-full bg-slate-100 border-transparent focus:bg-white focus:border-red-200 focus:ring-2 focus:ring-red-100 rounded-lg pl-10 pr-4 py-2 text-sm font-medium transition-all outline-none" />
          </div>

          <div className="hidden md:flex items-center gap-2 text-slate-400 font-mono text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            <Clock size={16} />
            <span className="font-bold text-slate-600">{currentTime}</span>
          </div>

          {/* Perfil */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-3 rounded-full border border-transparent hover:border-slate-200 transition-all group"
            >
              <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-slate-100 group-hover:border-red-200 transition-all">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="text-slate-400" size={18} />
                )}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-700 leading-none">{profile?.nombre || user?.email?.split('@')[0]}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{profile?.rol || 'Staff'}</p>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in zoom-in-95 duration-200 z-50">
                <div className="px-4 py-3 border-b border-slate-100 mb-2">
                  <p className="text-xs text-slate-500 font-medium">Cuenta activa</p>
                  <p className="font-bold text-slate-800 truncate text-sm">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-bold flex items-center gap-3 transition-colors"
                >
                  <LogOut size={16} /> Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL + SIDEBAR (Solo en POS) */}
      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR: NUEVO PEDIDO (Solo visible en MODO CAJA) */}
        {viewMode === 'POS' && (
          <aside className="hidden lg:block w-[380px] shrink-0 h-full overflow-hidden border-r border-slate-200 bg-white animate-in slide-in-from-left duration-300">
            <NewOrderPanel onCreate={handleCreateOrder} />
          </aside>
        )}

        {/* AREA DE TRABAJO */}
        <main className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
          <div className="max-w-[1600px] mx-auto h-full">
            {viewMode === 'POS' ? (
              <POSView orders={orders} onUpdateStatus={updateStatus} onRequestPayment={handleRequestPayment} />
            ) : (
              <SalonView orders={orders} onUpdateStatus={updateStatus} />
            )}
          </div>
        </main>
      </div>

      {/* MODAL PAGO */}
      {orderToPay && (
        <PaymentModal
          order={orderToPay}
          onClose={() => setOrderToPay(null)}
          onConfirmPayment={handlePaymentConfirmed}
        />
      )}
    </div>
  );
}
