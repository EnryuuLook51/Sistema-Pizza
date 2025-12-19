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

import { useState } from 'react';
import { DetailModal } from './DetailModal';

// ... (StatCard helper remains)

interface KDSBoardProps {
  orders: Order[];
  moveItem: (orderId: string, itemId: string, newState: OrderStatus) => void;
  onReportDefect: (data: { orderId: string, itemId: string }) => void;
  currentTime: Date;
  recipes: Recipe[];
}

export default function KDSBoard({ orders, moveItem, onReportDefect, currentTime, recipes }: KDSBoardProps) {
  const [selectedItem, setSelectedItem] = useState<(typeof allItems[0]) | null>(null);

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

    // Determine effective start time for this stage
    let stageStartTime = item.startTime || item.createdAt;

    if (type === 'PREP') {
      stageStartTime = item.timestamps?.['preparando'] || item.startTime || item.createdAt;
    } else if (type === 'OVEN') {
      stageStartTime = item.timestamps?.['horno'] || new Date();
    } else if (type === 'EXPO') {
      stageStartTime = item.timestamps?.['en_corte'] || new Date();
    }

    const startDate = stageStartTime ? new Date(stageStartTime) : new Date();
    const elapsedSeconds = Math.floor((currentTime.getTime() - startDate.getTime()) / 1000); // Floor to avoid decimals
    const progress = Math.min((elapsedSeconds / maxTime) * 100, 100);

    // Color Coding Logic - PREMIUM & VIBRANT
    let cardBaseClass = "bg-white border-slate-100 shadow-sm hover:shadow-lg";
    let progressBarColor = "bg-blue-500";
    let timerClass = "text-slate-600 bg-slate-100";
    let titleColor = "text-slate-900";
    let isLate = false;

    // Theme variations per column
    if (type === 'OVEN') {
      progressBarColor = "bg-orange-500";
    } else if (type === 'EXPO') {
      progressBarColor = "bg-green-500";
    }

    // Alertas de Tiempo - HIGH IMPACT
    if (elapsedSeconds > maxTime) {
      // CRITICAL -> DARK MODE CARD
      cardBaseClass = "bg-slate-900 border-slate-800 shadow-xl shadow-red-900/20";
      progressBarColor = "bg-red-600";
      timerClass = "text-white bg-red-600 animate-pulse font-bold";
      titleColor = "text-white";
      isLate = true;
    } else if (elapsedSeconds > maxTime * 0.8) {
      // WARNING -> RED BORDER
      cardBaseClass = "bg-white border-red-300 ring-1 ring-red-100 shadow-md";
      progressBarColor = "bg-red-500";
      timerClass = "text-red-700 bg-red-50 font-bold";
    }

    return (
      <div
        onClick={() => setSelectedItem(item)}
        className={`group rounded-2xl border p-4 relative overflow-hidden transition-all duration-300 cursor-pointer active:scale-[0.98] ${cardBaseClass}`}
      >
        {/* Progress Bar Background */}
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
          <div className={`h-full transition-all duration-1000 ${progressBarColor}`} style={{ width: `${progress}%` }}></div>
        </div>

        <div className="mt-3 flex justify-between items-start">
          <div className="flex-1 min-w-0 pr-2">
            {/* Metadatos Superiores */}
            <div className={`flex items-center gap-2 text-[10px] font-black tracking-widest uppercase mb-1 ${isLate ? 'text-slate-400' : 'text-slate-400'}`}>
              <span>#{item.orderId.slice(-4)}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>{item.orderType === 'mesa' ? `Mesa ${item.mesa}` : item.orderType}</span>
            </div>

            {/* Título Principal */}
            <h3 className={`font-black text-lg leading-tight mb-2 truncate ${titleColor}`}>{item.nombre}</h3>

            {/* Badges de Excepción - MORE PROMINENT */}
            <div className="flex flex-wrap gap-2">
              {item.notas && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-100 border border-yellow-200 text-[10px] font-bold text-yellow-800 uppercase tracking-tight">
                  ⚠️ {item.notas}
                </span>
              )}
              {item.removedIngredients && item.removedIngredients.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-100 border border-red-200 text-[10px] font-bold text-red-800 uppercase tracking-tight">
                  🚫 Sin {item.removedIngredients.length} Ingr.
                </span>
              )}
            </div>
          </div>

          {/* Timer - BIGGER */}
          <div className={`px-3 py-1.5 rounded-lg font-mono text-lg font-bold tracking-tight shadow-inner ${timerClass}`}>
            {formatTime(elapsedSeconds)}
          </div>
        </div>

        {/* Action Buttons - MODERNIZED */}
        <div className="mt-5 flex gap-2" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onReportDefect({ orderId: item.orderId, itemId: item.id })}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${isLate ? 'bg-slate-800 text-slate-400 hover:text-red-400' : 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500'}`}
          >
            <AlertTriangle size={18} />
          </button>

          {type === 'PREP' && (
            item.estado === 'pendiente' ? (
              <button onClick={() => moveItem(item.orderId, item.id, 'preparando')} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all active:translate-y-0.5">
                Comenzar
              </button>
            ) : (
              <button onClick={() => moveItem(item.orderId, item.id, 'horno')} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-slate-300 hover:shadow-slate-400 transition-all active:translate-y-0.5 flex justify-center items-center gap-2">
                <Flame size={16} className="text-orange-500" /> Al Horno
              </button>
            )
          )}

          {type === 'OVEN' && (
            <button onClick={() => moveItem(item.orderId, item.id, 'en_corte')} className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all active:translate-y-0.5">
              Sacar del Horno
            </button>
          )}

          {type === 'EXPO' && (
            <button onClick={() => moveItem(item.orderId, item.id, 'listo_para_servir')} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all active:translate-y-0.5 flex justify-center items-center gap-2">
              <CheckCircle size={16} /> Listo
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col h-full gap-5">
        {/* HEADER METRICS - MODERN CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
          <StatCard icon={ClipboardList} label="Por Hacer" value={prepItems.length} color="bg-blue-50 text-blue-600" />
          <StatCard icon={Flame} label="En Horno" value={ovenItems.length} color="bg-orange-50 text-orange-600" />
          <StatCard icon={UtensilsCrossed} label="Expedición" value={expoItems.length} color="bg-emerald-50 text-emerald-600" />
          <StatCard icon={Clock} label="Rendimiento" value="98%" trend="Óptimo" color="bg-slate-50 text-slate-600" />
        </div>

        {/* COLUMNS CONTAINER */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* COLUMNA 1: MESA DE TRABAJO (AZUL) */}
          <div className="flex flex-col h-full bg-slate-50/50 rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-white/80 backdrop-blur-sm border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><ClipboardList size={20} /></div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Mesa de Trabajo</h3>
                  <p className="text-[10px] font-bold text-slate-400">Preparación Inicial</p>
                </div>
              </div>
              <span className="text-xs font-black bg-slate-900 text-white px-2.5 py-1 rounded-lg">{prepItems.length}</span>
            </div>
            <div className="p-3 space-y-3 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200">
              {prepItems.map(item => <KDSCard key={`${item.orderId}-${item.id}`} item={item} type="PREP" />)}
            </div>
          </div>

          {/* COLUMNA 2: HORNO (NARANJA/CALIENTE) */}
          <div className="flex flex-col h-full bg-orange-50/30 rounded-3xl border border-orange-100 overflow-hidden shadow-sm relative">
            {/* Heat Gradient Overlay */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-500 z-20"></div>

            <div className="p-4 bg-white/80 backdrop-blur-sm border-b border-orange-100 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><Flame size={20} /></div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Horno de Piedra</h3>
                  <p className="text-[10px] font-bold text-orange-400">Cocción Activa</p>
                </div>
              </div>
              <span className="text-xs font-black bg-orange-500 text-white px-2.5 py-1 rounded-lg shadow-lg shadow-orange-200">{ovenItems.length}</span>
            </div>
            <div className="p-3 space-y-3 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-orange-100">
              {ovenItems.map(item => <KDSCard key={`${item.orderId}-${item.id}`} item={item} type="OVEN" />)}
            </div>
          </div>

          {/* COLUMNA 3: EXPEDICIÓN (VERDE) */}
          <div className="flex flex-col h-full bg-slate-50/50 rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-white/80 backdrop-blur-sm border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><UtensilsCrossed size={20} /></div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Expedición</h3>
                  <p className="text-[10px] font-bold text-slate-400">Corte y Empaque</p>
                </div>
              </div>
              <span className="text-xs font-black bg-emerald-600 text-white px-2.5 py-1 rounded-lg shadow-lg shadow-emerald-200">{expoItems.length}</span>
            </div>
            <div className="p-3 space-y-3 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200">
              {expoItems.map(item => <KDSCard key={`${item.orderId}-${item.id}`} item={item} type="EXPO" />)}
            </div>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          recipe={recipes.find(r => r.id === selectedItem.recipeId)}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
}
