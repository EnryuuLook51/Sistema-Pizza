"use client";

import { Order, OrderStatus } from "@/lib/types";
import { CheckCircle, ChefHat, Utensils } from "lucide-react";

// TABLES CONFIG (Layout del Salón)
const TABLES_LAYOUT = [
  { id: "1", x: 20, y: 20, seats: 2 },
  { id: "2", x: 50, y: 20, seats: 4 },
  { id: "3", x: 80, y: 20, seats: 2 },
  { id: "4", x: 20, y: 50, seats: 4 },
  { id: "5", x: 50, y: 50, seats: 6 },
  { id: "6", x: 80, y: 50, seats: 4 },
  { id: "7", x: 20, y: 80, seats: 2 },
  { id: "8", x: 50, y: 80, seats: 4 },
  { id: "9", x: 80, y: 80, seats: 8 },
];

function getElapsedTime(date: any) {
  const start = date instanceof Date ? date : new Date(date);
  return Math.floor((Date.now() - start.getTime()) / 60000);
}

interface SalonViewProps {
  orders: Order[];
  onUpdateStatus: (id: string, status: OrderStatus) => void;
}

export default function SalonView({ orders, onUpdateStatus }: SalonViewProps) {
  // Helper para buscar orden activa en una mesa
  const getActiveOrder = (tableId: string) => {
    return orders.find(o => o.mesa === tableId && o.estado !== 'entregado' && o.estado !== 'en_delivery');
  };

  return (
    <div className="flex h-full gap-6">
      {/* LADO IZQUIERDO: Mapa del Local */}
      <div className="flex-1 bg-slate-100 rounded-3xl border-2 border-slate-200 relative overflow-hidden shadow-inner">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-1 rounded-b-xl text-xs font-bold uppercase tracking-widest shadow-lg z-10">
          Entrada Principal
        </div>

        {/* Renderizado de Mesas */}
        <div className="w-full h-full relative">
          {TABLES_LAYOUT.map(table => {
            const activeOrder = getActiveOrder(table.id);
            const isReady = activeOrder?.estado === 'listo_para_servir';

            return (
              <div
                key={table.id}
                className={`absolute rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer hover:scale-105 shadow-xl border-2
                                    ${!activeOrder ? 'bg-white border-slate-200 text-slate-400' : ''}
                                    ${activeOrder && !isReady ? 'bg-slate-50 border-slate-300 text-slate-800' : ''}
                                    ${isReady ? 'bg-white border-green-500 ring-4 ring-green-100 z-20' : ''}
                                `}
                style={{
                  left: `${table.x}%`,
                  top: `${table.y}%`,
                  width: '120px',
                  height: '100px',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <span className="text-2xl font-black mb-1 opacity-80">{table.id}</span>

                {!activeOrder && <span className="text-[10px] font-bold uppercase tracking-wide opacity-50">Libre</span>}

                {activeOrder && !isReady && (
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] bg-slate-200 px-2 rounded-full font-bold text-slate-600 mb-1">
                      Esperando
                    </span>
                    <span className="text-[10px] text-slate-400">{getElapsedTime(activeOrder.createdAt)}m</span>
                  </div>
                )}

                {isReady && (
                  <div className="absolute -top-3 -right-3">
                    <span className="flex size-8 bg-green-500 rounded-full items-center justify-center text-white shadow-lg animate-bounce">
                      <Utensils size={16} />
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* LADO DERECHO: Sidebar Mesero */}
      <div className="w-80 flex flex-col gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-slate-700 border-b border-slate-100 pb-2">Acciones Rápidas</h3>

          {orders.filter(o => o.estado === 'listo_para_servir' && o.tipo === 'mesa').map(order => (
            <div key={order.id} className="bg-green-50 border border-green-100 p-4 rounded-xl flex justify-between items-center group">
              <div>
                <p className="font-bold text-green-900 text-lg">Mesa {order.mesa}</p>
                <p className="text-green-700 text-xs">¡Pizza Lista!</p>
              </div>
              <button
                onClick={() => onUpdateStatus(order.id, 'entregado')}
                className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 shadow-lg shadow-green-200 transition-all active:scale-95"
              >
                <CheckCircle size={20} />
              </button>
            </div>
          ))}

          {orders.filter(o => o.estado === 'listo_para_servir' && o.tipo === 'mesa').length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">
              <ChefHat size={32} className="mx-auto mb-2 opacity-20" />
              No hay platos por servir
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
