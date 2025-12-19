import { Order, UserProfile } from "@/lib/types";
import { User } from "firebase/auth";
import { Bell, CheckCircle, Clock, Map, MapPin, Phone, User as UserIcon } from "lucide-react";
import DeliveryTimer from "./DeliveryTimer";

interface DeliverySidebarProps {
  orders: Order[];
  activeTab: 'transit' | 'ready' | 'completed';
  setActiveTab: (tab: 'transit' | 'ready' | 'completed') => void;
  onLogout: () => void;
  onMarkDelivered: (id: string) => void;
  onPickUpOrder: (id: string) => void;
  user: User | null;
  profile: UserProfile | null;
}

export default function DeliverySidebar({
  orders,
  activeTab,
  setActiveTab,
  onLogout,
  onMarkDelivered,
  onPickUpOrder,
  user,
  profile
}: DeliverySidebarProps) {

  const inTransit = orders.filter(o => o.estado === 'en_delivery');
  const ready = orders.filter(o => o.estado === 'listo_para_servir');
  const completed = orders.filter(o => o.estado === 'entregado');

  const activeOrder = inTransit[0];

  // Filter for orders completed TODAY
  const todayStr = new Date().toDateString();
  const completedToday = completed.filter(o =>
    o.timestamps?.entregado && o.timestamps.entregado.toDateString() === todayStr
  );

  // Calculate Average Delivery Time (mins) for completed orders today
  let totalTime = 0;
  let countWithTime = 0;

  completedToday.forEach(order => {
    if (order.timestamps?.entregado && order.timestamps?.en_delivery) {
      const start = order.timestamps.en_delivery.getTime();
      const end = order.timestamps.entregado.getTime();
      const diffMins = (end - start) / (1000 * 60);

      // Filter out unreasonable times (e.g. negative or > 5 hours, though 5 hours is technically possible)
      if (diffMins > 0) {
        totalTime += diffMins;
        countWithTime++;
      }
    }
  });

  const avgMinutes = countWithTime > 0 ? totalTime / countWithTime : 0;

  return (
    <aside className="w-full md:w-[420px] flex flex-col h-full bg-white border-r border-slate-200 z-20 shadow-2xl shrink-0 relative overflow-hidden">

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-200 text-xs font-bold">
            PC
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-900">Pizzería Claren'z</h2>
            <p className="text-slate-500 text-xs font-medium">Panel de Reparto</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-center size-10 rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
            <Bell size={20} />
          </button>
          <button onClick={onLogout} className="size-10 rounded-full border border-slate-200 overflow-hidden hover:border-red-200 transition-colors flex items-center justify-center bg-slate-50">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="text-slate-400" />
            )}
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto flex flex-col bg-slate-50">

        {/* Stats Row (Real Data Only) */}
        <div className="p-6 pb-2 space-y-6 bg-white border-b border-slate-100">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1 rounded-2xl p-4 bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={16} className="text-slate-400" />
                <p className="text-slate-500 text-xs font-bold uppercase">Entregados Hoy</p>
              </div>
              <p className="text-slate-800 text-2xl font-bold">{completedToday.length}</p>
            </div>
            <div className="flex flex-col gap-1 rounded-2xl p-4 bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={16} className="text-slate-400" />
                <p className="text-slate-500 text-xs font-bold uppercase">Tiempo Prom.</p>
              </div>
              <p className="text-slate-800 text-2xl font-bold">{Math.round(avgMinutes)}m</p>
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
                      <span className="text-slate-400 text-xs font-bold">#{activeOrder.id.slice(-4)}</span>
                    </div>
                    <h3 className="text-slate-900 text-xl font-bold leading-tight">{activeOrder.direccion}</h3>
                    <p className="text-slate-500 text-sm mt-1 flex items-center gap-1 font-medium">
                      <MapPin size={14} /> {activeOrder.cliente}
                    </p>
                  </div>
                  {/* TIMER COMPONENT */}
                  <DeliveryTimer startTime={activeOrder.timestamps?.en_delivery} status={activeOrder.estado} />
                </div>

                <div className="flex gap-2 items-center mt-2 z-10">
                  <button
                    onClick={() => onMarkDelivered(activeOrder.id)}
                    className="flex-1 cursor-pointer flex items-center justify-center h-12 rounded-full bg-red-600 text-white gap-2 text-sm font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95"
                  >
                    <CheckCircle size={18} /> Confirmar Entrega
                  </button>
                  <a
                    href={activeOrder.telefono ? `tel:${activeOrder.telefono}` : undefined}
                    className={`size-12 rounded-full border border-slate-200 flex items-center justify-center transition-colors shadow-sm ${activeOrder.telefono ? 'bg-white text-green-600 hover:bg-green-50 hover:border-green-200 cursor-pointer' : 'bg-slate-50 text-slate-300 cursor-not-allowed'}`}
                    title={activeOrder.telefono || "Sin teléfono"}
                  >
                    <Phone size={20} />
                  </a>
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
                      {/* Humanize status */}
                      {order.estado === 'en_delivery' ? 'En Ruta' : order.estado === 'listo_para_servir' ? 'Listo' : 'Entregado'}
                    </span>
                    <span className="text-slate-400 text-xs font-medium">#{order.id.slice(-4)}</span>
                  </div>
                  <h3 className="text-slate-900 text-lg font-bold leading-tight group-hover:text-red-600 transition-colors">{order.direccion || 'Retiro en Local'}</h3>
                  <p className="text-slate-500 text-sm mt-1">{order.cliente}</p>
                </div>
                <div className="size-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold text-sm">
                  {idx + (activeTab === 'transit' ? 2 : 1)}
                </div>
              </div>

              {activeTab === 'ready' && (
                <button onClick={() => onPickUpOrder(order.id)} className="w-full h-10 mt-2 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-black transition-colors">
                  Iniciar Ruta
                </button>
              )}
            </div>
          ))}

          {((activeTab === 'transit' && inTransit.length === 0) || (activeTab === 'ready' && ready.length === 0) || (activeTab === 'completed' && completed.length === 0)) && (
            <div className="text-center py-12 opacity-50">
              <Map size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-slate-400 font-medium">No hay pedidos en esta sección</p>
            </div>
          )}

        </div>
      </div>
    </aside>
  );
}
