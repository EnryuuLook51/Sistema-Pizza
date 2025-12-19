"use client";

import { Order } from "@/lib/types";
import { Banknote, CheckCircle, CreditCard, Loader2, X } from "lucide-react";
import { useState } from "react";

interface PaymentModalProps {
  order: Order;
  onClose: () => void;
  onConfirmPayment: (method: 'Efectivo' | 'Tarjeta') => void;
}

export default function PaymentModal({ order, onClose, onConfirmPayment }: PaymentModalProps) {
  const [method, setMethod] = useState<'Efectivo' | 'Tarjeta' | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Card Form States
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const handlePayment = () => {
    setProcessing(true);
    // Simular delay de red
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      // Cerrar modal automáticamente después de mostrar éxito
      setTimeout(() => {
        onConfirmPayment(method || 'Efectivo');
      }, 1500);
    }, 2000);
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-300">
          <div className="rounded-full bg-green-100 p-4 mb-4">
            <CheckCircle className="text-green-600 size-12" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-1">¡Pago Exitoso!</h2>
          <p className="text-slate-500 font-medium">Orden #{order.id} procesada.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-300">

        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-black text-slate-800">Procesar Pago</h2>
            <p className="text-sm text-slate-500 font-medium">Orden #{order.id} • {order.cliente}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Amount */}
        <div className="py-8 bg-slate-900 text-white text-center">
          <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-1">Total a Pagar</p>
          <p className="text-5xl font-black tracking-tight">${order.total.toFixed(2)}</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {!method ? (
            // SELECCIÓN DE MÉTODO
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setMethod('Efectivo')}
                className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-slate-100 hover:border-green-500 hover:bg-green-50 transition-all group"
              >
                <div className="bg-green-100 p-4 rounded-full text-green-600 group-hover:scale-110 transition-transform">
                  <Banknote size={32} />
                </div>
                <span className="font-bold text-slate-700 group-hover:text-green-700">Efectivo</span>
              </button>

              <button
                onClick={() => setMethod('Tarjeta')}
                className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="bg-blue-100 p-4 rounded-full text-blue-600 group-hover:scale-110 transition-transform">
                  <CreditCard size={32} />
                </div>
                <span className="font-bold text-slate-700 group-hover:text-blue-700">Tarjeta</span>
              </button>
            </div>
          ) : method === 'Efectivo' ? (
            // VISTA EFECTIVO
            <div className="text-center space-y-6">
              <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                <p className="text-green-800 font-medium mb-2">Pago en Efectivo</p>
                <p className="text-sm text-green-600">Recibe el dinero y confirma la transacción.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setMethod(null)} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Volver</button>
                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="flex-[2] py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2"
                >
                  {processing ? <Loader2 className="animate-spin" /> : 'Confirmar Pago'}
                </button>
              </div>
            </div>
          ) : (
            // VISTA TARJETA (SIMULACIÓN)
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-slate-700 text-sm">Tarjeta de Crédito/Débito</span>
                  <div className="flex gap-2">
                    <div className="w-8 h-5 bg-red-500 rounded"></div>
                    <div className="w-8 h-5 bg-yellow-500 rounded"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <input
                    placeholder="0000 0000 0000 0000"
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    maxLength={19}
                  />
                  <div className="flex gap-3">
                    <input
                      placeholder="MM/YY"
                      className="w-1/3 bg-white border border-slate-200 rounded-lg px-4 py-2.5 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={expiry}
                      onChange={e => setExpiry(e.target.value)}
                      maxLength={5}
                    />
                    <input
                      placeholder="CVV"
                      className="w-1/3 bg-white border border-slate-200 rounded-lg px-4 py-2.5 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={cvv}
                      onChange={e => setCvv(e.target.value)}
                      maxLength={3}
                    />
                  </div>
                  <input
                    placeholder="Nombre del Titular"
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                    value={cardHolder}
                    onChange={e => setCardHolder(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setMethod(null)} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Volver</button>
                <button
                  onClick={handlePayment}
                  disabled={processing || !cardNumber || !cvv || !expiry}
                  className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                >
                  {processing ? <Loader2 className="animate-spin" /> : 'Procesar Pago'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
