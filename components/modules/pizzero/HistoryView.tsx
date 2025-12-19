import { Order } from '@/lib/types';
import { AlertTriangle, CheckCircle, History } from 'lucide-react';

interface HistoryViewProps {
  orders: Order[];
}

export default function HistoryView({ orders }: HistoryViewProps) {
  const doneOrders = orders.filter(o => o.estado === 'listo_para_servir' || o.estado === 'entregado' || o.estado === 'cancelado');

  return (
    <div className="h-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col animate-in slide-in-from-right-4 duration-300">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <History size={20} className="text-slate-400" /> Historial del Turno
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white sticky top-0 z-10 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 border-b border-slate-100">ID</th>
              <th className="px-6 py-4 border-b border-slate-100">Cliente</th>
              <th className="px-6 py-4 border-b border-slate-100">Items</th>
              <th className="px-6 py-4 border-b border-slate-100">Hora</th>
              <th className="px-6 py-4 border-b border-slate-100">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-sm font-medium text-slate-600">
            {doneOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-300">
                    <History size={32} className="mb-2 opacity-50" />
                    <p className="font-bold">No hay historial en este turno</p>
                  </div>
                </td>
              </tr>
            ) : (
              doneOrders.map((order: any, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-slate-400">#{order.id.slice(-4)}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{order.cliente}</td>
                  <td className="px-6 py-4">{order.items.length} items ({order.items[0]?.nombre} {order.items.length > 1 && '...'})</td>
                  <td className="px-6 py-4 font-mono text-slate-400">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-6 py-4">
                    {order.estado === 'cancelado' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100">
                        <AlertTriangle size={12} /> Fallido / Mermado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                        <CheckCircle size={12} /> Completado
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
