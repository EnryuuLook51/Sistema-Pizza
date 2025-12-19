"use client";

import DeliverySidebar from "@/components/modules/delivery/DeliverySidebar";
import { MOCK_DELIVERY_ORDERS } from "@/data/mock-delivery";
import { auth } from "@/lib/firebase";
import { Order } from "@/lib/types";
import { signOut } from "firebase/auth";
import { Menu, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

const DeliveryMap = dynamic(() => import('@/components/modules/delivery/DeliveryMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-200 animate-pulse flex items-center justify-center text-slate-400">Cargando Mapa...</div>
});

export default function DashboardDelivery() {
  const [orders, setOrders] = useState<Order[]>(MOCK_DELIVERY_ORDERS);
  const [activeTab, setActiveTab] = useState<'transit' | 'ready' | 'completed'>('transit');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-800 relative">

      {/* SIDEBAR Wrapper - Mobile Slide-over / Desktop Static */}
      <div className={`
        fixed inset-y-0 left-0 z-[5000] w-[85vw] md:w-auto md:static md:inset-auto md:translate-x-0
        transform transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <DeliverySidebar
          orders={orders}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          onMarkDelivered={markAsDelivered}
          onPickUpOrder={pickUpOrder}
        />

        {/* Mobile Close Handle (Optional overlay click could go here too) */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-red-50 hover:text-red-600"
        >
          <X size={20} />
        </button>
      </div>

      {/* Mobile Overlay Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[4000] md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* MAP AREA (Right Panel) */}
      <main className="flex-1 relative h-full w-full bg-slate-200 overflow-hidden">

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden absolute top-6 left-6 z-[4000] size-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-700 active:scale-95 transition-transform"
        >
          <Menu size={24} />
        </button>

        <DeliveryMap
          orders={activeTab === 'completed' ? completed : (activeTab === 'ready' ? ready : inTransit)}
          activeOrderId={activeOrder?.id}
        />

        {/* Gradient Overlay for integration */}
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white/90 to-transparent pointer-events-none z-[4000]"></div>
      </main>
    </div>
  );
}
