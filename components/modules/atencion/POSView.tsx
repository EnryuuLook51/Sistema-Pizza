"use client";

import { Order, OrderStatus } from "@/lib/types";
import { CheckCircle, ChefHat, Clock, MapPin, ShoppingBag, Truck, Utensils } from "lucide-react";

interface POSViewProps {
  orders: Order[];
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  onRequestPayment: (id: string) => void;
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-slate-300 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
      <ChefHat size={32} className="mb-2 opacity-20" />
      <span className="font-bold text-sm">{text}</span>
    </div>
  );
}

export default function POSView({ orders, onUpdateStatus, onRequestPayment }: POSViewProps) {

  const getOrderIcon = (type: string) => {
    switch (type) {
      case 'mesa': return <Utensils size={14} />;
      case 'delivery': return <Truck size={14} />;
      default: return <ShoppingBag size={14} />;
    }
  };

  const getOrderLabel = (type: string) => {
    switch (type) {
      case 'mesa': return 'Mesa';
      case 'delivery': return 'Delivery';
      default: return 'Llevar';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-hidden">

      {/* 1. POR COBRAR */}
      <div className="flex flex-col bg-slate-100 rounded-2xl border border-slate-200/60 overflow-hidden h-full">
        <div className="p-4 bg-white border-b border-slate-100 flex justify-between items-center shadow-sm z-10">
          <h3 className="font-black text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> Por Cobrar
          </h3>
          <span className="bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600">
            {orders.filter(o => !o.pagado).length}
          </span>
        </div>
        <div className="p-4 overflow-y-auto space-y-3 flex-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          {orders.filter(o => !o.pagado).map(order => (
            <div key={order.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-all group relative">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider mb-2 ${order.tipo === 'mesa' ? 'bg-orange-50 text-orange-600' :
                    order.tipo === 'delivery' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                    {getOrderIcon(order.tipo)}
                    {order.mesa ? `MESA ${order.mesa}` : getOrderLabel(order.tipo)}
                  </span>
                  <h4 className="font-bold text-slate-800 text-base leading-tight">{order.cliente}</h4>
                </div>
                <span className="text-xs font-mono bg-slate-50 px-2 py-1 rounded text-slate-400 font-medium">#{order.id}</span>
              </div>

              <div className="border-t border-slate-50 my-3 pt-3">
                <div className="flex flex-col gap-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm text-slate-600">
                      <span>{item.cantidad}× {item.nombre.split('+')[0]}</span>
                      <span className="text-slate-400 font-medium">${item.precio}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-2">
                <span className="font-black text-xl text-slate-800">${order.total}</span>
                <button
                  onClick={() => onRequestPayment(order.id)}
                  className="bg-slate-900 hover:bg-black text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all shadow-lg shadow-slate-200 active:scale-95"
                >
                  Cobrar
                </button>
              </div>
            </div>
          ))}
          {orders.filter(o => !o.pagado).length === 0 && <EmptyState text="Todo está cobrado" />}
        </div>
      </div>

      {/* 2. EN PROCESO */}
      <div className="flex flex-col bg-slate-100 rounded-2xl border border-slate-200/60 overflow-hidden h-full">
        <div className="p-4 bg-white border-b border-slate-100 flex justify-between items-center shadow-sm z-10">
          <h3 className="font-black text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span> En Cocina
          </h3>
          <span className="bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600">
            {orders.filter(o => o.estado === 'pendiente' || o.estado === 'preparando').length}
          </span>
        </div>
        <div className="p-4 overflow-y-auto space-y-3 flex-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          {orders.filter(o => o.estado === 'pendiente' || o.estado === 'preparando').map(order => (
            <div key={order.id} className="bg-white p-5 rounded-xl border-l-4 border-l-orange-500 border-y border-r border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-orange-50 px-2 py-1 rounded-bl-lg text-[10px] font-bold text-orange-600 uppercase flex items-center gap-1">
                <Clock size={10} /> Preparando
              </div>

              <div className="mb-2">
                <h4 className="font-bold text-slate-800">{order.cliente}</h4>
                <p className="text-xs text-slate-400 font-medium">Hace {Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)} min</p>
              </div>

              <div className="space-y-1">
                {order.items.map((item, idx) => (
                  <p key={idx} className="text-sm text-slate-600 font-medium">
                    {item.cantidad}× {item.nombre}
                  </p>
                ))}
              </div>
            </div>
          ))}
          {orders.filter(o => o.estado === 'pendiente' || o.estado === 'preparando').length === 0 && <EmptyState text="Cocina libre" />}
        </div>
      </div>

      {/* 3. LISTOS */}
      <div className="flex flex-col bg-slate-100 rounded-2xl border border-slate-200/60 overflow-hidden h-full">
        <div className="p-4 bg-white border-b border-slate-100 flex justify-between items-center shadow-sm z-10">
          <h3 className="font-black text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Listos
          </h3>
          <span className="bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600">
            {orders.filter(o => o.estado === 'listo_para_servir').length}
          </span>
        </div>
        <div className="p-4 overflow-y-auto space-y-3 flex-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          {orders.filter(o => o.estado === 'listo_para_servir').map(order => (
            <div key={order.id} className="bg-white p-5 rounded-xl border-2 border-green-500 shadow-xl shadow-green-100/50 transform hover:-translate-y-1 transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full text-green-600">
                    {order.tipo === 'delivery' ? <Truck size={20} /> : <Utensils size={20} />}
                  </div>
                  <div>
                    <h4 className="font-black text-lg text-slate-800 leading-none">{order.cliente}</h4>
                    {order.tipo === 'delivery' && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 font-bold uppercase">
                        <MapPin size={10} /> {order.direccion}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onUpdateStatus(order.id, order.tipo === 'delivery' ? 'en_delivery' : 'entregado')}
                className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg text-sm uppercase tracking-wide shadow-lg shadow-green-200 flex items-center justify-center gap-2"
              >
                <CheckCircle size={16} />
                {order.tipo === 'delivery' ? 'Enviar Delivery' : 'Entregar Cliente'}
              </button>
            </div>
          ))}
          {orders.filter(o => o.estado === 'listo_para_servir').length === 0 && <EmptyState text="Nada pendiente" />}
        </div>
      </div>
    </div>
  );
}
