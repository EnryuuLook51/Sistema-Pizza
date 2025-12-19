import { Recipe } from '@/lib/types';
import { Flame, Scale, Search } from 'lucide-react';

interface RecipesViewProps {
  recipes: Recipe[];
}

export default function RecipesView({ recipes }: RecipesViewProps) {
  return (
    <div className="h-full overflow-y-auto max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-800">Manual de Recetas</h2>
        <p className="text-slate-500 font-medium">Estándares exactos para consistencia perfecta.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
        <input type="text" placeholder="Buscar receta (ej. Hawaiana)..." className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none font-medium" />
      </div>

      <div className="grid grid-cols-1 gap-8">
        {recipes.map(recipe => (
          <div key={recipe.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 flex flex-col md:flex-row">
            <div className="md:w-1/3 h-64 md:h-auto relative">
              <img src={recipe.image || 'https://placehold.co/600x400'} alt={recipe.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-white font-black text-2xl leading-none mb-4">{recipe.name}</h3>

                {/* Time Standards */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/20 backdrop-blur-md rounded-lg p-2 text-center border border-white/10">
                    <span className="block text-[10px] uppercase font-bold text-white/70">Armado</span>
                    <span className="block text-white font-bold text-sm">{(recipe.prepTime || 300) / 60}m</span>
                  </div>
                  <div className="bg-orange-500/80 backdrop-blur-md rounded-lg p-2 text-center border border-orange-400/50">
                    <span className="block text-[10px] uppercase font-bold text-white/90">Horno</span>
                    <span className="block text-white font-bold text-sm">{(recipe.cookTime || 300) / 60}m</span>
                  </div>
                  <div className="bg-yellow-500/80 backdrop-blur-md rounded-lg p-2 text-center border border-yellow-400/50">
                    <span className="block text-[10px] uppercase font-bold text-white/90">Corte</span>
                    <span className="block text-white font-bold text-sm">{(recipe.cutTime || 60)}s</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-2/3 p-8 flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <h4 className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Scale size={18} className="text-blue-500" /> Ingredientes
                </h4>
                <ul className="space-y-2 text-sm">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex justify-between items-center text-slate-600">
                      <span>{ing.name}</span>
                      <span className="font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">{ing.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 space-y-4">
                <h4 className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Flame size={18} className="text-red-500" /> Preparación
                </h4>
                <ol className="space-y-3 text-sm">
                  {recipe.steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-slate-600 leading-relaxed">
                      <span className="font-bold text-slate-300">0{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
