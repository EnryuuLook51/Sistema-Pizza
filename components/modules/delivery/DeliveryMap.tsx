"use client";

import { Order } from "@/lib/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Crosshair, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

// Fix Leaflet Default Icon in Webpack/Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icon for Orders
// We can use L.divIcon to render HTML (lucide icons) but for stability let's use standard colored markers or images for now,
// or use a DivIcon with a class to style it.
const createCustomIcon = (color: string) => {
  return new L.DivIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const RestaurantIcon = new L.DivIcon({
  className: 'restaurant-marker',
  html: `<div style="background-color: #dc2626; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; display:flex; align-items:center; justify-content:center; box-shadow: 0 4px 10px rgba(220, 38, 38, 0.4);">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Component to handle map centering
function MapController({ activeOrder, orders }: { activeOrder?: Order, orders: OrderWithCoords[] }) {
  const map = useMap();

  useEffect(() => {
    if (activeOrder) {
      // Find coords of active order
      const target = orders.find(o => o.id === activeOrder.id);
      if (target) {
        map.flyTo(target.coords, 16, { duration: 1.5 });
      }
    }
  }, [activeOrder, map, orders]);

  return null;
}

// Mock Coords Mapping (Deterministic based on ID chars/length or just mock)
// We will assign random coords around a center point for demo.
// Center: Ingeniería de Sistemas e Informática (Nuevo Chimbote)
const CENTER: [number, number] = [-9.119678, -78.515266];

interface OrderWithCoords extends Order {
  coords: [number, number];
}

interface DeliveryMapProps {
  orders: Order[];
  activeOrderId?: string;
}

// Custom Icon for User Location
const UserIcon = new L.DivIcon({
  className: 'user-marker',
  html: `<div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(59, 130, 246, 0.5); position: relative;">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Component to handle map controls inside the context
function MapControls({
  onLocate,
}: {
  onLocate: () => void,
}) {
  const map = useMap();

  return (
    <div className="absolute bottom-10 right-10 flex flex-col gap-2 z-[1000]">
      <button
        onClick={() => map.zoomIn()}
        className="size-12 rounded-full bg-white text-slate-700 border border-slate-200 shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors"
      >
        <Plus size={24} />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="size-12 rounded-full bg-white text-slate-700 border border-slate-200 shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors"
      >
        <Minus size={24} />
      </button>
      <button
        onClick={onLocate}
        className="size-12 rounded-full bg-red-600 text-white shadow-lg shadow-red-200 flex items-center justify-center mt-2 hover:bg-red-700 transition-transform hover:scale-105"
      >
        <Crosshair size={24} />
      </button>
    </div>
  );
}

export default function DeliveryMap({ orders, activeOrderId }: DeliveryMapProps) {

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Augment orders with coordinates (stable based on ID for demo)
  const ordersWithCoords: OrderWithCoords[] = orders.map((o, index) => {
    // Generate slight offsets from center
    const latOffset = ((((o.id.charCodeAt(0) * 123) % 100) / 10000) * (index % 2 === 0 ? 1 : -1));
    const lngOffset = ((((o.id.charCodeAt(1) * 321) % 100) / 10000) * (index % 3 === 0 ? 1 : -1)) + 0.005; // Shift right
    return {
      ...o,
      coords: [CENTER[0] + latOffset, CENTER[1] + lngOffset]
    };
  });

  const activeOrder = ordersWithCoords.find(o => o.id === activeOrderId);

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={CENTER}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full outline-none"
        zoomControl={false} // Custom zoom buttons
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapController activeOrder={activeOrder} orders={ordersWithCoords} />

        <ControlsWrapper setUserLocation={setUserLocation} />

        {/* Restaurant Marker */}
        <Marker position={CENTER} icon={RestaurantIcon}>
          <Popup className="font-sans">Base Central</Popup>
        </Marker>

        {/* User Marker */}
        {userLocation && (
          <Marker position={userLocation} icon={UserIcon}>
            <Popup className="font-sans">Tu Ubicación</Popup>
          </Marker>
        )}

        {/* Order Markers */}
        {ordersWithCoords.map(order => {
          const isActive = order.id === activeOrderId;
          return (
            <Marker
              key={order.id}
              position={order.coords}
              icon={createCustomIcon(isActive ? '#dc2626' : (order.estado === 'entregado' ? '#10b981' : '#64748b'))}
              zIndexOffset={isActive ? 1000 : 0}
            >
              <Popup className="font-sans">
                <div className="p-1">
                  <h3 className="font-bold text-sm mb-1">{order.direccion}</h3>
                  <p className="text-xs text-gray-500">{order.cliente}</p>
                  {isActive && <span className="text-[10px] font-bold text-red-600 uppercase mt-1 block">Destino Actual</span>}
                </div>
              </Popup>
            </Marker>
          );
        })}

      </MapContainer>
    </div>
  );
}

// Internal wrapper to access useMap for geolocation
function ControlsWrapper({ setUserLocation }: { setUserLocation: (loc: [number, number]) => void }) {
  const map = useMap();

  const handleLocate = () => {
    map.locate().on("locationfound", function (e) {
      setUserLocation([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, map.getZoom());
    });
  };

  return <MapControls onLocate={handleLocate} />;
}
