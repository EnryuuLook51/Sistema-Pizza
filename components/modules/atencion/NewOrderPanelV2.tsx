"use client";

import { Order, OrderItem, OrderType, Recipe } from "@/lib/types";
import { ChevronLeft, MapPin, Plus, ShoppingBag, Trash2, Truck, Utensils } from "lucide-react";
import dynamic from 'next/dynamic';
import { useMemo, useState } from "react";

// Import recipes directly
import recipesData from '@/data/recipes.json';

const AddressMapPicker = dynamic(() => import('./AddressMapPicker'), {
  ssr: false,
  loading: () => <div className="w-full h-48 bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-slate-400 text-xs">Cargando Mapa...</div>
});

const RECIPES = recipesData as Recipe[];

const DRINKS = [
  { id: 'd1', name: 'Coca Cola 1.5L', price: 12 },
  { id: 'd2', name: 'Inka Kola 1.5L', price: 12 },
  { id: 'd3', name: 'Agua San Mateo 1L', price: 6 },
  { id: 'd4', name: 'Cerveza Cusqueña', price: 10 },
];

const EXTRAS = [
  { id: 'e1', name: 'Queso Extra', price: 4 },
  { id: 'e2', name: 'Pan al Ajo (6u)', price: 8 },
  { id: 'e3', name: 'Alitas BBQ (6u)', price: 15 },
];

interface CartItem {
  tempId: string;
  type: 'pizza' | 'drink' | 'extra';
  id: string; // recipeId or productId
  name: string;
  price: number;
  quantity: number;
  removedIngredients: string[];
  notas?: string;
}

interface NewOrderPanelProps {
  onCreate: (o: Order) => void;
}

