import { db } from "@/lib/firebase";
import { Order, OrderStatus } from "@/lib/types";
import { addDoc, collection, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Suscribirse a la colección de órdenes ordenadas por fecha de creación (descendiente)
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id, // Firestore ID priority override
          // Convertir Timestamp de Firestore a Date de JS si es necesario
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          // Convertir timestamps de estados
          timestamps: data.timestamps ? Object.fromEntries(
            Object.entries(data.timestamps).map(([key, value]: [string, any]) => [
              key,
              value?.toDate ? value.toDate() : new Date(value)
            ])
          ) : {},
          // Convertir timestamps internos de items si existen
          items: (data.items || []).map((item: any) => ({
            ...item,
            startTime: item.startTime?.toDate ? item.startTime.toDate() : item.startTime ? new Date(item.startTime) : undefined,
            timestamps: item.timestamps ? Object.fromEntries(
              Object.entries(item.timestamps).map(([key, value]: [string, any]) => [
                key,
                value?.toDate ? value.toDate() : new Date(value)
              ])
            ) : {}
          }))
        };
      }) as Order[];

      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Helper to strip undefined values (recursively)
  const sanitize = (obj: any): any => {
    return JSON.parse(JSON.stringify(obj));
  };

  // Crear nueva orden (Desde POS)
  const createOrder = async (orderData: Partial<Order>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createdAt, ...cleanOrder } = orderData as Order;

    try {
      const finalOrder = {
        ...cleanOrder,
        mesa: cleanOrder.mesa || null,
        direccion: cleanOrder.direccion || null,
        telefono: cleanOrder.telefono || null,
        location: cleanOrder.location || null,
        createdAt: new Date(),
        items: cleanOrder.items.map(item => ({
          ...item,
          // Asegurar que no vayan undefined en opcionales
          ...(item.notas ? { notas: item.notas } : {}),
          ...(item.recipeId ? { recipeId: item.recipeId } : {}),
          ...(item.removedIngredients ? { removedIngredients: item.removedIngredients } : {}),
          estado: 'pendiente' as OrderStatus,
          startTime: null
        })),
        estado: 'pendiente',
        pagado: cleanOrder.pagado || false
      };

      await addDoc(collection(db, "orders"), sanitize(finalOrder));
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  };

  // Actualizar estado general de la orden (Desde Delivery o Caja)
  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    try {
      const orderRef = doc(db, "orders", id);
      const updateData: any = { estado: status };

      // Guardar timestamp del nuevo estado
      updateData[`timestamps.${status}`] = new Date();

      await updateDoc(orderRef, sanitize(updateData));
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  // Actualizar el estado de UN ITEM específico (Desde Cocina KDS)
  const updateOrderItemStatus = async (orderId: string, itemId: string, newStatus: OrderStatus, updates?: Partial<any>) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const updatedItems = order.items.map(item => {
        if (item.id === itemId) {
          const now = new Date();
          const newTimestamps = { ...item.timestamps, [newStatus]: now };

          return {
            ...item,
            ...updates, // Merge any additional updates (like notes/reason)
            estado: newStatus,
            // Actualizamos timestamps específicos por estado
            timestamps: newTimestamps,
            // startTime sigue controlando el inicio "general" de preparación
            startTime: newStatus !== 'pendiente' && !item.startTime ? now : item.startTime
          };
        }
        return item;
      });

      // Lógica opcional: Si todos los items están 'listo_para_servir', la orden entera cambia de estado
      const allReady = updatedItems.every(i => i.estado === 'listo_para_servir' || i.estado === 'entregado' || i.estado === 'cancelado');
      const anyCooking = updatedItems.some(i => ['preparando', 'horno', 'en_corte'].includes(i.estado));

      let newOrderState = order.estado;
      if (allReady && order.estado !== 'entregado') newOrderState = 'listo_para_servir';
      else if (anyCooking && order.estado === 'pendiente') newOrderState = 'preparando';

      const orderRef = doc(db, "orders", orderId);

      // Sanitizamos TODO el objeto antes de enviar
      await updateDoc(orderRef, sanitize({
        items: updatedItems,
        estado: newOrderState
      }));

    } catch (error) {
      console.error("Error updating item status:", error);
    }
  };

  // Pagar orden
  const markAsPaid = async (id: string) => {
    try {
      const orderRef = doc(db, "orders", id);
      await updateDoc(orderRef, { pagado: true });
    } catch (error) {
      console.error("Error paying order:", error);
    }
  };

  return {
    orders,
    loading,
    createOrder,
    updateOrderStatus,
    updateOrderItemStatus,
    markAsPaid
  };
}
