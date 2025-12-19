"use client";

import { Order } from "@/lib/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Crosshair, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

/* ───────── Leaflet icon fix ───────── */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

/* ───────── Constantes ───────── */
const CENTER: [number, number] = [-9.119678, -78.515266];

/* ───────── Tipos ───────── */
interface OrderWithCoords extends Order {
  coords: [number, number];
}

interface DeliveryMapProps {
  orders: Order[];
  activeOrderId?: string;
}

/* ───────── Iconos ───────── */
const createCustomIcon = (color: string) =>
  new L.DivIcon({
    className: "custom-marker",
    html: `<div style="
      background:${color};
      width:24px;height:24px;
      border-radius:50%;
      border:3px solid white;
      box-shadow:0 4px 6px rgba(0,0,0,.3)">
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

const RestaurantIcon = new L.DivIcon({
  className: "restaurant-marker",
  html: `<div style="
    background:#dc2626;
    width:32px;height:32px;
    border-radius:50%;
    border:3px solid white;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 4px 10px rgba(220,38,38,.4)">
    🍕
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const UserIcon = new L.DivIcon({
  className: "user-marker",
  html: `<div style="
    background:#3b82f6;
    width:24px;height:24px;
    border-radius:50%;
    border:3px solid white;
    box-shadow:0 0 15px rgba(59,130,246,.5)">
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

/* ───────── Componentes ───────── */

function MapController({
  coords,
}: {
  coords?: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 16, { duration: 1.5 });
    }
  }, [coords, map]);

  return null;
}

function UserLocationMarker({
  position,
}: {
  position: [number, number] | null;
}) {
  if (!position) return null;

  return (
    <Marker position={position} icon={UserIcon}>
      <Popup>Tu ubicación actual</Popup>
    </Marker>
  );
}

function MapControls({
  onLocate,
}: {
  onLocate: () => void;
}) {
  const map = useMap();

  return (
    <div className="absolute bottom-10 right-10 z-[1000] flex flex-col gap-2">
      <button
        onClick={() => map.zoomIn()}
        className="size-12 bg-white rounded-full shadow flex items-center justify-center"
      >
        <Plus />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="size-12 bg-white rounded-full shadow flex items-center justify-center"
      >
        <Minus />
      </button>
      <button
        onClick={onLocate}
        className="size-12 bg-red-600 text-white rounded-full shadow flex items-center justify-center"
      >
        <Crosshair />
      </button>
    </div>
  );
}

/* ───────── Main Component ───────── */

export default function DeliveryMap({
  orders,
  activeOrderId,
}: DeliveryMapProps) {
  const [userLocation, setUserLocation] =
    useState<[number, number] | null>(null);

  const ordersWithCoords: OrderWithCoords[] = orders
    .filter(o => o.location && o.location.lat && o.location.lng)
    .map(o => ({
      ...o,
      coords: [o.location!.lat, o.location!.lng]
    }));

  const activeOrder = ordersWithCoords.find(
    (o) => o.id === activeOrderId
  );

  const handleLocate = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLocation([
          pos.coords.latitude,
          pos.coords.longitude,
        ]),
      () => alert("No se pudo obtener tu ubicación")
    );
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={CENTER}
        zoom={14}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <Marker position={CENTER} icon={RestaurantIcon}>
          <Popup>PizzaOps Central</Popup>
        </Marker>

        <UserLocationMarker position={userLocation} />

        {ordersWithCoords.map((o) => (
          <Marker
            key={o.id}
            position={o.coords}
            icon={
              o.id === activeOrderId
                ? createCustomIcon("#dc2626")
                : createCustomIcon("#64748b")
            }
          >
            <Popup>{o.direccion}</Popup>
          </Marker>
        ))}

        <MapController coords={activeOrder?.coords} />
        <MapControls onLocate={handleLocate} />
      </MapContainer>
    </div>
  );
}
