import { Order } from '@/lib/types';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle,
  Download,
  MoreHorizontal,
  ShoppingCart,
  Timer,
  TrendingDown,
  TrendingUp
} from 'lucide-react';

interface ReportsViewProps {
  orders: Order[];
}

export default function ReportsView({ orders }: ReportsViewProps) {
  // Filter for today
  const todayStr = new Date().toDateString();
  const todayOrders = orders.filter(o => o.createdAt && new Date(o.createdAt).toDateString() === todayStr);
  const completedOrders = todayOrders.filter(o => o.estado === 'entregado');

  // 1. Avg Delivery Time
  const deliveryTimes = completedOrders
    .map(o => {
      if (o.timestamps?.entregado && o.timestamps?.listo_para_servir) {
        return (new Date(o.timestamps.entregado).getTime() - new Date(o.timestamps.listo_para_servir).getTime()) / 60000;
      }
      return 0;
    })
    .filter(t => t > 0);

  const avgDeliveryTime = deliveryTimes.length > 0
    ? Math.round(deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length)
    : 0;

  // 2. Defect Rate
  const defectOrders = todayOrders.filter(o =>
    o.estado === 'cancelado' ||
    o.items.some(i => i.notas?.toLowerCase().includes('defecto'))
  );
  const defectRate = todayOrders.length > 0
    ? ((defectOrders.length / todayOrders.length) * 100).toFixed(1)
    : "0.0";

  // 3. Quality Score (Inverse of defect rate, simplified)
  const qualityScore = Math.max(0, 100 - (parseFloat(defectRate) * 5)); // Penalize 5 points per 1% defect

  // 4. Defect Distribution
  const defectStats: Record<string, number> = {};
  defectOrders.forEach(o => {
    let reason = 'Otros';
    const notes = o.items.map(i => i.notas || '').join(' ').toLowerCase();
    if (notes.includes('quemad')) reason = 'Borde Quemado';
    else if (notes.includes('frio') || notes.includes('fría')) reason = 'Pizza Fría';
    else if (notes.includes('ingrediente')) reason = 'Ingrediente Incorrecto';
    else if (o.estado === 'cancelado') reason = 'Cancelado Cliente';

    defectStats[reason] = (defectStats[reason] || 0) + 1;
  });

  const defectChartData = Object.entries(defectStats)
    .sort((a, b) => b[1] - a[1])
    .map(([label, val]) => ({
      label,
      width: `${(val / defectOrders.length) * 100}%`,
      valStr: `${Math.round((val / defectOrders.length) * 100)}%`
    }));

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Panel de Reportes</h1>
            <p className="text-slate-500 font-medium">Métricas operativas y estadísticas del turno actual.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden sm:flex items-center justify-center h-10 px-5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:text-red-600 font-medium text-sm transition-colors shadow-sm">
              <Calendar className="mr-2" size={18} />
              {todayStr}
            </button>
            <button className="flex items-center justify-center h-10 px-6 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors shadow-lg shadow-red-200">
              <Download className="mr-2" size={20} />
              Exportar Reporte
            </button>
          </div>
        </div>

        {/* Time Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button className="flex h-9 items-center justify-center gap-2 rounded-lg bg-red-600 text-white px-5 text-sm font-semibold shadow-md shadow-red-200 transition-transform active:scale-95">
            Hoy
          </button>
          <button className="flex h-9 items-center justify-center gap-2 rounded-lg bg-white border border-slate-200 text-slate-600 px-5 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-colors">
            Esta Semana
          </button>
          <button className="flex h-9 items-center justify-center gap-2 rounded-lg bg-white border border-slate-200 text-slate-600 pl-5 pr-3 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-colors">
            Rango Personalizado
          </button>
        </div>

        {/* Actionable Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Delivery Time */}
          <div className="bg-white rounded-xl p-5 flex flex-col gap-3 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-start">
              <div className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-100">
                <Timer size={24} />
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                <TrendingDown size={14} />
                Good
              </span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Tiempo Prom. Entrega</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{avgDeliveryTime}m</h3>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-xl p-5 flex flex-col gap-3 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-start">
              <div className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-100">
                <ShoppingCart size={24} />
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                <TrendingUp size={14} />
                Active
              </span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Pedidos Hoy</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{todayOrders.length}</h3>
            </div>
          </div>

          {/* Defect Rate */}
          <div className="bg-white rounded-xl p-5 flex flex-col gap-3 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-start">
              <div className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-100">
                <AlertTriangle size={24} />
              </div>
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border ${parseFloat(defectRate) > 5 ? 'text-red-600 bg-red-50 border-red-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100'}`}>
                {parseFloat(defectRate) > 5 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {defectRate}%
              </span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Tasa de Defectos</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{defectRate}%</h3>
            </div>
          </div>

          {/* Quality Score */}
          <div className="bg-white rounded-xl p-5 flex flex-col gap-3 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-start">
              <div className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-100">
                <CheckCircle size={24} />
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Score de Calidad</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{qualityScore.toFixed(0)}%</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Defects Chart */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Defectos por Tipo</h3>
                <p className="text-slate-500 text-sm">Total: {defectOrders.length} incidentes</p>
              </div>
              <button className="text-slate-400 hover:text-red-600 transition-colors">
                <MoreHorizontal size={20} />
              </button>
            </div>
            <div className="flex-1 flex flex-col justify-end gap-5">
              {defectChartData.length > 0 ? defectChartData.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>{item.label}</span>
                    <span className="text-red-600">{item.valStr}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-red-600 h-full rounded-full shadow-[0_2px_10px_rgba(220,38,38,0.3)]" style={{ width: item.width }}></div>
                  </div>
                </div>
              )) : (
                <p className="text-slate-400 text-center text-sm py-10">Sin defectos hoy</p>
              )}
            </div>
          </div>

          {/* Delivery Times Chart (Placeholder) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Tiempos de Entrega (Por Hora)</h3>
                <p className="text-slate-500 text-sm">Promedio: {avgDeliveryTime}m hoy</p>
              </div>
              <div className="flex gap-4">
                <span className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-600"></div> Hoy
                </span>
              </div>
            </div>

            {/* SVG Chart Placeholder - Replicating simple chart from HTML */}
            <div className="flex-1 w-full relative min-h-[200px] flex flex-col justify-between pt-4">
              <div className="relative w-full h-[180px]">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 150">
                  <line x1="0" y1="0" x2="500" y2="0" stroke="currentColor" strokeWidth="1" className="text-slate-100"></line>
                  <line x1="0" y1="75" x2="500" y2="75" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-slate-100"></line>
                  <line x1="0" y1="150" x2="500" y2="150" stroke="currentColor" strokeWidth="1" className="text-slate-100"></line>

                  <defs>
                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#dc2626" stopOpacity="0.15"></stop>
                      <stop offset="100%" stopColor="#dc2626" stopOpacity="0"></stop>
                    </linearGradient>
                  </defs>

                  <path d="M0 100 Q 50 120, 100 80 T 200 60 T 300 90 T 400 40 T 500 70 V 150 H 0 Z" fill="url(#chartGradient)"></path>
                  <path d="M0 100 Q 50 120, 100 80 T 200 60 T 300 90 T 400 40 T 500 70" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </div>
              <div className="flex justify-between w-full text-xs font-semibold text-slate-400 mt-2 px-1">
                <span>10am</span>
                <span>12pm</span>
                <span>2pm</span>
                <span>4pm</span>
                <span>6pm</span>
                <span>8pm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders Log */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col mb-8">
          <div className="p-6 flex items-center justify-between border-b border-slate-100 bg-white">
            <h3 className="text-lg font-bold text-slate-900">Registro de Pedidos Recientes</h3>
            <button className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors flex items-center">
              Ver Todos
              <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-500">
              <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-900 border-b border-slate-100">
                <tr>
                  <th scope="col" className="px-6 py-4">ID Pedido</th>
                  <th scope="col" className="px-6 py-4">Hora</th>
                  <th scope="col" className="px-6 py-4">Cliente</th>
                  <th scope="col" className="px-6 py-4">Items</th>
                  <th scope="col" className="px-6 py-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-slate-900">#{order.id.slice(-5)}</td>
                    <td className="px-6 py-4">{order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{order.cliente}</td>
                    <td className="px-6 py-4 text-slate-500">{order.items.map(i => `${i.cantidad}x ${i.nombre}`).join(', ')}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border
                             ${order.estado === 'entregado' ? 'border-green-200 text-green-700 bg-green-50' :
                          order.estado === 'cancelado' ? 'border-red-200 text-red-700 bg-red-50' :
                            'border-yellow-200 text-yellow-700 bg-yellow-50'}`}>
                        {order.estado === 'entregado' ? <CheckCircle size={14} /> : order.estado === 'cancelado' ? <AlertTriangle size={14} /> : <Timer size={14} />}
                        {order.estado.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
