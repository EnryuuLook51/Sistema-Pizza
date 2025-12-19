import { auth } from "@/lib/firebase";
import { Order } from "@/lib/types";
import { signOut } from "firebase/auth";
import { CheckCircle, Clock, LogOut, MapPin, Truck } from "lucide-react";
import { useState } from "react";

// MOCK DATA (Simulando pedidos asignados a este delivery)
const MOCK_DELIVERY_ORDERS: Order[] = [
  {
    id: "103",
    cliente: "Ana García",
    tipo: "delivery",
    direccion: "Av. Siempre Viva 123, Springfield",
    items: [{ id: "p3", nombre: "Pizza Suprema", cantidad: 1, precio: 15 }],
    total: 15,
    estado: "en_delivery",
    pagado: false,
    createdAt: new Date(),
  },
  {
    id: "105",
    cliente: "Carlos López",
    tipo: "delivery",
    direccion: "Calle Falsa 123",
    items: [{ id: "p4", nombre: "Pizza Hawaiana", cantidad: 2, precio: 30 }],
    total: 30,
    estado: "entregado", // Historial
    pagado: true,
    createdAt: new Date(Date.now() - 3600000), // Hace 1 hora
  }
];

export default function DashboardDelivery() {
  const [orders, setOrders] = useState<Order[]>(MOCK_DELIVERY_ORDERS);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const markAsDelivered = (id: string) => {
    // En una app real, esto enviaría la actualización a Firebase
    setOrders(orders.map(o => o.id === id ? { ...o, estado: "entregado", pagado: true } : o));
    alert("¡Pedido entregado con éxito!");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 pb-24">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600 rounded-full">
            <Truck size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Modo Ruta</h1>
            <p className="text-gray-400 text-sm">Tus entregas asignadas</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* LISTA DE PEDIDOS PENDIENTES */}
      <h2 className="text-lg font-semibold mb-4 text-gray-300">En Curso</h2>
      <div className="space-y-4">
        {orders.filter(o => o.estado === 'en_delivery').length === 0 && (
          <div className="text-center py-10 bg-gray-800 rounded-xl border border-dashed border-gray-700">
            <p className="text-gray-500">No tienes pedidos pendientes</p>
          </div>
        )}

        {orders.filter(o => o.estado === 'en_delivery').map(order => (
          <div key={order.id} className="bg-gray-800 rounded-xl p-5 border border-gray-700 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-500 text-black font-bold text-xs px-2 py-1 rounded-bl-lg">
              PENDIENTE DE ENTREGA
            </div>

            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{order.cliente}</h3>
                <div className="flex items-center gap-2 text-gray-300 mt-1">
                  <MapPin size={16} className="text-red-500" />
                  <span className="text-sm">{order.direccion}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-2xl font-bold">${order.total}</span>
                <span className="text-xs bg-red-900/50 text-red-200 px-2 py-0.5 rounded uppercase font-bold">
                  {order.pagado ? 'Pagado' : 'Por Cobrar'}
                </span>
              </div>
            </div>

            <div className="bg-gray-900/50 p-3 rounded-lg mb-4 text-sm text-gray-400">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{item.cantidad}x {item.nombre}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => markAsDelivered(order.id)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <CheckCircle size={20} />
              Confirmar Entrega
            </button>
          </div>
        ))}
      </div>

      {/* HISTORIAL RECIENTE */}
      <h2 className="text-lg font-semibold mt-8 mb-4 text-gray-300">Entregados Hoy</h2>
      <div className="space-y-4 opacity-70">
        {orders.filter(o => o.estado === 'entregado').map(order => (
          <div key={order.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-300">{order.cliente}</p>
              <p className="text-xs text-gray-500">{order.direccion}</p>
            </div>
            <div className="text-right">
              <p className="text-green-500 font-bold flex items-center gap-1 text-sm">
                <CheckCircle size={12} /> Entregado
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                <Clock size={10} /> 12:45
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
