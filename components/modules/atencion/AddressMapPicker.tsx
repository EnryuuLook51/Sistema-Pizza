"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Check, MapPin, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";

// Fix Leaflet Default Icon
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface AddressMapPickerProps {
  onConfirm: (address: string, lat: number, lng: number) => void;
  onClose: () => void;
  initialLocation?: { lat: number; lng: number };
  initialQuery?: string;
}

// Center: Ingeniería de Sistemas e Informática (Nuevo Chimbote)
const DEFAULT_CENTER: [number, number] = [-9.119678, -78.515266];

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

function LocationMarker({ onSelect, externalPosition, label }: { onSelect: (lat: number, lng: number) => void, externalPosition: [number, number] | null, label?: string }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onSelect(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  useEffect(() => {
    if (externalPosition) {
      const newPos = new L.LatLng(externalPosition[0], externalPosition[1]);
      setPosition(newPos);
      map.setView(newPos, 16);
    }
  }, [externalPosition, map]);

  return position === null ? null : (
    <Marker position={position}>
      {label && <Popup>{label}</Popup>}
    </Marker>
  );
}

export default function AddressMapPicker({ onConfirm, onClose, initialQuery }: AddressMapPickerProps) {
  const [query, setQuery] = useState(initialQuery || "");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);

  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [loadingAddress, setLoadingAddress] = useState(false);

  // Auto-search on mount if initialQuery provided
  useEffect(() => {
    if (initialQuery && initialQuery.length > 3) {
      performSearch(initialQuery);
    }
  }, []);

  const performSearch = async (q: string) => {
    setSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=pe&limit=5`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error searching address:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    performSearch(query);
  };

  // ... rest of component same logic ...

  const handleSelectResult = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSelectedPosition([lat, lng]);
    setSelectedAddress(result.display_name.split(',')[0]);
    setResults([]);
  };

  // Reverse Geocoding (Coords -> Address)
  const fetchAddressFromCoords = async (lat: number, lng: number) => {
    setLoadingAddress(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data.display_name) {
        const parts = data.display_name.split(',');
        setSelectedAddress(`${parts[0]}, ${parts[1] || ''}`);
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      setSelectedAddress("Ubicación marcada (Dirección no encontrada)");
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedPosition([lat, lng]);
    fetchAddressFromCoords(lat, lng);
  };

  const handleConfirm = () => {
    if (selectedPosition && selectedAddress) {
      onConfirm(selectedAddress, selectedPosition[0], selectedPosition[1]);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden relative">
        {/* Header same as before */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
          <div>
            <h3 className="font-black text-lg text-slate-800 flex items-center gap-2">
              <MapPin className="text-red-600" /> Seleccionar Ubicación
            </h3>
            <p className="text-xs text-slate-500 font-medium">Busca o selecciona el punto exacto de entrega</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative bg-slate-100">
          {/* Search Overlay */}
          <div className="absolute top-4 left-4 right-4 z-[1001] max-w-md mx-auto shadow-xl">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar dirección (ej: Av. Pacifico)..."
                  className="w-full h-12 pl-10 pr-4 rounded-xl border-0 shadow-sm text-sm font-medium focus:ring-2 focus:ring-red-600 outline-none"
                />
                <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
              </div>
              <button
                type="submit"
                disabled={searching}
                className="h-12 px-6 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors disabled:opacity-80"
              >
                {searching ? '...' : 'Buscar'}
              </button>
            </form>
            {/* Results same as before */}
            {results.length > 0 && (
              <div className="mt-2 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
                {results.map((result) => (
                  <button
                    key={result.place_id}
                    type="button"
                    className="w-full text-left px-4 py-3 text-xs md:text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0 font-medium text-slate-700"
                    onClick={() => handleSelectResult(result)}
                  >
                    {result.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <MapContainer
            center={DEFAULT_CENTER}
            zoom={15}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <LocationMarker
              onSelect={handleMapClick}
              externalPosition={selectedPosition}
              label={selectedAddress}
            />
          </MapContainer>
        </div>

        {/* Footer same as before */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="p-3 bg-red-50 rounded-full text-red-600 shrink-0">
              <MapPin size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Dirección Seleccionada</p>
              <p className="font-bold text-slate-800 text-sm md:text-base leading-tight">
                {loadingAddress ? <span className="animate-pulse text-slate-400">Detectando dirección...</span> : (selectedAddress || "Ninguna ubicación seleccionada")}
              </p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={onClose}
              className="flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedPosition || loadingAddress}
              className="flex-1 md:flex-none px-8 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2"
            >
              <Check size={18} /> Confirmar Ubicación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
