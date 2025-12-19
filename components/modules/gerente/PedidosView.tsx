import { Order, OrderStatus } from '@/lib/types';
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Timer
} from 'lucide-react';
import { useState } from 'react';

interface PedidosViewProps {
  orders: Order[];
}

export default function PedidosView({ orders }: PedidosViewProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter(o => {
    const matchesStatus = filterStatus === 'all' || o.estado === filterStatus;
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.cliente.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Helper for status styling
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'entregado': return { icon: CheckCircle, color: 'text-green-600 bg-green-50 border-green-200' };
      case 'cancelado': return { icon: AlertTriangle, color: 'text-red-600 bg-red-50 border-red-200' };
      case 'pendiente': return { icon: Timer, color: 'text-slate-600 bg-slate-100 border-slate-200' };
      default: return { icon: Timer, color: 'text-blue-600 bg-blue-50 border-blue-200' };
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-in fade-in duration-300">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-6">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Historial de Pedidos</h1>
            <p className="text-slate-500 text-sm">Gestiona y revisa todos los pedidos del sistema.</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar pedido o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 w-64"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter size={18} className="text-slate-400" />
              </div>
              <select
                className="pl-10 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none bg-white cursor-pointer"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Todos los Estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="preparando">En Cocina</option>
                <option value="en_delivery">En Delivery</option>
                <option value="entregado">Entregados</option>
                <option value="cancelado">Cancelados</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown size={14} className="text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-900 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Fecha/Hora</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Detalle</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      No se encontraron pedidos con estos filtros.
                    </td>
                  </tr>
                ) : filteredOrders.map(order => {
                  const { icon: StatusIcon, color } = getStatusBadge(order.estado);
                  return (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">#{order.id.slice(-5)}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</span>
                          <span className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">{order.cliente}</td>
                      <td className="px-6 py-4">
                        <p className="truncate max-w-[200px]" title={order.items.map(i => i.nombre).join(', ')}>
                          {order.items.length} items ({order.items[0]?.nombre}...)
                        </p>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">${order.total}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${color}`}>
                          <StatusIcon size={14} />
                          {order.estado.toUpperCase().replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-red-600 hover:text-red-800 font-medium text-xs">Ver Detalle</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Pagination Footer Mockup */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span>Mostrando {filteredOrders.length} resultados</span>
            <div className="flex gap-1">
              <button className="p-1 rounded hover:bg-slate-200 disabled:opacity-50" disabled><ChevronLeft size={16} /></button>
              <button className="p-1 rounded hover:bg-slate-200"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
