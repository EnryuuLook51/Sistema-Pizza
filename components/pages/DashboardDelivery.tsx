"use client";

import DeliverySidebar from "@/components/modules/delivery/DeliverySidebar";
import { MOCK_DELIVERY_ORDERS } from "@/data/mock-delivery";
import { auth } from "@/lib/firebase";
import { Order } from "@/lib/types";
import { signOut } from "firebase/auth";
import dynamic from "next/dynamic";
import { useState } from "react";

const DeliveryMap = dynamic(() => import('@/components/modules/delivery/DeliveryMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-200 animate-pulse flex items-center justify-center text-slate-400">Cargando Mapa...</div>
});

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
    alert("¡Entrega Confirmada!");
  };

  const pickUpOrder = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, estado: "en_delivery" } : o));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-800">

      {/* SIDEBAR */}
      <DeliverySidebar
        orders={orders}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onMarkDelivered={markAsDelivered}
        onPickUpOrder={pickUpOrder}
      />

      {/* MAP AREA (Right Panel) */}
      <main className="flex-1 relative bg-slate-200 overflow-hidden group border-l border-slate-200">
        <DeliveryMap
          orders={activeTab === 'completed' ? completed : (activeTab === 'ready' ? ready : inTransit)}
          activeOrderId={activeOrder?.id}
        />

        {/* Gradient Overlay for integration */}
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white/90 to-transparent pointer-events-none z-[4000]"></div>

        {/* GPS Status Pill */}
        <div className="absolute top-6 left-6 bg-white/90 backdrop-blur border border-slate-200 px-5 py-3 rounded-full flex items-center gap-4 shadow-xl z-[4000]">
          <div className="flex items-center gap-2">
            <div className="size-2.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_#dc2626]"></div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">GPS Activo</span>
          </div>
          <div className="w-px h-4 bg-slate-300"></div>
          <span className="text-sm font-medium text-slate-600">Giro en <span className="font-bold text-red-600">200m</span></span>
        </div>
      </main>
    </div>
  );
}
