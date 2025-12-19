"use client";

import { useAuth } from "@/components/auth/ProveedorAutenticacion";
import DefectModal from '@/components/modules/pizzero/DefectModal';
import HistoryView from '@/components/modules/pizzero/HistoryView';
import KDSBoard from '@/components/modules/pizzero/KDSBoard';
import RecipesView from '@/components/modules/pizzero/RecipesView';
import StandardsView from '@/components/modules/pizzero/StandardsView';
import { auth } from "@/lib/firebase";
import { Order, OrderStatus, Recipe } from '@/lib/types';
import { signOut } from "firebase/auth";
import {
  BookOpen,
  ChefHat,
  Clock,
  History,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  User as UserIcon
} from 'lucide-react';
import { useEffect, useState } from 'react';

import recipesData from '@/data/recipes.json';

// --- MOCK DATA ---

const MOCK_RECIPES: Recipe[] = recipesData as Recipe[];

const INITIAL_ORDERS: Order[] = [
  {
    id: "4092",
    cliente: "Mesa 4",
    tipo: "mesa",
    items: [{
      id: "1", nombre: "Pizza Pepperoni Fam.", cantidad: 1, precio: 0, notas: "Sin orilla de queso",
      estado: 'preparando', recipeId: '1', startTime: new Date(Date.now() - 1000 * 120) // 2 min prep
    }],
    total: 0,
    estado: "preparando",
    pagado: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 9),
  },
  {
    id: "4095",
    cliente: "Juan Pérez",
    tipo: "llevar",
    items: [{
      id: "2", nombre: "Pizza Margarita", cantidad: 2, precio: 0,
      estado: 'pendiente', recipeId: '2'
    }],
    total: 0,
    estado: "pendiente",
    pagado: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 1),
  },
  {
    id: "4090",
    cliente: "Delivery #88",
    tipo: "delivery",
    items: [{
      id: "3", nombre: "Vegetariana", cantidad: 2, precio: 0,
      estado: 'horno', recipeId: '5', startTime: new Date(Date.now() - 1000 * 150) // 2.5 min in oven
    }],
    total: 0,
    estado: "horno",
    pagado: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: "4089",
    cliente: "Mesa 1",
    tipo: "mesa",
    items: [{
      id: "4", nombre: "4 Quesos", cantidad: 1, precio: 0,
      estado: 'en_corte', recipeId: '4', startTime: new Date(Date.now() - 1000 * 30) // 30s in cut
    }],
    total: 0,
    estado: "en_corte",
    pagado: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 20),
  }
];

// --- COMPONENTE PRINCIPAL ---

export default function DashboardPizzero() {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [activeTab, setActiveTab] = useState<'tablero' | 'recetas' | 'estandares' | 'historial'>('tablero');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDefectModal, setShowDefectModal] = useState<{ orderId: string, itemId: string } | null>(null); // Track specific item
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Reloj
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const moveItem = (orderId: string, itemId: string, newState: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const now = new Date();
        const updatedItems = o.items.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              estado: newState,
              startTime: now,
              timestamps: { ...item.timestamps, [newState]: now }
            };
          }
          return item;
        });

        // Optional: Update parent Order status based on items (e.g. if all done, order is done)
        return { ...o, items: updatedItems };
      }
      return o;
    }));
  };

  const handleDefect = (reason: string) => {
    if (showDefectModal) {
      moveItem(showDefectModal.orderId, showDefectModal.itemId, 'cancelado');
      setShowDefectModal(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">

      {/* HEADER CENTRALIZADO */}
      <header className="h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-30 relative">
        <div className="flex items-center gap-4 w-60">
          <div className="bg-red-600 p-2.5 rounded-xl text-white shadow-lg shadow-red-200">
            <ChefHat size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none text-slate-800 uppercase">Pizzaiolo OS</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Control de Cocina</p>
          </div>
        </div>

        <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-inner">
          {[
            { id: 'tablero', label: 'Tablero KDS', icon: LayoutDashboard },
            { id: 'recetas', label: 'Manual Recetas', icon: BookOpen },
            { id: 'estandares', label: 'Estándares', icon: ShieldCheck },
            { id: 'historial', label: 'Historial', icon: History },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id
                ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
            >
              <tab.icon size={16} className={activeTab === tab.id ? 'text-red-500' : ''} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex justify-end w-60 items-center gap-4">
          {/* Clock */}
          <div className="hidden md:flex items-center gap-2 text-slate-400 font-mono text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            <Clock size={16} />
            <span className="font-bold text-slate-600">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          {/* Profile */}
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
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{profile?.rol || 'Chef'}</p>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in zoom-in-95 duration-200 z-50">
                <div className="px-4 py-3 border-b border-slate-100 mb-2">
                  <p className="text-xs text-slate-500 font-medium">Cuenta activa</p>
                  <p className="font-bold text-slate-800 truncate text-sm">{user?.email}</p>
                </div>
                <button
                  onClick={() => signOut(auth)}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-bold flex items-center gap-3 transition-colors"
                >
                  <LogOut size={16} /> Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-hidden p-6 bg-slate-50/50">

        {activeTab === 'tablero' && (
          <KDSBoard
            orders={orders}
            moveItem={moveItem}
            onReportDefect={(data) => setShowDefectModal({ orderId: data.orderId, itemId: data.itemId })}
            currentTime={currentTime}
            recipes={MOCK_RECIPES}
          />
        )}

        {activeTab === 'recetas' && (
          <RecipesView recipes={MOCK_RECIPES} />
        )}

        {activeTab === 'estandares' && (
          <StandardsView />
        )}

        {activeTab === 'historial' && (
          <HistoryView orders={orders} />
        )}

      </main>

      {/* MODAL DEFECTOS */}
      {showDefectModal && (
        <DefectModal
          orderId={showDefectModal.orderId}
          onClose={() => setShowDefectModal(null)}
          onConfirm={handleDefect}
        />
      )}

    </div>
  );
}
