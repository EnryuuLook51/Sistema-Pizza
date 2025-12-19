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
import { useMemo, useState } from 'react';

interface ReportsViewProps {
  orders: Order[];
}

type RangeType = 'today' | 'week' | 'custom';

export default function ReportsView({ orders }: ReportsViewProps) {
  // --- STATE MANAGEMENT ---
  const [rangeType, setRangeType] = useState<RangeType>('today');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number, y: number, val: number, label: string } | null>(null); // New Hover State

  // Initialize Custom Dates (default to this month)
  const [customStart, setCustomStart] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customEnd, setCustomEnd] = useState<string>(new Date().toISOString().split('T')[0]);

  // --- FILTERING LOGIC ---
  const filteredOrders = useMemo(() => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (rangeType === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 00:00 today
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    } else if (rangeType === 'week') {
      // Last 7 days
      start = new Date(now);
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
    } else if (rangeType === 'custom') {
      start = new Date(customStart);
      start.setHours(0, 0, 0, 0);
      end = new Date(customEnd);
      end.setHours(23, 59, 59, 999);
    }

    // Adjust for User Timezone offset if needed, but for simplicity we rely on Browser Local Time
    // consistently used throughout the app (Date objects).

    return orders.filter(o => {
      if (!o.createdAt) return false;
      const date = new Date(o.createdAt);
      return date >= start && date <= end;
    });
  }, [orders, rangeType, customStart, customEnd]);

  const completedOrders = filteredOrders.filter(o => o.estado === 'entregado');

  // --- METRICS CALCULATION (Reuse logic but with filteredOrders) ---

  // 1. Avg Delivery Time
  const deliveryTimes = completedOrders
    .map(o => {
      let time = 0;
      if (o.timestamps?.entregado && o.timestamps?.en_delivery) {
        time = (new Date(o.timestamps.entregado).getTime() - new Date(o.timestamps.en_delivery).getTime()) / 60000;
      } else if (o.timestamps?.entregado && o.timestamps?.listo_para_servir) {
        time = (new Date(o.timestamps.entregado).getTime() - new Date(o.timestamps.listo_para_servir).getTime()) / 60000;
      } else if (o.timestamps?.entregado && o.createdAt) {
        time = (new Date(o.timestamps.entregado).getTime() - new Date(o.createdAt).getTime()) / 60000;
      }
      return Math.round(time);
    })
    .filter(t => t > 0);

  const avgDeliveryTime = deliveryTimes.length > 0
    ? Math.round(deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length)
    : 0;

  // 2. Defect Rate
  const defectOrders = filteredOrders.filter(o =>
    o.estado === 'cancelado' ||
    o.items.some(i => i.notas?.toLowerCase().includes('defecto'))
  );
  const defectRate = filteredOrders.length > 0
    ? ((defectOrders.length / filteredOrders.length) * 100).toFixed(1)
    : "0.0";

  // 3. Quality Score
  const qualityScore = Math.max(0, 100 - (parseFloat(defectRate) * 5));

  // 4. Defect Distribution
  const defectStats: Record<string, number> = {};
  defectOrders.forEach(o => {
    let reason = 'Otros';
    const notes = o?.items?.map(i => i.notas || '').join(' ').toLowerCase() || '';
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

  // --- EXPORT FUNCTIONALITY ---
  const handleExport = () => {
    if (filteredOrders.length === 0) return;

    // Define CSV Headers
    const headers = [
      'ID Pedido',
      'Fecha',
      'Hora',
      'Cliente',
      'Tipo Entrega',
      'Teléfono',
      'Dirección',
      'Items',
      'Total ($)',
      'Estado',
      'Pagado',
      'Tiempo Entrega (min)',
      'Notas/Defectos'
    ];

    // Map rows
    const rows = filteredOrders.map(order => {
      const date = order.createdAt ? new Date(order.createdAt) : null;
      const dateStr = date ? date.toLocaleDateString() : '';
      const timeStr = date ? date.toLocaleTimeString() : '';

      // Calculate delivery time for this specific row using same logic as chart
      let deliveryTimeStr = '';
      if (order.estado === 'entregado') {
        let mins = 0;
        if (order.timestamps?.entregado && order.timestamps?.en_delivery) {
          mins = (new Date(order.timestamps.entregado).getTime() - new Date(order.timestamps.en_delivery).getTime()) / 60000;
        } else if (order.timestamps?.entregado && order.createdAt) {
          mins = (new Date(order.timestamps.entregado).getTime() - new Date(order.createdAt).getTime()) / 60000;
        }
        if (mins > 0) deliveryTimeStr = Math.round(mins).toString();
      }

      const itemsSummary = order.items.map(i => `${i.cantidad}x ${i.nombre}`).join('; ');
      const notes = order.items.map(i => i.notas).filter(Boolean).join('; ');

      // CSV safe strings (escape quotes)
      const safe = (str: string | undefined) => `"${(str || '').replace(/"/g, '""')}"`;

      return [
        safe(order.id),
        safe(dateStr),
        safe(timeStr),
        safe(order.cliente),
        safe(order.tipo),
        safe(order.telefono),
        safe(order.direccion),
        safe(itemsSummary),
        order.total?.toString() || '0',
        safe(order.estado),
        order.pagado ? 'Sí' : 'No',
        safe(deliveryTimeStr),
        safe(notes)
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    // Create/Download Blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte_ventas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Panel de Reportes</h1>
            <p className="text-slate-500 font-medium">Métricas operativas y estadísticas.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Date Display */}
            <div className="hidden sm:flex items-center justify-center h-10 px-5 rounded-lg border border-slate-200 bg-white text-slate-600 font-medium text-sm shadow-sm">
              <Calendar className="mr-2" size={18} />
              {rangeType === 'today' && 'Hoy'}
              {rangeType === 'week' && 'Últimos 7 días'}
              {rangeType === 'custom' && `${customStart} - ${customEnd}`}
            </div>
            <button
              onClick={handleExport}
              className="flex items-center justify-center h-10 px-6 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors shadow-lg shadow-red-200 active:scale-95"
            >
              <Download className="mr-2" size={20} />
              Exportar
            </button>
          </div>
        </div>

        {/* --- FILTERS TOOLBAR --- */}
        <div className="flex flex-wrap items-center gap-4 border-b border-slate-200 pb-4">
          {/* Tab Buttons */}
          <div className="flex items-center gap-2">
            {[
              { id: 'today', label: 'Hoy' },
              { id: 'week', label: 'Esta Semana' },
              { id: 'custom', label: 'Rango Personalizado' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setRangeType(tab.id as RangeType)}
                className={`flex h-9 items-center justify-center gap-2 rounded-lg px-5 text-sm font-medium transition-all ${rangeType === tab.id
                  ? 'bg-red-600 text-white shadow-md shadow-red-200'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers (Filtered Show) */}
          {rangeType === 'custom' && (
            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 animate-in slide-in-from-left-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="h-8 text-sm border-none bg-transparent focus:ring-0 text-slate-600 font-medium"
              />
              <span className="text-slate-300">-</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="h-8 text-sm border-none bg-transparent focus:ring-0 text-slate-600 font-medium"
              />
            </div>
          )}
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
              <p className="text-slate-500 text-sm font-medium">Total Pedidos</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{filteredOrders.length}</h3>
              <p className="text-xs text-slate-400 mt-1">En el rango seleccionado</p>
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
                <p className="text-slate-400 text-center text-sm py-10">Sin defectos en este rango</p>
              )}
            </div>
          </div>

          {/* Dynamic Delivery Times Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col relative z-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Tiempos de Entrega</h3>
                <p className="text-slate-500 text-sm">
                  {rangeType === 'today' ? 'Por Hora (0-23h)' : 'Por Día (Promedio)'}
                </p>
              </div>
              <div className="flex gap-4">
                <span className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-600"></div> Promedio
                </span>
              </div>
            </div>

            {/* Dynamic Svg Chart */}
            <div className="flex-1 w-full relative min-h-[200px] flex flex-col justify-between pt-4">
              {(() => {
                // AGGREGATION LOGIC
                // If Today: Hourly (0-23)
                // If Week/Custom: Daily (DD/MM)

                let dataPoints: { label: string, val: number }[] = [];

                if (rangeType === 'today') {
                  // HOURLY VIEW
                  const hours = Array.from({ length: 24 }, (_, i) => i);
                  dataPoints = hours.map(hour => {
                    const ordersInHour = completedOrders.filter(o => {
                      const d = o.createdAt ? new Date(o.createdAt) : null;
                      return d && d.getHours() === hour;
                    });
                    if (ordersInHour.length === 0) return { label: `${hour}h`, val: 0 };

                    const totalTime = ordersInHour.reduce((sum, o) => {
                      // Reuse calc logic or make separate helper, but for inline simplicity:
                      let time = 0;
                      if (o.timestamps?.entregado && o.timestamps?.en_delivery) time = (new Date(o.timestamps.entregado).getTime() - new Date(o.timestamps.en_delivery).getTime()) / 60000;
                      else if (o.timestamps?.entregado && o.createdAt) time = (new Date(o.timestamps.entregado).getTime() - new Date(o.createdAt).getTime()) / 60000;
                      return sum + time;
                    }, 0);
                    return { label: `${hour}h`, val: Math.round(totalTime / ordersInHour.length) };
                  });
                } else {
                  // DAILY VIEW (Grouping by Date)
                  const dayMap = new Map<string, Order[]>();
                  completedOrders.forEach(o => {
                    const d = o.createdAt ? new Date(o.createdAt) : null;
                    if (d) {
                      const key = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                      dayMap.set(key, [...(dayMap.get(key) || []), o]);
                    }
                  });

                  // If empty, show last 7 days empty?
                  // Better: show sorted keys found, or last 7 days if 'week'
                  // For simplicity let's map the map to array
                  if (dayMap.size === 0) {
                    // Show a generic baseline
                    dataPoints = [{ label: 'Inicio', val: 0 }, { label: 'Fin', val: 0 }];
                  } else {
                    dataPoints = Array.from(dayMap.entries()).map(([label, dayOrders]) => {
                      const totalTime = dayOrders.reduce((sum, o) => {
                        let time = 0;
                        if (o.timestamps?.entregado && o.timestamps?.en_delivery) time = (new Date(o.timestamps.entregado).getTime() - new Date(o.timestamps.en_delivery).getTime()) / 60000;
                        else if (o.timestamps?.entregado && o.createdAt) time = (new Date(o.timestamps.entregado).getTime() - new Date(o.createdAt).getTime()) / 60000;
                        return sum + time;
                      }, 0);
                      return { label, val: Math.round(totalTime / dayOrders.length) };
                    }).sort((a, b) => {
                      // Rough sort by label if DD/MM
                      const [dA, mA] = a.label.split('/').map(Number);
                      const [dB, mB] = b.label.split('/').map(Number);
                      return (mB - mA) || (dB - dA); // descending? No we want ascending for chart
                    }).reverse();
                  }
                }

                if (dataPoints.length < 2) {
                  // Add dummy point to make a line if single point
                  dataPoints.push({ label: '.', val: dataPoints[0]?.val || 0 });
                }

                // Chart Dimensions
                const height = 150;
                const width = 500;

                // --- IMPROVED AUTO-SCALING ---
                const rawMax = Math.max(...dataPoints.map(d => d.val));
                const maxVal = rawMax > 0 ? rawMax * 1.2 : 45; // Logic: Scale to max + 20% breathing room, but keep 45 min floor ONLY if complete zero

                // Generate Path
                const stepX = width / (dataPoints.length - 1);

                const points = dataPoints.map((d, i) => {
                  const x = i * stepX;
                  const y = height - ((d.val / maxVal) * height);
                  return `${x},${y}`;
                }).join(' ');

                const fillPoints = `0,${height} ${points} ${width},${height}`;

                return (
                  <>
                    <div className="relative w-full h-[150px] group" onMouseLeave={() => setHoveredPoint(null)}>
                      {/* SVG */}
                      <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`}>
                        <defs>
                          <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.15"></stop>
                            <stop offset="100%" stopColor="#dc2626" stopOpacity="0"></stop>
                          </linearGradient>
                        </defs>
                        <polygon points={fillPoints} fill="url(#chartGradient)" />
                        <polyline points={points} fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                        {/* Interactive Areas */}
                        {dataPoints.map((d, i) => {
                          const x = i * stepX;
                          const y = height - ((d.val / maxVal) * height);
                          return (
                            <g key={i}>
                              {/* Visible Dot */}
                              <circle
                                cx={x}
                                cy={y}
                                r={d.val > 0 ? "3" : "0"}
                                className="text-red-600 fill-white stroke-current stroke-2 pointer-events-none"
                              />
                              {/* Invisible Hit Area (Larger) */}
                              <rect
                                x={x - (stepX / 2)}
                                y={0}
                                width={stepX}
                                height={height}
                                fill="transparent"
                                className="cursor-pointer"
                                onMouseEnter={() => setHoveredPoint({ x, y, val: d.val, label: d.label })}
                              />
                            </g>
                          )
                        })}
                      </svg>

                      {/* Tooltip Overlay */}
                      {hoveredPoint && (
                        <div
                          className="absolute pointer-events-none bg-slate-900 text-white text-xs rounded px-2 py-1 shadow-xl transform -translate-x-1/2 -translate-y-full mb-2 z-10"
                          style={{ left: `${(hoveredPoint.x / width) * 100}%`, top: `${(hoveredPoint.y / height) * 100}%` }}
                        >
                          <div className="font-bold">{hoveredPoint.val}m</div>
                          <div className="text-slate-400 text-[10px]">{hoveredPoint.label}</div>
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-2 h-2 bg-slate-900 rotate-45"></div>
                        </div>
                      )}
                    </div>

                    {/* X Axis Labels - Adaptive */}
                    <div className="flex justify-between w-full text-xs font-semibold text-slate-400 mt-4 px-1">
                      {dataPoints.length > 8
                        ? dataPoints.filter((_, i) => i % Math.ceil(dataPoints.length / 6) === 0).map((d, i) => <span key={i}>{d.label}</span>)
                        : dataPoints.map((d, i) => <span key={i}>{d.label}</span>)
                      }
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Recent Orders Log */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col mb-8">
          <div className="p-6 flex items-center justify-between border-b border-slate-100 bg-white">
            <h3 className="text-lg font-bold text-slate-900">Registro de Pedidos</h3>
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
                  <th scope="col" className="px-6 py-4">Fecha/Hora</th>
                  <th scope="col" className="px-6 py-4">Cliente</th>
                  <th scope="col" className="px-6 py-4">Items</th>
                  <th scope="col" className="px-6 py-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-slate-900">#{order.id.slice(-5)}</td>
                    <td className="px-6 py-4">{order.createdAt ? new Date(order.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}</td>
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
