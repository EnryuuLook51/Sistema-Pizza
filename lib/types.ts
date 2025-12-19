export type UserRole = 'admin' | 'gerente' | 'atencion' | 'cocina' | 'delivery';

export interface UserProfile {
  uid: string;          // El mismo ID que en Firebase Authentication
  nombre: string;       // Ej: "Giovanni"
  email: string;        // Ej: "admin@pizza.com"
  rol: UserRole;        // Solo puede ser uno de los 5 roles de arriba

  // Opcionales
  photoURL?: string;
  turno?: 'mañana' | 'tarde' | 'noche';
  active?: boolean;
  createdAt?: any;  // En Firebase será Timestamp, pero para TS usamos Date o any para evitar conflictos iniciales
}

// TIPOS DE PEDIDOS
export type OrderStatus = 'pendiente' | 'preparando' | 'listo_para_servir' | 'en_delivery' | 'entregado';
export type OrderType = 'mesa' | 'llevar' | 'delivery';

export interface OrderItem {
  id: string;
  nombre: string;
  cantidad: number;
  precio: number;
}

export interface Order {
  id: string;
  cliente: string;
  tipo: OrderType;
  mesa?: string;
  direccion?: string;
  items: OrderItem[];
  total: number;
  estado: OrderStatus;
  pagado: boolean;
  createdAt: Date;
}
