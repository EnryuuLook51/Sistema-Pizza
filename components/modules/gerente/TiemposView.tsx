import { Order } from '@/lib/types';
import {
  Timer,
  TrendingDown,
  TrendingUp,
  Truck
} from 'lucide-react';

interface TiemposViewProps {
  orders: Order[];
}

export default function TiemposView({ orders }: TiemposViewProps) {
  const todayStr = new Date().toDateString();
  const completedToday = orders.filter(o =>
    o.estado === 'entregado' &&
    o.createdAt && new Date(o.createdAt).toDateString() === todayStr
  );

  // Calculate Metrics
  let totalPrepTime = 0;
  let totalDeliveryTime = 0;
  let prepCount = 0;
  let deliveryCount = 0;

  completedToday.forEach(o => {
    // Prep: Preparando -> Listo
    if (o.timestamps?.preparando && o.timestamps?.listo_para_servir) {
      const start = new Date(o.timestamps.preparando).getTime();
      const end = new Date(o.timestamps.listo_para_servir).getTime();
      totalPrepTime += (end - start) / 60000;
      prepCount++;
    }
    // Delivery: En Delivery -> Entregado
    /* Note: If En Delivery is missing, we might use Listo as start, but ideally check both */
    if (o.timestamps?.en_delivery && o.timestamps?.entregado) {
      const start = new Date(o.timestamps.en_delivery).getTime();
      const end = new Date(o.timestamps.entregado).getTime();
      totalDeliveryTime += (end - start) / 60000;
      deliveryCount++;
    }
  });

  const avgPrep = prepCount > 0 ? Math.round(totalPrepTime / prepCount) : 0;
  const avgDelivery = deliveryCount > 0 ? Math.round(totalDeliveryTime / deliveryCount) : 0;

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-in fade-in duration-300">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-8">

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900">Análisis de Tiempos</h1>
          <p className="text-slate-500 text-sm">Desglose de tiempos de preparación y entrega.</p>
        </div>

        {/* Big Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kitchen Card */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 p-6 opacity-5">
              <Timer size={120} className="text-orange-600" />
            </div>
            <div className="flex items-center gap-3 z-10">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                <Timer size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Cocina</h3>
                <p className="text-xs text-slate-500">Preparación a Expedición</p>
              </div>
            </div>
            <div className="z-10 mt-2">
              <span className="text-5xl font-black text-slate-900">{avgPrep}<span className="text-xl font-bold text-slate-400">m</span></span>
              <div className="flex items-center gap-2 mt-2 text-sm">
                <span className="flex items-center gap-1 font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                  <TrendingDown size={14} /> -1m
                </span>
                <span className="text-slate-500">vs ayer</span>
              </div>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-orange-500 h-full rounded-full" style={{ width: `${Math.min((avgPrep / 20) * 100, 100)}%` }}></div>
            </div>
            <p className="text-xs text-slate-400 text-right">Meta: 12m</p>
          </div>

          {/* Delivery Card */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 p-6 opacity-5">
              <Truck size={120} className="text-blue-600" />
            </div>
            <div className="flex items-center gap-3 z-10">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Truck size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delivery</h3>
                <p className="text-xs text-slate-500">Expedición a Entrega</p>
              </div>
            </div>
            <div className="z-10 mt-2">
              <span className="text-5xl font-black text-slate-900">{avgDelivery}<span className="text-xl font-bold text-slate-400">m</span></span>
              <div className="flex items-center gap-2 mt-2 text-sm">
                <span className="flex items-center gap-1 font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                  <TrendingUp size={14} /> +2m
                </span>
                <span className="text-slate-500">vs ayer</span>
              </div>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min((avgDelivery / 30) * 100, 100)}%` }}></div>
            </div>
            <p className="text-xs text-slate-400 text-right">Meta: 20m</p>
          </div>
        </div>

        {/* Detailed Timeline Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h3 className="font-bold text-slate-900">Desglose por Pedido (Hoy)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-900 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Recibido</th>
                  <th className="px-6 py-4 text-center">Prep (min)</th>
                  <th className="px-6 py-4 text-center">Delivery (min)</th>
                  <th className="px-6 py-4 text-center">Total (min)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completedToday.slice(0, 15).map(o => {
                  let prep = 0, del = 0, total = 0;
                  if (o.timestamps?.preparando && o.timestamps?.listo_para_servir) {
                    prep = Math.round((new Date(o.timestamps.listo_para_servir).getTime() - new Date(o.timestamps.preparando).getTime()) / 60000);
                  }
                  if (o.timestamps?.en_delivery && o.timestamps?.entregado) {
                    del = Math.round((new Date(o.timestamps.entregado).getTime() - new Date(o.timestamps.en_delivery).getTime()) / 60000);
                  }
                  if (o.createdAt && o.timestamps?.entregado) {
                    total = Math.round((new Date(o.timestamps.entregado).getTime() - new Date(o.createdAt).getTime()) / 60000);
                  }

                  return (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold">#{o.id.slice(-5)}</td>
                      <td className="px-6 py-4">{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded font-bold ${prep > 15 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                          {prep > 0 ? prep : (
                            // Fallback visuals for incomplete data
                            (o.timestamps?.listo_para_servir && o.createdAt) ?
                              Math.round((new Date(o.timestamps.listo_para_servir).getTime() - new Date(o.createdAt).getTime()) / 60000) : '-'
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded font-bold ${del > 25 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                          {del > 0 ? del : (
                            // Fallback for delivery
                            (o.estado === 'entregado' && o.timestamps?.entregado && o.createdAt) ?
                              // Si no tenemos inicio de delivery, asumimos (Total - Prep) o simplemente no mostramos nada
                              // Mejor mostrar '-' para ser honestos, pero si el usuario insiste...
                              '-' : '-'
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-900">
                        {total > 0 ? total :
                          (o.estado === 'entregado' && o.createdAt && o.timestamps?.entregado) ?
                            Math.round((new Date(o.timestamps.entregado).getTime() - new Date(o.createdAt).getTime()) / 60000) : '-'
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
