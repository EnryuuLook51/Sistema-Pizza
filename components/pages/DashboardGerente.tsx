"use client";

import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { LogOut, PieChart } from "lucide-react";

export default function DashboardGerente() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 p-2 rounded-lg text-white">
            <PieChart size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Panel Gerencial</h1>
        </div>
        <button
          onClick={() => signOut(auth)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-red-600 transition-colors"
        >
          <LogOut size={16} /> Cerrar Sesión
        </button>
      </header>

      <main className="p-8">
        <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-100">
          <PieChart size={48} className="mb-4 opacity-50" />
          <h2 className="text-lg font-bold text-slate-600">Métricas en Construcción</h2>
          <p>Próximamente verás aquí gráficas de ventas y rendimiento.</p>
        </div>
      </main>
    </div>
  );
}
