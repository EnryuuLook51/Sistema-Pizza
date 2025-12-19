import { OrderItem, Recipe } from '@/lib/types';
import { ChefHat, Clock, X } from 'lucide-react';

interface CustomDetailModalProps {
  item: OrderItem & { orderType: string; mesa?: string; clientName: string; orderId: string };
  recipe?: Recipe;
  onClose: () => void;
}

export function DetailModal({ item, recipe, onClose }: CustomDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white/20">

        {/* HEADER - GLASSY DARK */}
        <div className="bg-slate-950 text-white p-8 shrink-0 flex justify-between items-start relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
              <span className="bg-slate-800 px-2 py-1 rounded">#{item.orderId.slice(-4)}</span>
              <span>•</span>
              <span>{item.orderType === 'mesa' ? `Mesa ${item.mesa}` : item.clientName}</span>
            </div>
            <h2 className="text-4xl font-black uppercase leading-none tracking-tight">{item.nombre}</h2>
          </div>
          <button onClick={onClose} className="relative z-10 p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all active:scale-95 border border-white/5">
            <X size={24} className="text-slate-300" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 bg-slate-50">

          {/* ALERTS SECTION - HIGH CONTRAST */}
          {(item.notas || (item.removedIngredients && item.removedIngredients.length > 0)) && (
            <div className="flex flex-col gap-4">
              {item.notas && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 rounded-r-xl shadow-sm">
                  <h3 className="text-yellow-700 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                    ⚠️ Nota de Cocina
                  </h3>
                  <p className="text-xl font-bold text-slate-800 leading-snug">"{item.notas}"</p>
                </div>
              )}
              {item.removedIngredients && item.removedIngredients.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-xl shadow-sm">
                  <h3 className="text-red-700 font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                    🚫 Ingredientes Eliminados
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {item.removedIngredients.map(ing => (
                      <span key={ing} className="bg-white border border-red-100 text-red-600 px-3 py-1.5 rounded-lg font-bold text-sm shadow-sm">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RECIPE DETAILS */}
          {recipe ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* INGREDIENTS */}
              <div>
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-6 flex items-center gap-3 border-b border-slate-200 pb-3">
                  <div className="p-1.5 bg-red-100 rounded text-red-600"><ChefHat size={18} /></div>
                  Ingredientes
                </h3>
                <div className="space-y-3">
                  {recipe.ingredients.map((ing, idx) => {
                    const isRemoved = item.removedIngredients?.includes(ing.name);
                    return (
                      <div key={idx} className={`flex justify-between items-center p-4 rounded-xl border transition-all ${isRemoved ? 'bg-slate-100 border-transparent opacity-40' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <span className={`font-bold ${isRemoved ? 'line-through text-slate-400' : 'text-slate-700'}`}>{ing.name}</span>
                        {!isRemoved && <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold">{ing.amount}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* STEPS */}
              <div>
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-6 flex items-center gap-3 border-b border-slate-200 pb-3">
                  <div className="p-1.5 bg-blue-100 rounded text-blue-600"><Clock size={18} /></div>
                  Preparación
                </h3>
                <div className="space-y-6 relative pl-6 border-l-2 border-slate-200 ml-2">
                  {recipe.steps.map((step, idx) => (
                    <div key={idx} className="relative group">
                      <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-white border-2 border-blue-500 ring-4 ring-slate-50 group-hover:scale-110 transition-transform"></span>
                      <p className="text-slate-600 leading-relaxed font-medium text-base group-hover:text-slate-900 transition-colors">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300 border-2 border-dashed border-slate-200 rounded-3xl">
              <ChefHat size={64} className="mb-4 opacity-20" />
              <p className="font-medium">Sin receta detallada</p>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-6 bg-white border-t border-slate-200 text-center sticky bottom-0 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <button onClick={onClose} className="px-12 py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all hover:scale-[1.02] shadow-xl shadow-slate-900/10 w-full md:w-auto">
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
}
