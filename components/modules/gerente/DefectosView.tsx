import { Order } from '@/lib/types';
import {
  AlertTriangle,
  FileWarning,
  Filter
} from 'lucide-react';
import { useState } from 'react';

interface DefectosViewProps {
  orders: Order[];
}

export default function DefectosView({ orders }: DefectosViewProps) {
  const [filterReason, setFilterReason] = useState<string>('all');

  // Filter for orders with defects
  const defectOrders = orders.filter(o => {
    const isCancelled = o.estado === 'cancelado';
    const hasDefectNote = o.items.some(i => i.notas?.toLowerCase().includes('defecto') || i.notas?.toLowerCase().includes('error') || i.notas?.toLowerCase().includes('mal'));
    return isCancelled || hasDefectNote;
  });

  // Infer reasons
  const getReason = (o: Order) => {
    const notes = o.items.map(i => i.notas || '').join(' ').toLowerCase();
    if (notes.includes('quemad')) return 'Borde Quemado';
    if (notes.includes('frio') || notes.includes('fría')) return 'Pizza Fría';
    if (notes.includes('ingrediente')) return 'Ingrediente Incorrecto';
    if (notes.includes('cruda')) return 'Masa Cruda';
    if (o.estado === 'cancelado') return 'Cancelado Cliente';
    return 'Otro Defecto';
  };

  const filteredDefects = defectOrders.filter(o => {
    if (filterReason === 'all') return true;
    return getReason(o) === filterReason;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-in fade-in duration-300">
      <div className="max-w-[1000px] mx-auto flex flex-col gap-6">

        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="text-red-600" />
              Registro de Incidentes
            </h1>
            <p className="text-slate-500 text-sm">Monitorización de calidad y desperdicios.</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              className="text-sm border-none bg-slate-100 rounded-lg py-2 px-3 focus:ring-0 cursor-pointer font-medium text-slate-600"
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value)}
            >
              <option value="all">Todos los Tipos</option>
              <option value="Borde Quemado">Borde Quemado</option>
              <option value="Pizza Fría">Pizza Fría</option>
              <option value="Ingrediente Incorrecto">Ingrediente Incorrecto</option>
              <option value="Masa Cruda">Masa Cruda</option>
              <option value="Cancelado Cliente">Cancelado Cliente</option>
            </select>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {filteredDefects.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-4">
              <div className="p-4 bg-slate-50 rounded-full">
                <FileWarning size={48} className="opacity-50" />
              </div>
              <p className="font-medium">No se encontraron incidentes registrados.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-red-50 text-xs uppercase font-bold text-red-900 border-b border-red-100">
                <tr>
                  <th className="px-6 py-4">Hora</th>
                  <th className="px-6 py-4">Pedido</th>
                  <th className="px-6 py-4">Problema Detectado</th>
                  <th className="px-6 py-4">Notas / Detalle</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDefects.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono text-slate-500">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      #{order.id.slice(-4)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                        {getReason(order)}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate" title={order.items.map(i => i.notas).join(', ')}>
                      {order.items.map(i => i.notas).filter(Boolean).join(', ') || 'Sin notas adicionales'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-slate-600 font-medium text-xs underline">Revisar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
