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
  createdAt?: Date;  // En Firebase será Timestamp, pero para TS usamos Date o any para evitar conflictos iniciales
}
