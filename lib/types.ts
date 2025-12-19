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
export type OrderStatus = 'pendiente' | 'preparando' | 'horno' | 'en_corte' | 'listo_para_servir' | 'en_delivery' | 'entregado' | 'cancelado';
export type OrderType = 'mesa' | 'llevar' | 'delivery';

export interface OrderItem {
  id: string;
  nombre: string;
  cantidad: number;
  precio: number;
  notas?: string;

  // New: Item-level tracking
  recipeId?: string; // Para vincular con la receta y sus tiempos
  estado: OrderStatus;
  startTime?: Date;
  timestamps?: {
    [key in OrderStatus]?: Date;
  };
}

export interface Order {
  id: string;
  cliente: string;
  tipo: OrderType;
  mesa?: string;
  direccion?: string;
  items: OrderItem[];
  total: number;
  estado: OrderStatus; // Estado general (ej: 'preparando' si al menos uno está en proceso)
  pagado: boolean;
  createdAt: Date;
  startTime?: Date;
  defectReason?: string;
  timestamps?: {
    [key in OrderStatus]?: Date;
  };
}

// RECETAS
export interface RecipeIngredient {
  name: string;
  amount: string;
}

export interface Recipe {
  id: string;
  name: string;
  image?: string;
  ingredients: RecipeIngredient[];
  steps: string[];

  // Tiempos limite en segundos
  prepTime?: number; // Mesa de trabajo
  cookTime?: number; // Horno
  cutTime?: number;  // Expedición
}
