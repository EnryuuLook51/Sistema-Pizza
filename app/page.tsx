'use client';

import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Componente de carga para mostrar mientras llega el dashboard
const DashboardSkeleton = () => (
  <div className="flex bg-gray-50 h-screen w-full items-center justify-center flex-col gap-4">
    <Loader2 className="h-10 w-10 animate-spin text-red-600" />
    <p className="text-gray-500 font-medium">Cargando interfaz...</p>
  </div>
);

// Imports Dinámicos: Solo se descargará el JS del componente que se use
// Imports Dinámicos: Solo se descargará el JS del componente que se use
const DashboardPropietario = dynamic(() => import('@/components/pages/DashboardPropietario'), {
  loading: () => <DashboardSkeleton />,
});
const DashboardGerente = dynamic(() => import('@/components/pages/DashboardGerente'), {
  loading: () => <DashboardSkeleton />,
});
const DashboardPizzero = dynamic(() => import('@/components/pages/DashboardPizzero'), {
  loading: () => <DashboardSkeleton />,
});
const DashboardAtencion = dynamic(() => import('@/components/pages/DashboardAtencion'), {
  loading: () => <DashboardSkeleton />,
});
const DashboardDelivery = dynamic(() => import('@/components/pages/DashboardDelivery'), {
  loading: () => <DashboardSkeleton />,
});

import { useAuth } from '@/components/auth/ProveedorAutenticacion';

export default function HomePage() {
  const { profile, loading } = useAuth();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center p-10 bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Perfil No Encontrado</h1>
          <p className="text-gray-600">
            Tu cuenta ha sido creada, pero no tiene un rol asignado.
            <br />Contacte al Administrador.
          </p>
        </div>
      </div>
    );
  }

  // RENDERIZADO PARA NO SOBRECARGAR
  switch (profile.rol) {
    case 'admin':
      return <DashboardPropietario />;
    case 'gerente':
      return <DashboardGerente />;
    case 'cocina':
      return <DashboardPizzero />;
    case 'atencion':
      return <DashboardAtencion />;
    case 'delivery':
      return <DashboardDelivery />;
    default:
      return (
        <div className="flex min-h-screen items-center justify-center p-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Acceso Restringido</h1>
            <p className="text-gray-600">Rol no asignado o desconocido. Contacte al Admin.</p>
          </div>
        </div>
      );
  }
}
