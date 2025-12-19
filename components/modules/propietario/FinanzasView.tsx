import { Order } from '@/lib/types';
import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Download,
  PieChart,
  TrendingDown,
  TrendingUp,
  Wallet
} from 'lucide-react';

interface FinanzasViewProps {
  orders: Order[];
}

export default function FinanzasView({ orders }: FinanzasViewProps) {
  // Filter valid completed orders for financial data
  const validOrders = orders.filter(o => o.estado !== 'cancelado');
  const totalRevenue = validOrders.reduce((acc, o) => acc + (o.total || o.items.reduce((s, i) => s + i.precio * i.cantidad, 0)), 0);

  // Simulated Costs (Assume ~40% margin, so 60% costs for this demo)
  const estimatedCosts = totalRevenue * 0.6;
  const netProfit = totalRevenue - estimatedCosts;

  // Group by Product for Mix
  const productMix: Record<string, number> = {};
  validOrders.forEach(o => {
    o.items.forEach(i => {
      productMix[i.nombre] = (productMix[i.nombre] || 0) + (i.precio * i.cantidad);
    });
  });

  const topProducts = Object.entries(productMix)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, val]) => ({
      name,
      val,
      percent: (val / totalRevenue) * 100
    }));

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 animate-in fade-in duration-300">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-8">

        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Resumen Financiero</h1>
            <p className="text-slate-500 text-sm">Balance general y rentabilidad.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
            <Download size={18} />
            <span className="text-sm font-bold">Exportar Balance</span>
          </button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Revenue */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <DollarSign size={100} className="text-green-600" />
            </div>
            <div className="flex justify-between items-center z-10">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <DollarSign size={24} />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                <ArrowUpRight size={14} /> +12.4%
              </span>
            </div>
            <div className="z-10">
              <p className="text-slate-500 font-medium text-sm">Ingresos Totales (YTD)</p>
              <h2 className="text-4xl font-black text-slate-900 mt-1">${totalRevenue.toFixed(2)}</h2>
            </div>
          </div>

          {/* Costs */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <TrendingDown size={100} className="text-red-600" />
            </div>
            <div className="flex justify-between items-center z-10">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                <TrendingDown size={24} />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
                <ArrowDownRight size={14} /> Est.
              </span>
            </div>
            <div className="z-10">
              <p className="text-slate-500 font-medium text-sm">Costos Estimados (60%)</p>
              <h2 className="text-4xl font-black text-slate-900 mt-1">${estimatedCosts.toFixed(2)}</h2>
            </div>
          </div>

          {/* Profit */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl shadow-slate-200 flex flex-col gap-4 relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Wallet size={100} className="text-white" />
            </div>
            <div className="flex justify-between items-center z-10">
              <div className="p-3 bg-white/10 text-white rounded-xl backdrop-blur-sm">
                <Wallet size={24} />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20 backdrop-blur-sm">
                <TrendingUp size={14} /> 40% Margin
              </span>
            </div>
            <div className="z-10">
              <p className="text-slate-400 font-medium text-sm">Utilidad Neta (Est.)</p>
              <h2 className="text-4xl font-black text-white mt-1">${netProfit.toFixed(2)}</h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Selling Products */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-lg text-slate-900">Productos Más Rentables</h3>
              <PieChart className="text-slate-300" />
            </div>
            <div className="flex flex-col gap-6">
              {topProducts.map((p, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-700 text-sm flex items-center gap-2">
                      <div className={`size-2 rounded-full ${idx === 0 ? 'bg-green-500' : idx === 1 ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                      {p.name}
                    </span>
                    <span className="font-mono font-bold text-slate-900">${p.val.toFixed(2)}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${idx === 0 ? 'bg-green-500' : idx === 1 ? 'bg-blue-500' : 'bg-slate-300'}`}
                      style={{ width: `${p.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {topProducts.length === 0 && (
                <p className="text-center text-slate-400 py-10">No hay datos de ventas suficientes.</p>
              )}
            </div>
          </div>

          {/* Metrics List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col gap-6">
            <h3 className="font-bold text-lg text-slate-900">Indicadores Clave</h3>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ticket Promedio</span>
                <span className="text-2xl font-black text-slate-900">
                  ${validOrders.length > 0 ? (totalRevenue / validOrders.length).toFixed(2) : "0.00"}
                </span>
              </div>
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <DollarSign className="text-slate-400" size={20} />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pedidos Totales</span>
                <span className="text-2xl font-black text-slate-900">{validOrders.length}</span>
              </div>
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Wallet className="text-slate-400" size={20} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
              <h4 className="font-bold text-orange-800 text-sm mb-2 flex items-center gap-2">
                <ArrowUpRight size={16} /> Proyección
              </h4>
              <p className="text-orange-700 text-xs leading-relaxed">
                Basado en el rendimiento actual, se proyecta un cierre de mes con un incremento del <strong className="text-orange-900">15%</strong> en ventas brutas respecto al mes anterior.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
