import { Order, OrderStatus, Recipe } from '@/lib/types';
import {
  AlertTriangle,
  CheckCircle,
  ClipboardList,
  Clock,
  Flame,
  UtensilsCrossed
} from 'lucide-react';

// --- COMPONENTES AUXILIARES ---

function StatCard({ icon: Icon, label, value, trend, color }: any) {
  return (
    <div className="flex items-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className={`p-3 rounded-lg ${color} mr-4`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-0.5">{label}</p>
        <div className="flex items-center gap-2">
          <h3 className="text-2xl font-black text-slate-800">{value}</h3>
          {trend && <span className="text-xs font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{trend}</span>}
        </div>
      </div>
    </div>
  );
}

interface KDSBoardProps {
  orders: Order[];
  moveItem: (orderId: string, itemId: string, newState: OrderStatus) => void;
  onReportDefect: (data: { orderId: string, itemId: string }) => void;
  currentTime: Date;
  recipes: Recipe[];
}

export default function KDSBoard({ orders, moveItem, onReportDefect, currentTime, recipes }: KDSBoardProps) {

  // Aplanar Items para el tablero
  const allItems = orders.flatMap(order =>
    order.items.map(item => ({
      ...item,
      orderId: order.id,
      clientName: order.cliente,
      orderType: order.tipo,
      mesa: order.mesa,
      createdAt: order.createdAt // Fallback start time
    }))
  ).filter(i => i.estado !== 'listo_para_servir' && i.estado !== 'entregado' && i.estado !== 'cancelado');

  const prepItems = allItems.filter(i => i.estado === 'pendiente' || i.estado === 'preparando');
  const ovenItems = allItems.filter(i => i.estado === 'horno');
  const expoItems = allItems.filter(i => i.estado === 'en_corte');

  // Helper para formato mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper para card Item
  const KDSCard = ({ item, type }: { item: typeof allItems[0], type: 'PREP' | 'OVEN' | 'EXPO' }) => {
    const recipe = recipes.find(r => r.id === item.recipeId);

    // Determinar limites y tiempos
    let maxTime = 300; // Default 5 mins
    if (type === 'PREP') maxTime = recipe?.prepTime || 300;
    if (type === 'OVEN') maxTime = recipe?.cookTime || 300;
    if (type === 'EXPO') maxTime = recipe?.cutTime || 60; // Default 1 min envio

    const startTime = item.startTime || item.createdAt; // Si no tiene startTime (pendiente), usa createdAt
    const elapsedSeconds = Math.floor((currentTime.getTime() - new Date(startTime).getTime()) / 1000);
    const progress = Math.min((elapsedSeconds / maxTime) * 100, 100);

    // Color Coding Logic
    let cardColorClass = "bg-white border-slate-100";
    let timerColorClass = "text-slate-600 bg-slate-100";
    let textColorClass = "text-slate-800";
    let isLate = false;

    // Colores base de columna
    if (type === 'OVEN') cardColorClass = "bg-orange-50 border-orange-100";

    // Alertas de Tiempo
    if (elapsedSeconds > maxTime) {
      // LIMIT EXCEEDED -> BLACK
      cardColorClass = "bg-slate-900 border-slate-950 shadow-xl shadow-slate-900/20";
      timerColorClass = "text-red-500 bg-slate-800";
      textColorClass = "text-white";
      isLate = true;
    } else if (elapsedSeconds > maxTime * 0.8) {
      // WARNING -> RED
      cardColorClass = "bg-red-50 border-red-200 animate-pulse";
      timerColorClass = "text-red-700 bg-red-100";
      textColorClass = "text-red-900";
    }

    return (
      <div className={`rounded-xl border shadow-sm p-4 relative overflow-hidden transition-all ${cardColorClass}`}>
        {/* Progress Bar Line */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-200/50">
          <div
            className={`h-full transition-all duration-1000 ${isLate ? 'bg-red-600' : (type === 'OVEN' ? 'bg-orange-500' : 'bg-blue-500')}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="mt-2 flex justify-between items-start">
          <div className="flex-1">
            <h3 className={`font-black text-lg leading-tight uppercase ${textColorClass}`}>{item.nombre}</h3>
            <p className={`text-xs font-bold opacity-60 mt-1 uppercase ${textColorClass}`}>
              #{item.orderId.slice(-4)} • {item.orderType === 'mesa' ? `Mesa ${item.mesa}` : item.orderType}
            </p>
            {item.notas && (
              <p className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded mt-2 font-bold inline-block border border-yellow-100">
                ⚠️ {item.notas}
              </p>
            )}
          </div>
          <div className={`px-2 py-1 rounded-lg font-mono font-bold text-sm tracking-wider ${timerColorClass}`}>
            {formatTime(elapsedSeconds)}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onReportDefect({ orderId: item.orderId, itemId: item.id })}
            className={`p-2 rounded-lg transition-colors ${isLate ? 'bg-slate-800 text-slate-400 hover:text-red-500' : 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500'}`}
          >
            <AlertTriangle size={18} />
          </button>

          {type === 'PREP' && (
            item.estado === 'pendiente' ? (
              <button onClick={() => moveItem(item.orderId, item.id, 'preparando')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase rounded-lg py-2.5 shadow-lg shadow-blue-200/50">
                Comenzar
              </button>
            ) : (
              <button onClick={() => moveItem(item.orderId, item.id, 'horno')} className="flex-1 bg-slate-800 hover:bg-black text-white font-bold text-xs uppercase rounded-lg py-2.5 shadow-lg shadow-slate-400/50 flex justify-center items-center gap-2">
                <Flame size={16} className="text-orange-500" /> Al Horno
              </button>
            )
          )}

          {type === 'OVEN' && (
            <button onClick={() => moveItem(item.orderId, item.id, 'en_corte')} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs uppercase rounded-lg py-2.5 shadow-lg shadow-orange-200/50">
              Sacar del Horno
            </button>
          )}

          {type === 'EXPO' && (
            <button onClick={() => moveItem(item.orderId, item.id, 'listo_para_servir')} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase rounded-lg py-2.5 shadow-lg shadow-green-200/50 flex justify-center items-center gap-2">
              <CheckCircle size={16} /> Listo
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* HEADER METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        <StatCard icon={ClipboardList} label="Por Hacer" value={prepItems.length} color="bg-blue-100 text-blue-700" />
        <StatCard icon={Flame} label="En Horno" value={ovenItems.length} color="bg-orange-100 text-orange-700" />
        <StatCard icon={UtensilsCrossed} label="Expedición" value={expoItems.length} color="bg-yellow-100 text-yellow-700" />
        <StatCard icon={Clock} label="Demorados" value={allItems.filter(i => false).length} trend="Bajo Control" color="bg-slate-100 text-slate-700" />
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* MESA DE TRABAJO */}
        <div className="flex flex-col h-full bg-slate-100/50 rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-3 bg-white border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-black text-slate-700 text-xs uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Mesa de Trabajo
            </h3>
            <span className="text-xs font-bold bg-slate-100 px-2 py-0.5 rounded-full">{prepItems.length}</span>
          </div>
          <div className="p-2 space-y-2 overflow-y-auto flex-1 bg-slate-50/50">
            {prepItems.map(item => <KDSCard key={`${item.orderId}-${item.id}`} item={item} type="PREP" />)}
          </div>
        </div>

        {/* HORNO */}
        <div className="flex flex-col h-full bg-orange-50/30 rounded-2xl border border-orange-100 overflow-hidden">
          <div className="p-3 bg-white border-b border-orange-100 flex justify-between items-center">
            <h3 className="font-black text-orange-700 text-xs uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span> Horno
            </h3>
            <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{ovenItems.length}</span>
          </div>
          <div className="p-2 space-y-2 overflow-y-auto flex-1 bg-gradient-to-b from-orange-50/50 to-white">
            {ovenItems.map(item => <KDSCard key={`${item.orderId}-${item.id}`} item={item} type="OVEN" />)}
          </div>
        </div>

        {/* EXPEDICION */}
        <div className="flex flex-col h-full bg-slate-100/50 rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-3 bg-white border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-black text-slate-700 text-xs uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Expedíción
            </h3>
            <span className="text-xs font-bold bg-slate-100 px-2 py-0.5 rounded-full">{expoItems.length}</span>
          </div>
          <div className="p-2 space-y-2 overflow-y-auto flex-1 bg-slate-50/50">
            {expoItems.map(item => <KDSCard key={`${item.orderId}-${item.id}`} item={item} type="EXPO" />)}
          </div>
        </div>
      </div>
    </div>
  );
}