export default function NewOrderPanel({ onCreate }: NewOrderPanelProps) {
  // ORDER HEADERS
  const [orderType, setOrderType] = useState<OrderType>('llevar');
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [tableNumber, setTableNumber] = useState("1");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [showMapModal, setShowMapModal] = useState(false);

  // POS LOGIC
  const [category, setCategory] = useState<'pizzas' | 'bebidas'>('pizzas');
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  // SELECTION & CUSTOMIZATION
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [customRemovedIngredients, setCustomRemovedIngredients] = useState<string[]>([]);
  const [customNotes, setCustomNotes] = useState("");
  const [customSize, setCustomSize] = useState<'familiar' | 'mediana'>('familiar');

  // --- ACTIONS ---

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setCustomRemovedIngredients([]);
    setCustomNotes("");
    setCustomSize('familiar');
  };

  const toggleIngredient = (ingName: string) => {
    if (customRemovedIngredients.includes(ingName)) {
      setCustomRemovedIngredients(prev => prev.filter(i => i !== ingName));
    } else {
      setCustomRemovedIngredients(prev => [...prev, ingName]);
    }
  };

  const addToCart = () => {
    if (!selectedRecipe) return;

    const basePrice = customSize === 'familiar' ? 35 : 25;

    const newItem: CartItem = {
      tempId: Math.random().toString(),
      type: 'pizza',
      id: selectedRecipe.id,
      name: `Pizza ${selectedRecipe.name} (${customSize === 'familiar' ? 'Fam.' : 'Med.'})`,
      price: basePrice,
      quantity: 1,
      removedIngredients: customRemovedIngredients,
      notas: customNotes
    };

    setCart([...cart, newItem]);
    setSelectedRecipe(null); // Back to menu
  };

  const addProductToCart = (item: { id: string, name: string, price: number }, type: 'drink' | 'extra') => {
    const newItem: CartItem = {
      tempId: Math.random().toString(),
      type,
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      removedIngredients: []
    };
    setCart([...cart, newItem]);
  };

  const removeFromCart = (tempId: string) => {
    setCart(prev => prev.filter(i => i.tempId !== tempId));
  };

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);

  const handleSubmit = () => {
    if (cart.length === 0) return;

    const orderItems: OrderItem[] = cart.map(c => ({
      id: Math.random().toString(),
      nombre: c.name,
      cantidad: c.quantity,
      precio: c.price,
      removedIngredients: c.removedIngredients,
      estado: 'pendiente',
      ...(c.notas ? { notas: c.notas } : {}),
      ...(c.type === 'pizza' ? { recipeId: c.id } : {})
    }));

    const newOrder: Order = {
      id: Math.floor(Math.random() * 10000).toString(),
      cliente: orderType === 'mesa' ? `Mesa ${tableNumber}` : clientName || "Cliente",
      tipo: orderType,
      items: orderItems,
      total: cartTotal,
      estado: "pendiente",
      pagado: false,
      createdAt: new Date(),
      // Conditional fields
      ...(orderType === 'mesa' && { mesa: tableNumber }),
      ...(orderType === 'delivery' && {
        direccion: address,
        telefono: clientPhone,
        ...(location && { location })
      })
    };

    onCreate(newOrder);
    // Reset fundamental fields only
    setCart([]);
    setClientName("");
    setClientPhone("");
    setAddress("");
    setLocation(undefined);
  };

  // --- RENDER HELPERS ---

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 shadow-xl z-20 w-full max-w-md shrink-0 font-sans">

      {/* Header Fijo */}
      <div className="px-5 pt-5 pb-3 bg-white border-b border-slate-100">
        <h2 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-wide mb-4">
          <Plus size={16} className="text-red-600" /> Nuevo Pedido <span className="text-[10px] bg-green-100 text-green-700 px-1 rounded">POS v2</span>
        </h2>

        {/* Tipo de Pedido Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button onClick={() => setOrderType('mesa')} className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${orderType === 'mesa' ? 'bg-red-50 border-red-600 text-red-700 ring-1 ring-red-600' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
            <Utensils size={18} className="mb-1" />
            <span className="text-[10px] font-bold uppercase">Mesa</span>
          </button>
          <button onClick={() => setOrderType('llevar')} className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${orderType === 'llevar' ? 'bg-red-50 border-red-600 text-red-700 ring-1 ring-red-600' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
            <ShoppingBag size={18} className="mb-1" />
            <span className="text-[10px] font-bold uppercase">Llevar</span>
          </button>
          <button onClick={() => setOrderType('delivery')} className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${orderType === 'delivery' ? 'bg-red-50 border-red-600 text-red-700 ring-1 ring-red-600' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
            <Truck size={18} className="mb-1" />
            <span className="text-[10px] font-bold uppercase">Deliv.</span>
          </button>
        </div>

        {/* Inputs dinámicos según tipo */}
        <div className="space-y-3 animate-in fade-in duration-300 mb-2">
          {orderType === 'mesa' && (
            <select className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-bold" value={tableNumber} onChange={e => setTableNumber(e.target.value)}>
              {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>Mesa {n}</option>)}
            </select>
          )}

          {(orderType === 'llevar' || orderType === 'delivery') && (
            <input
              placeholder="Nombre del Cliente"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm"
            />
          )}

          {orderType === 'delivery' && (
            <>
              <input
                placeholder="Teléfono (999 999 999)"
                value={clientPhone}
                onChange={e => setClientPhone(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm"
                type="tel"
              />
              <div className="flex gap-2">
                <input
                  placeholder="Dirección..."
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="flex-1 h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm"
                />
                <button
                  onClick={() => setShowMapModal(true)}
                  className={`h-10 px-3 rounded-lg border flex items-center justify-center transition-colors ${location ? 'bg-green-100 border-green-400 text-green-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}
                >
                  <MapPin size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* BODY SCROLLABLE: MENU OR CUSTOMIZATION */}
      <div className="flex-1 overflow-hidden relative">

        {/* VIEW 1: PRODUCT LIST & SEARCH */}
        {!selectedRecipe && (
          <div className="h-full flex flex-col">
            {/* Categories */}
            <div className="flex px-4 py-2 gap-2 border-b border-slate-100 overflow-x-auto scrollbar-hide shrink-0">
              <button onClick={() => setCategory('pizzas')} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${category === 'pizzas' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>Pizzas</button>
              <button onClick={() => setCategory('bebidas')} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${category === 'bebidas' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>Bebidas & Extras</button>
            </div>

            {/* Grid content */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
              {category === 'pizzas' ? (
                <div className="grid grid-cols-2 gap-3">
                  {RECIPES.map(recipe => (
                    <div key={recipe.id} onClick={() => handleSelectRecipe(recipe)} className="group border border-slate-100 rounded-xl overflow-hidden hover:shadow-md cursor-pointer transition-all active:scale-95">
                      <div className="h-24 w-full bg-slate-100 relative">
                        {recipe.image ? (
                          <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300"><Utensils /></div>
                        )}
                      </div>
                      <div className="p-2">
                        <h3 className="font-bold text-xs text-slate-800 leading-tight mb-1">{recipe.name}</h3>
                        <p className="text-[10px] text-slate-500 truncate">{recipe.ingredients.length} Ingredientes</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-xs text-slate-400 uppercase mb-2">Bebidas</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {DRINKS.map(drink => (
                        <div key={drink.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50">
                          <span className="text-sm font-medium text-slate-700">{drink.name}</span>
                          <button onClick={() => addProductToCart(drink, 'drink')} className="text-xs font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:border-red-400 hover:text-red-500 transition-colors">
                            S/. {drink.price}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-400 uppercase mb-2">Extras</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {EXTRAS.map(extra => (
                        <div key={extra.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50">
                          <span className="text-sm font-medium text-slate-700">{extra.name}</span>
                          <button onClick={() => addProductToCart(extra, 'extra')} className="text-xs font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:border-red-400 hover:text-red-500 transition-colors">
                            S/. {extra.price}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: CUSTOMIZATION PANEL */}
        {selectedRecipe && (
          <div className="h-full flex flex-col bg-white animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-2 p-4 border-b border-slate-100">
              <button onClick={() => setSelectedRecipe(null)} className="p-2 -ml-2 hover:bg-slate-100 rounded-full"><ChevronLeft size={20} /></button>
              <span className="font-bold text-sm text-slate-800 line-clamp-1">{selectedRecipe.name}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">

              {/* Size Selection */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Tamaño</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setCustomSize('mediana')} className={`p-3 rounded-xl border text-left transition-all ${customSize === 'mediana' ? 'border-red-500 bg-red-50 ring-1 ring-red-500' : 'border-slate-200'}`}>
                    <div className="font-bold text-slate-800 text-sm">Mediana</div>
                    <div className="text-xs text-slate-500">S/. 25.00</div>
                  </button>
                  <button onClick={() => setCustomSize('familiar')} className={`p-3 rounded-xl border text-left transition-all ${customSize === 'familiar' ? 'border-red-500 bg-red-50 ring-1 ring-red-500' : 'border-slate-200'}`}>
                    <div className="font-bold text-slate-800 text-sm">Familiar</div>
                    <div className="text-xs text-slate-500">S/. 35.00</div>
                  </button>
                </div>
              </div>

              {/* Ingredients Removal */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Ingredientes (Desmarcar para quitar)</label>
                <div className="space-y-2">
                  {selectedRecipe.ingredients.map((ing, idx) => {
                    const isRemoved = customRemovedIngredients.includes(ing.name);
                    const quantity = customSize === 'familiar' ? ing.quantity.familiar : ing.quantity.mediana;

                    return (
                      <label key={idx} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isRemoved ? 'border-slate-100 bg-slate-50 opacity-60' : 'border-green-200 bg-green-50/50'}`}>
                        <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${isRemoved ? 'bg-slate-200' : 'bg-green-500'}`}>
                          {!isRemoved && <Plus size={12} className="text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={!isRemoved} onChange={() => toggleIngredient(ing.name)} />
                        <div>
                          <p className={`text-sm font-medium ${isRemoved ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{ing.name}</p>
                          <p className="text-[10px] text-slate-400">{quantity}</p>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Notas de Cocina</label>
                <textarea
                  value={customNotes}
                  onChange={e => setCustomNotes(e.target.value)}
                  className="w-full h-20 p-3 rounded-xl border border-slate-200 text-sm resize-none focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                  placeholder="Ej. Bien cocida, poca salsa..."
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100">
              <button onClick={addToCart} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-200 transition-all active:scale-95">
                <span>Agregar al Pedido</span>
                <span>S/. {customSize === 'familiar' ? '35.00' : '25.00'}</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* FOOTER: CART SUMMARY */}
      <div className="bg-slate-50 border-t border-slate-200 shrink-0">

        {/* Cart Items Preview */}
        {cart.length > 0 && (
          <div className="max-h-40 overflow-y-auto p-4 space-y-2 border-b border-slate-200 scrollbar-thin">
            {cart.map((item, idx) => (
              <div key={item.tempId} className="flex justify-between items-start gap-2 bg-white p-2 rounded-lg border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-800">{item.name}</p>
                  {item.removedIngredients.length > 0 && (
                    <p className="text-[10px] text-red-500">Sin: {item.removedIngredients.join(', ')}</p>
                  )}
                  {item.notas && <p className="text-[10px] text-slate-400 italic">"{item.notas}"</p>}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-bold text-slate-700">S/. {item.price}</span>
                  <button onClick={() => removeFromCart(item.tempId)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="p-4 pb-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Total Estimado</p>
              <p className="text-2xl font-black text-slate-900">S/. {cartTotal.toFixed(2)}</p>
            </div>
            <p className="text-xs font-bold text-slate-400">{cart.length} Items</p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={cart.length === 0 || (orderType === 'llevar' && !clientName) || (orderType === 'delivery' && (!clientName || !address))}
            className="w-full h-12 bg-slate-900 hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <ShoppingBag size={18} /> CONFIRMAR PEDIDO
          </button>
        </div>
      </div>

      {/* MAP MODAL */}
      {showMapModal && (
        <AddressMapPicker
          initialQuery={address}
          onClose={() => setShowMapModal(false)}
          onConfirm={(addr, lat, lng) => {
            setAddress(addr);
            setLocation({ lat, lng });
            setShowMapModal(false);
          }}
        />
      )}
    </div>
  );
}
