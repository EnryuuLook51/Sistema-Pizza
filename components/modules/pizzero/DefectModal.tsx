import {
  AlertTriangle,
  ChevronDown,
  CircleDashed,
  ClipboardList,
  Clock,
  Cookie,
  Flame,
  Hand,
  UtensilsCrossed
} from 'lucide-react';

interface DefectModalProps {
  orderId: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export default function DefectModal({ orderId, onClose, onConfirm }: DefectModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Contenedor Principal Límite Ancho */}
      <div className="bg-slate-50 w-full max-w-6xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative animate-in zoom-in-95 duration-300">

        {/* Botón Cerrar */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-white p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 shadow-sm transition-all">
          <UtensilsCrossed size={20} className="rotate-45" />
        </button>

        {/* SECCIÓN IZQUIERDA: FORMULARIO */}
        <div className="flex-1 p-8 overflow-y-auto">

          {/* Header Modal */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
              Registro de Defectos
            </h2>
            <p className="text-slate-500 font-medium flex items-center gap-2 mt-2">
              <AlertTriangle size={16} className="text-orange-500" />
              Reporte de incidencias y desperdicios en producción
            </p>
          </div>

          {/* 1. Selector de Tipo */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              Seleccione Tipo de Defecto
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { id: 'quemada', label: 'Quemada', icon: Flame, color: 'text-orange-500 bg-orange-50 border-orange-100' },
                { id: 'cruda', label: 'Masa Cruda', icon: Cookie, color: 'text-yellow-600 bg-yellow-50 border-yellow-100' },
                { id: 'ingredientes', label: 'Error Ingredientes', icon: UtensilsCrossed, color: 'text-blue-500 bg-blue-50 border-blue-100' },
                { id: 'caida', label: 'Caída al Piso', icon: Hand, color: 'text-red-500 bg-red-50 border-red-100' },
                { id: 'rota', label: 'Masa Rota', icon: CircleDashed, color: 'text-slate-500 bg-slate-50 border-slate-100' },
                { id: 'otro', label: 'Otro / Varios', icon: ClipboardList, color: 'text-purple-500 bg-purple-50 border-purple-100' },
              ].map((defect) => (
                <button
                  key={defect.id}
                  onClick={() => onConfirm(defect.label)} // Use specific reason in real app
                  className={`h-32 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.02] hover:shadow-md group ${defect.color.replace('border-', 'hover:border-current ')} border-transparent bg-slate-50 hover:bg-white`}
                >
                  <defect.icon size={32} className={`mb-1 ${defect.color.split(' ')[0]}`} />
                  <span className="font-bold text-slate-600 group-hover:text-slate-800">{defect.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Detalles */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
              Detalles de la Orden
            </h3>
            <div className="flex gap-4 mb-4">
              <div className="w-1/3">
                <label className="text-xs font-bold text-slate-400 mb-1 block uppercase">Número de Orden</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono font-bold text-slate-600">
                  #{orderId}
                </div>
              </div>
              <div className="w-2/3">
                <label className="text-xs font-bold text-slate-400 mb-1 block uppercase">Producto Afectado</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-600 flex justify-between items-center">
                  <span>Pizza General (Toda la orden)</span>
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 mb-1 block uppercase">Comentario / Nota</label>
              <textarea
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none h-24"
                placeholder="Detalles extra sobre el problema..."
              ></textarea>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex gap-4">
            <button onClick={onClose} className="px-6 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">Cancelar</button>
            <button onClick={() => onConfirm("General Issue")} className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase tracking-wider py-4 shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2">
              <AlertTriangle size={20} /> Registrar Defecto
            </button>
          </div>

        </div>

        {/* SECCIÓN DERECHA: HISTORIAL RECIENTE */}
        <div className="w-80 bg-slate-50 border-l border-slate-200 p-6 hidden md:flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Historial Reciente</h3>
            <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">Hoy: 4</span>
          </div>

          <div className="space-y-4 overflow-y-auto flex-1">
            {/* Mock 1 */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-orange-50 text-orange-600 p-2 rounded-lg"><Flame size={16} /></span>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold">#4090</span>
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Pizza Quemada</h4>
              <p className="text-xs text-slate-500 mb-2">Pizza Vegetariana</p>
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                <span className="flex items-center gap-1"><Clock size={10} /> 15m atrás</span>
                <span>Marco Rossi</span>
              </div>
            </div>

            {/* Mock 2 */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-yellow-50 text-yellow-600 p-2 rounded-lg"><UtensilsCrossed size={16} /></span>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold">#4082</span>
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Error Ingredientes</h4>
              <p className="text-xs text-slate-500 mb-2">Pizza Hawaiana</p>
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                <span className="flex items-center gap-1"><Clock size={10} /> 45m atrás</span>
                <span>Ana Silva</span>
              </div>
            </div>

            {/* Mock 3 */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-red-50 text-red-600 p-2 rounded-lg"><Hand size={16} /></span>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold">#4012</span>
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Caída al Piso</h4>
              <p className="text-xs text-slate-500 mb-2">Pan de Ajo</p>
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                <span className="flex items-center gap-1"><Clock size={10} /> 09:15 AM</span>
                <span>Luis G.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
