import { auth } from "@/lib/firebase";
import { Order, OrderStatus } from "@/lib/types";
import { signOut } from "firebase/auth";
import { AlertCircle, CheckCircle, ChefHat, Clock, Flame, LogOut } from "lucide-react";
import { useState } from "react";

// MOCK DATA PARA COCINA
// ... (omitted)

export default function DashboardPizzero() {
  const [orders, setOrders] = useState<Order[]>(MOCK_KITCHEN_ORDERS);

  const updateStatus = (id: string, newStatus: OrderStatus) => {
    setOrders(orders.map(o => o.id === id ? { ...o, estado: newStatus } : o));
  };

  const getElapsedTime = (date: any) => {
    const start = date instanceof Date ? date : date.toDate();
    const diff = Math.floor((Date.now() - start.getTime()) / 60000);
    return diff;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      {/* HEADER TIPO KDS (Kitchen Display System) */}
      <header className="flex justify-between items-center mb-6 px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
        <div className="flex items-center gap-3">
          <ChefHat className="text-orange-500" size={32} />
          <div>
            <h1 className="text-2xl font-black tracking-wider uppercase">Pizzaiolo OS</h1>
            <p className="text-xs text-gray-400">Pantalla de Producción</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex gap-4 text-sm font-mono">
            <div className="bg-slate-900 px-3 py-1 rounded border border-slate-700">
              PENDIENTES: <span className="text-red-400 font-bold">{orders.filter(o => o.estado === 'pendiente').length}</span>
            </div>
            <div className="bg-slate-900 px-3 py-1 rounded border border-slate-700">
              EN HORNO: <span className="text-orange-400 font-bold">{orders.filter(o => o.estado === 'preparando').length}</span>
            </div>
          </div>
          <button
            onClick={() => signOut(auth)}
            className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
            title="Cerrar Sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* KANBAN BOARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-120px)]">

        {/* COLUMNA 1: NUEVOS / PENDIENTES */}
        <div className="bg-slate-800/50 rounded-xl border border-dashed border-slate-700 flex flex-col">
          <h2 className="text-xl font-bold p-4 text-center border-b border-slate-700 flex items-center justify-center gap-2">
            <AlertCircle className="text-red-500" /> Por Hacer
          </h2>
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            {orders.filter(o => o.estado === 'pendiente').map(order => (
              <KitchenCard
                key={order.id}
                order={order}
                minutes={getElapsedTime(order.createdAt)}
                onAction={() => updateStatus(order.id, 'preparando')}
                actionLabel="COCINAR"
                actionColor="bg-orange-600 hover:bg-orange-700"
              />
            ))}
          </div>
        </div>

        {/* COLUMNA 2: EN HORNO / PREPARANDO */}
        <div className="bg-slate-800/50 rounded-xl border border-dashed border-slate-700 flex flex-col">
          <h2 className="text-xl font-bold p-4 text-center border-b border-slate-700 flex items-center justify-center gap-2">
            <Flame className="text-orange-500 animate-pulse" /> En Horno
          </h2>
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            {orders.filter(o => o.estado === 'preparando').map(order => (
              <KitchenCard
                key={order.id}
                order={order}
                minutes={getElapsedTime(order.createdAt)}
                onAction={() => updateStatus(order.id, 'listo_para_servir')}
                actionLabel="TERMINAR"
                actionColor="bg-green-600 hover:bg-green-700"
              />
            ))}
          </div>
        </div>

        {/* COLUMNA 3: LISTOS (HISTORIAL RECIENTE) */}
        <div className="bg-slate-800/50 rounded-xl border border-dashed border-slate-700 flex flex-col opacity-80">
          <h2 className="text-xl font-bold p-4 text-center border-b border-slate-700 flex items-center justify-center gap-2">
            <CheckCircle className="text-green-500" /> Listos / Servidos
          </h2>
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            {orders.filter(o => o.estado === 'listo_para_servir').map(order => (
              <div key={order.id} className="bg-black/40 p-4 rounded-lg border-l-4 border-green-500">
                <div className="flex justify-between">
                  <span className="font-bold text-lg">#{order.id}</span>
                  <span className="text-green-400 font-mono text-xs">LISTO</span>
                </div>
                <p className="text-gray-400 text-sm mt-1">{order.items.length} items</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function KitchenCard({ order, minutes, onAction, actionLabel, actionColor }: { order: Order, minutes: number, onAction: () => void, actionLabel: string, actionColor: string }) {
  // Alerta visual si tarda mucho
  const isLate = minutes > 20;

  return (
    <div className={`bg-white text-gray-900 rounded-lg overflow-hidden shadow-lg ${isLate ? 'ring-4 ring-red-500' : ''}`}>
      <div className={`p-3 flex justify-between items-center ${isLate ? 'bg-red-100' : 'bg-gray-100'} border-b`}>
        <span className="font-black text-xl">#{order.id}</span>
        <div className="flex items-center gap-1 font-mono font-bold">
          <Clock size={16} />
          {minutes}m
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <p className="font-bold text-lg text-blue-800">
            {order.tipo === 'mesa' ? `MESA ${order.mesa}` : `CLIENTE: ${order.cliente}`}
          </p>
          <span className="text-xs uppercase font-bold bg-gray-200 px-2 py-0.5 rounded text-gray-600">
            {order.tipo}
          </span>
        </div>

        <ul className="space-y-2 mb-6">
          {order.items.map((item, idx) => (
            <li key={idx} className="flex justify-between items-center text-lg border-b border-gray-100 pb-1">
              <span className="font-bold">{item.cantidad}x</span>
              <span className="flex-1 ml-2">{item.nombre}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={onAction}
          className={`w-full py-4 rounded font-black text-white text-xl tracking-widest transition-transform active:scale-95 ${actionColor}`}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
