"use client";

import { Order, OrderType } from "@/lib/types";
import { MapPin, Plus, ShoppingBag, Truck, Utensils } from "lucide-react";
import { useState } from "react";

interface NewOrderPanelProps {
  onCreate: (o: Order) => void;
}

export default function NewOrderPanel({ onCreate }: NewOrderPanelProps) {
  const [orderType, setOrderType] = useState<OrderType>('llevar');
  const [clientName, setClientName] = useState("");
  const [tableNumber, setTableNumber] = useState("1");
  const [address, setAddress] = useState("");

  const [pizzaType, setPizzaType] = useState("");
  const [extras, setExtras] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const toggleExtra = (extra: string) => {
    if (extras.includes(extra)) setExtras(extras.filter(e => e !== extra));
    else setExtras([...extras, extra]);
  };

  const resetForm = () => {
    setClientName("");
    setAddress("");
    setPizzaType("");
    setExtras([]);
    setNotes("");
    setTableNumber("1");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const basePrice = pizzaType === 'Margarita' ? 10 : pizzaType === 'Pepperoni' ? 12 : 14;
    const extrasPrice = extras.length * 2;

    const newOrder: Order = {
      id: Math.floor(Math.random() * 10000).toString(),
      cliente: orderType === 'mesa' ? `Mesa ${tableNumber}` : clientName || "Cliente",
      tipo: orderType,
      mesa: orderType === 'mesa' ? tableNumber : undefined,
      direccion: orderType === 'delivery' ? address : undefined,
      items: [
        {
          id: Math.random().toString(),
          nombre: `Pizza ${pizzaType} ${extras.length > 0 ? '+ Extras' : ''}`,
          cantidad: 1,
          precio: basePrice + extrasPrice,
          estado: 'pendiente',
        }
      ],
      total: basePrice + extrasPrice,
      estado: "pendiente",
      pagado: false,
      createdAt: new Date()
    };
    onCreate(newOrder);
    resetForm();
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 w-full max-w-sm shrink-0">

      <div className="px-6 pt-6">
        <h2 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-wide">
          <Plus size={16} className="text-red-600" /> Nuevo Pedido
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">

        {/* SELECCIÓN DE TIPO DE PEDIDO */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Tipo de Servicio</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setOrderType('mesa')}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${orderType === 'mesa' ? 'bg-red-50 border-red-600 text-red-700 ring-1 ring-red-600' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
            >
              <Utensils size={18} className="mb-1" />
              <span className="text-[10px] font-bold uppercase">Mesa</span>
            </button>
            <button
              type="button"
              onClick={() => setOrderType('llevar')}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${orderType === 'llevar' ? 'bg-red-50 border-red-600 text-red-700 ring-1 ring-red-600' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
            >
              <ShoppingBag size={18} className="mb-1" />
              <span className="text-[10px] font-bold uppercase">Llevar</span>
            </button>
            <button
              type="button"
              onClick={() => setOrderType('delivery')}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${orderType === 'delivery' ? 'bg-red-50 border-red-600 text-red-700 ring-1 ring-red-600' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
            >
              <Truck size={18} className="mb-1" />
              <span className="text-[10px] font-bold uppercase">Deliv.</span>
            </button>
          </div>
        </div>

        {/* CAMPOS CONDICIONALES SEGÚN TIPO */}
        <div className="space-y-4 animate-in fade-in duration-300">
          {orderType === 'mesa' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Número de Mesa</label>
              <select
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none font-medium text-sm"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>Mesa {num}</option>
                ))}
              </select>
            </div>
          )}

          {orderType === 'llevar' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Cliente</label>
              <input
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                type="text"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none transition-all font-medium text-sm"
                placeholder="Nombre..."
              />
            </div>
          )}

          {orderType === 'delivery' && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Cliente</label>
                <input
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  type="text"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none font-medium text-sm"
                  placeholder="Nombre..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Dirección</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    type="text"
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none font-medium text-sm"
                    placeholder="Dirección..."
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="border-t border-slate-100"></div>

        {/* Tipos de Pizza */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Pizza</label>
          <div className="grid grid-cols-2 gap-2">
            {['Pepperoni', 'Margarita', 'Vegetariana', 'Hawaiana'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setPizzaType(type)}
                className={`p-3 rounded-lg border flex flex-col items-start gap-1 transition-all relative ${pizzaType === type ? 'border-red-600 bg-red-50 ring-1 ring-red-600' : 'border-slate-200 bg-white hover:border-red-300 hover:shadow-sm'}`}
              >
                <span className={`text-sm font-bold ${pizzaType === type ? 'text-red-700' : 'text-slate-700'}`}>{type}</span>
                {pizzaType === type && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-600 rounded-full"></div>}
              </button>
            ))}
          </div>
        </div>

        {/* Extras */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Extras</label>
          <div className="flex flex-wrap gap-2">
            {['Queso', 'Champi', 'Aceituna', 'Cebolla'].map((extra) => (
              <button
                key={extra}
                type="button"
                onClick={() => toggleExtra(extra)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${extras.includes(extra) ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
              >
                {extra}
              </button>
            ))}
          </div>
        </div>

        {/* Notas */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Notas</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-20 p-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none transition-all text-sm font-medium resize-none"
            placeholder="..."
          />
        </div>
      </form>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={handleSubmit}
          disabled={!pizzaType || (orderType === 'llevar' && !clientName) || (orderType === 'delivery' && (!clientName || !address))}
          className="w-full h-12 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm shadow-lg shadow-red-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Plus size={18} /> CONFIRMAR
        </button>
      </div>
    </div>
  );
}
