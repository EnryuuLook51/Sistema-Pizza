import { CheckCircle, ShieldCheck } from 'lucide-react';

export default function StandardsView() {
  return (
    <div className="h-full flex items-center justify-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm animate-in zoom-in-95 duration-300">
      <div className="text-center max-w-lg space-y-6">
        <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-blue-600">
          <ShieldCheck size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-800">Protocolos de Calidad (5S)</h2>
        <div className="text-left bg-slate-50 p-6 rounded-2xl space-y-4 border border-slate-100">
          <div className="flex gap-3">
            <CheckCircle className="text-green-500 shrink-0" size={20} />
            <p className="text-sm text-slate-600 font-medium">Lavar manos cada 30 minutos o al cambiar de tarea.</p>
          </div>
          <div className="flex gap-3">
            <CheckCircle className="text-green-500 shrink-0" size={20} />
            <p className="text-sm text-slate-600 font-medium">Cuchillos siempre en su lugar magnético, nunca en la mesa.</p>
          </div>
          <div className="flex gap-3">
            <CheckCircle className="text-green-500 shrink-0" size={20} />
            <p className="text-sm text-slate-600 font-medium">Limpiar mesa de trabajo inmediatamente después de meter pizza al horno (Mise en Place).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
