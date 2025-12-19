import { Order } from '@/lib/types';
import {
  CheckCircle,
  Info,
  Lock,
  Scale,
  Timer
} from 'lucide-react';

interface StandardsViewProps {
  orders: Order[];
}

export default function StandardsView({ orders }: StandardsViewProps) {
  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden">

      {/* HEADER */}
      <div className="shrink-0 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Estándares de Trabajo</h2>
          <p className="text-slate-500 font-medium mt-1 max-w-2xl">
            Consulta los lineamientos oficiales de preparación. El cumplimiento de estos estándares garantiza la calidad de nuestros productos.
          </p>
        </div>
        <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2 border border-red-100">
          <Info size={16} /> Modo Consulta - Solo Lectura
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-y-auto pr-2 pb-4">

        {/* LEFT COLUMN - GUIDELINES */}
        <div className="lg:col-span-2 space-y-8">

          {/* GRAMMAJE CARD */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="flex items-center gap-3 font-black text-slate-800 text-lg">
                <div className="p-2 bg-red-100 rounded-lg text-red-600">
                  <Scale size={20} />
                </div>
                Estándares de Gramaje (Pizzas)
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded">Versión 2.4</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black tracking-wider text-left">
                    <th className="pb-3 pl-2">Ingrediente</th>
                    <th className="pb-3 text-center">Mediana<br />(12")</th>
                    <th className="pb-3 text-center">Familiar<br />(16")</th>
                    <th className="pb-3 text-center">Tolerancia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <tr className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 pl-2 font-bold text-slate-700 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-400"></span> Queso Mozzarella
                    </td>
                    <td className="py-4 text-center font-mono text-slate-600">180g</td>
                    <td className="py-4 text-center font-mono text-slate-600">250g</td>
                    <td className="py-4 text-center text-xs text-slate-400">± 10g</td>
                  </tr>
                  <tr className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 pl-2 font-bold text-slate-700 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span> Salsa de Tomate
                    </td>
                    <td className="py-4 text-center font-mono text-slate-600">120g</td>
                    <td className="py-4 text-center font-mono text-slate-600">180g</td>
                    <td className="py-4 text-center text-xs text-slate-400">± 5g</td>
                  </tr>
                  <tr className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 pl-2 font-bold text-slate-700 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-600"></span> Pepperoni
                    </td>
                    <td className="py-4 text-center font-mono text-slate-600">30 un</td>
                    <td className="py-4 text-center font-mono text-slate-600">45 un</td>
                    <td className="py-4 text-center text-xs text-slate-400">± 2 un</td>
                  </tr>
                  <tr className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 pl-2 font-bold text-slate-700 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span> Vegetales (Mix)
                    </td>
                    <td className="py-4 text-center font-mono text-slate-600">100g</td>
                    <td className="py-4 text-center font-mono text-slate-600">150g</td>
                    <td className="py-4 text-center text-xs text-slate-400">± 10g</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* TIEMPOS OBJETIVO */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="flex items-center gap-3 font-black text-slate-800 text-lg">
                <div className="p-2 bg-red-100 rounded-lg text-red-600">
                  <Timer size={20} />
                </div>
                Tiempos Objetivo de Preparación
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1 */}
              <div className="border border-slate-100 rounded-2xl p-4 flex justify-between items-center bg-slate-50/50">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Amasado y Estirado</p>
                  <p className="text-3xl font-black text-slate-800">45s</p>
                  <p className="text-xs text-slate-400 mt-1">Por base de pizza</p>
                </div>
                <div className="text-emerald-500 bg-white p-2 rounded-full shadow-sm border border-emerald-100">
                  <CheckCircle size={28} />
                </div>
              </div>

              {/* Card 2 - Fixed from Alert to Standard */}
              <div className="border border-slate-100 rounded-2xl p-4 flex justify-between items-center bg-slate-50/50">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Sauceo y Queso</p>
                  <p className="text-3xl font-black text-slate-800">30s</p>
                  <p className="text-xs text-slate-400 mt-1">Distribución uniforme</p>
                </div>
                <div className="text-emerald-500 bg-white p-2 rounded-full shadow-sm border border-emerald-100">
                  <CheckCircle size={28} />
                </div>
              </div>

              {/* Card 3 */}
              <div className="border border-slate-100 rounded-2xl p-4 flex justify-between items-center bg-slate-50/50">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Topping (Ingredientes)</p>
                  <p className="text-3xl font-black text-slate-800">60s</p>
                  <p className="text-xs text-slate-400 mt-1">Máximo 4 ingredientes</p>
                </div>
                <div className="text-emerald-500 bg-white p-2 rounded-full shadow-sm border border-emerald-100">
                  <CheckCircle size={28} />
                </div>
              </div>

              {/* Card 4 - Locked */}
              <div className="border border-slate-100 rounded-2xl p-4 flex justify-between items-center bg-slate-50/50">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Horneado (Cinta)</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-black text-slate-800">6m</p>
                    <p className="text-xl font-bold text-slate-400">30s</p>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Temperatura: 250°C</p>
                </div>
                <div className="text-slate-300 bg-white p-2 rounded-full shadow-sm border border-slate-100">
                  <Lock size={28} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - VISUALS Reference */}
        <div className="space-y-8">
          {/* VISUAL REFERENCE */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-black text-slate-800 text-lg mb-8">Referencia Visual de Borde</h3>

            {/* PIZZA VISUALIZATION */}
            <div className="relative w-full aspect-square bg-slate-50 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center mb-6">
              {/* Sauce Zone */}
              <div className="w-[75%] h-[75%] bg-red-100 rounded-full flex items-center justify-center relative">
                <p className="text-[10px] font-bold text-red-300 uppercase rotate-[-15deg]">Area de Salsa & Queso</p>

                {/* Measurement Label */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white px-2 py-1 shadow-md rounded border border-red-100 text-[10px] font-bold text-red-500 whitespace-nowrap z-10">
                  2cm Borde Libre
                </div>
                {/* Line */}
                <div className="absolute right-0 top-1/2 w-[12.5%] h-px bg-red-300 translate-x-full"></div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={14} className="text-slate-600" />
                <h4 className="font-bold text-xs text-slate-800 uppercase">Estándar de Calidad</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                El borde no debe exceder los 2cm ni ser menor a 1.5cm. El queso quemado en bordes se considera defecto crítico.
              </p>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Info size={14} className="text-blue-600" />
                <h4 className="font-bold text-xs text-blue-800 uppercase">Nota del Propietario</h4>
              </div>
              <p className="text-xs text-blue-700 leading-relaxed">
                Estos estándares son mandatorios para todas las sucursales. Cualquier desviación sistemática debe ser reportada inmediatamente.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
