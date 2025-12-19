import { Recipe } from '@/lib/types';
import {
  AlertTriangle,
  CheckCircle,
  ChefHat,
  ChevronRight,
  Clock,
  Flame,
  Scale,
  Search,
  Thermometer,
  UtensilsCrossed
} from 'lucide-react';
import { useState } from 'react';

interface RecipesViewProps {
  recipes: Recipe[];
}

export default function RecipesView({ recipes }: RecipesViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'pizzas' | 'masas' | 'salsas'>('all');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(recipes[0] || null); // Default to first recipe
  const [previewSize, setPreviewSize] = useState<'mediana' | 'familiar'>('familiar');

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 animate-in fade-in duration-500">

      {/* LEFT SIDEBAR: LIST */}
      <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-4 h-full overflow-hidden">

        {/* Header & Search */}
        <div className="shrink-0 space-y-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800">Libro de Recetas</h1>
            <p className="text-xs text-slate-500 font-bold">Estándares y Procedimientos</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-sm shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { id: 'all', label: 'Todo' },
              { id: 'pizzas', label: 'Pizzas' },
              { id: 'masas', label: 'Masas' },
              { id: 'salsas', label: 'Salsas' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${selectedCategory === cat.id ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recipe List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
          {filteredRecipes.map(recipe => (
            <button
              key={recipe.id}
              onClick={() => setSelectedRecipe(recipe)}
              className={`w-full text-left p-3 rounded-xl border transition-all group relative overflow-hidden ${selectedRecipe?.id === recipe.id ? 'bg-white ring-2 ring-red-500 shadow-md border-transparent z-10' : 'bg-white border-slate-200 hover:border-red-200 hover:shadow-sm'}`}
            >
              {selectedRecipe?.id === recipe.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>}
              <div className="flex justify-between items-start mb-1 pl-2">
                <h3 className={`font-bold text-sm leading-tight ${selectedRecipe?.id === recipe.id ? 'text-slate-900' : 'text-slate-600 group-hover:text-red-600'}`}>
                  {recipe.name}
                </h3>
                {selectedRecipe?.id === recipe.id && <ChevronRight size={16} className="text-red-500" />}
              </div>
              <div className="flex items-center gap-2 pl-2 mt-2">
                {recipe.tags?.map((tag, i) => (
                  <span key={i} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">{tag}</span>
                ))}
                <span className="text-[10px] text-slate-400 flex items-center gap-1 ml-auto">
                  <Clock size={10} /> {Number(((recipe.prepTime || 0) / 60).toFixed(1))}m
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT MAIN: DETAILED VIEW */}
      {selectedRecipe ? (
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">

          {/* Hero Section */}
          <div className="relative h-48 bg-slate-900 shrink-0">
            {selectedRecipe.image && (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent z-10"></div>
                <img src={selectedRecipe.image} className="w-full h-full object-cover opacity-80" alt={selectedRecipe.name} />
              </>
            )}
            <div className={`absolute bottom-0 left-0 right-0 p-6 z-20 ${!selectedRecipe.image && 'h-full flex flex-col justify-end'}`}>
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-black text-white mb-2">{selectedRecipe.name}</h2>
                  <div className="flex gap-2">
                    {selectedRecipe.tags?.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-bold text-white border border-white/10 uppercase tracking-wide">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Stats Grid */}
                <div className="flex gap-4">
                  <div className="text-center px-4 py-2 bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700/50">
                    <div className="text-xs text-slate-400 font-bold uppercase mb-1 flex items-center justify-center gap-1"><ChefHat size={12} /> Prep</div>
                    <div className="text-xl font-black text-white">{Number(((selectedRecipe.prepTime || 0) / 60).toFixed(1))}m</div>
                  </div>
                  <div className="text-center px-4 py-2 bg-red-600/90 backdrop-blur rounded-xl border border-red-500/50 shadow-lg shadow-red-900/20">
                    <div className="text-xs text-white/80 font-bold uppercase mb-1 flex items-center justify-center gap-1"><Flame size={12} /> Horno</div>
                    <div className="text-xl font-black text-white">{Number(((selectedRecipe.cookTime || 0) / 60).toFixed(1))}m</div>
                  </div>
                  {selectedRecipe.temp && (
                    <div className="text-center px-4 py-2 bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700/50">
                      <div className="text-xs text-slate-400 font-bold uppercase mb-1 flex items-center justify-center gap-1"><Thermometer size={12} /> Temp</div>
                      <div className="text-xl font-black text-white">{selectedRecipe.temp}°C</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* LEFT COL: INGREDIENTS */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                    <div className="p-1.5 bg-red-100 rounded-lg text-red-600"><Scale size={18} /></div>
                    Ingredientes & Gramaje
                  </h3>

                  {/* Size Toggle */}
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                      onClick={() => setPreviewSize('mediana')}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${previewSize === 'mediana' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Mediana
                    </button>
                    <button
                      onClick={() => setPreviewSize('familiar')}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${previewSize === 'familiar' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Familiar
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="grid grid-cols-[1fr_auto] bg-slate-50 px-4 py-2 border-b border-slate-200 text-xs font-black text-slate-400 uppercase tracking-wider">
                    <span>Ingrediente</span>
                    <span>Cantidad ({previewSize === 'mediana' ? '12"' : '16"'})</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {selectedRecipe.ingredients.map((ing, i) => (
                      <div key={i} className="grid grid-cols-[1fr_auto] px-4 py-3 hover:bg-slate-50 transition-colors items-center">
                        <span className="text-sm font-medium text-slate-700">{ing.name}</span>
                        <span className="text-base font-bold text-red-600 font-mono">
                          {previewSize === 'familiar' ? ing.quantity.familiar : ing.quantity.mediana}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quality Critical Control Point */}
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 items-start">
                  <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-sm font-bold text-amber-800 mb-1">Punto Crítico de Calidad</h4>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Respetar rigurosamente los gramajes para asegurar el costo y la calidad de cocción. El exceso de ingredientes puede causar masa cruda en el centro.
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT COL: STEPS */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-slate-100 rounded-lg text-slate-700"><UtensilsCrossed size={18} /></div>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Pasos de Preparación</h3>
                </div>

                <div className="space-y-6 relative pl-3">
                  <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-200"></div>

                  {/* Steps Map */}
                  {selectedRecipe.steps && selectedRecipe.steps.map((step, i) => (
                    <div key={i} className="relative flex gap-4 group">
                      <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 text-slate-400 font-bold flex items-center justify-center shrink-0 z-10 shadow-sm group-hover:border-red-500 group-hover:text-red-500 transition-colors">
                        {i + 1}
                      </div>
                      <div className="pt-1">
                        <h4 className="font-bold text-slate-800 text-base">{step.title}</h4>
                        <p className="text-sm text-slate-500 mt-1 leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  ))}

                  {/* Finish Step */}
                  <div className="relative flex gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-slate-900 text-white font-bold flex items-center justify-center shrink-0 z-10 shadow-sm">
                      <CheckCircle size={18} />
                    </div>
                    <div className="pt-1">
                      <h4 className="font-bold text-slate-900 text-base">Control de Calidad</h4>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">Verificar bordes dorados, queso burbujeante y corte simétrico en 8 porciones.</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* VISUAL STANDARD FOOTER */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">Estándar Visual</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-sm">
                  <span className="text-2xl mb-2 block grayscale opacity-80">📏</span>
                  <p className="font-bold text-slate-800 text-xs uppercase">Borde Libre</p>
                  <p className="text-slate-400 text-[10px] font-bold mt-1">2.0 cm Exactos</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-sm">
                  <span className="text-2xl mb-2 block grayscale opacity-80">🍕</span>
                  <p className="font-bold text-slate-800 text-xs uppercase">Porcionado</p>
                  <p className="text-slate-400 text-[10px] font-bold mt-1">8 Triángulos Iguales</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-sm">
                  <span className="text-2xl mb-2 block grayscale opacity-80">🎨</span>
                  <p className="font-bold text-slate-800 text-xs uppercase">Coloración</p>
                  <p className="text-slate-400 text-[10px] font-bold mt-1">Dorado Intenso</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
          <Search size={48} className="mb-4 opacity-50" />
          <p className="text-lg font-bold">Selecciona una receta</p>
        </div>
      )}
    </div>
  );
}
