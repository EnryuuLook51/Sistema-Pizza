import recipesData from '@/data/recipes.json';
import { db } from "@/lib/firebase";
import { Recipe } from "@/lib/types";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc
} from "firebase/firestore";
import {
  AlertTriangle,
  CheckCircle,
  ChefHat,
  Database,
  Edit,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function MenuGestionView() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'edit'>('list');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState<Recipe | null>(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'recipes'));
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
      setRecipes(list);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMigrate = async () => {
    if (!confirm('Esto importará las recetas del archivo JSON a Firestore. ¿Continuar?')) return;
    setLoading(true);
    try {
      const batch = recipesData.map(async (r) => {
        // Using setDoc with specific ID if possible, or addDoc
        // We will use the ID from json if available, or generate one
        const { id, ...data } = r;
        if (id) {
          await setDoc(doc(db, 'recipes', id), data);
        } else {
          await addDoc(collection(db, 'recipes'), data);
        }
      });
      await Promise.all(batch);

      setMessage({ type: 'success', text: `Importadas ${recipesData.length} recetas correctamente.` });
      fetchRecipes();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setLoading(true);
    try {
      if (formData.id && recipes.some(r => r.id === formData.id)) {
        // Update
        const { id, ...data } = formData;
        await updateDoc(doc(db, 'recipes', id), data as any);
        setMessage({ type: 'success', text: 'Receta actualizada.' });
      } else {
        // Create
        // Remove ID if present to let autogen or use it
        const { id, ...data } = formData;
        if (id) {
          // Try to use this ID
          await setDoc(doc(db, 'recipes', id), data);
        } else {
          await addDoc(collection(db, 'recipes'), data);
        }
        setMessage({ type: 'success', text: 'Nueva receta creada.' });
      }
      setViewMode('list');
      fetchRecipes();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta receta del menú?')) return;
    try {
      await deleteDoc(doc(db, 'recipes', id));
      setMessage({ type: 'success', text: 'Receta eliminada.' });
      fetchRecipes();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const startEdit = (recipe?: Recipe) => {
    if (recipe) {
      setFormData({ ...recipe });
    } else {
      setFormData({
        id: '',
        name: '',
        category: 'pizzas',
        prices: {
          mediana: 0,
          familiar: 0
        },
        ingredients: [],
        steps: [],
        prepTime: 300,
        cookTime: 600,
        temp: 220,
        tags: []
      });
    }
    setViewMode('edit');
  };

  const filtered = recipes.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 animate-in fade-in duration-300">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-8">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gestión de Menú</h1>
            <p className="text-slate-500 text-sm">Precios, Recetas e Ingredientes.</p>
          </div>
          {viewMode === 'list' && (
            <div className="flex gap-3">
              {recipes.length === 0 && (
                <button
                  onClick={handleMigrate}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-bold text-sm"
                >
                  <Database size={18} /> Cargar Defaults
                </button>
              )}
              <button
                onClick={() => startEdit()}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold text-sm shadow-md"
              >
                <Plus size={18} /> Nueva Receta
              </button>
            </div>
          )}
          {viewMode === 'edit' && (
            <button onClick={() => setViewMode('list')} className="text-sm font-bold text-slate-500 hover:text-slate-900">
              Cancelar
            </button>
          )}
        </div>

        {message && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
            <span className="font-medium text-sm">{message.text}</span>
          </div>
        )}

        {viewMode === 'list' ? (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Buscar receta..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase">{filtered.length} Items</span>
            </div>

            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-900 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Producto</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4">Tiempos</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && <tr><td colSpan={4} className="p-8 text-center text-slate-400">Cargando...</td></tr>}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-400">No hay recetas. Pulsa "Cargar Defaults" si es la primera vez.</td></tr>
                )}
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {r.image ? (
                          <img src={r.image} className="size-10 rounded-lg object-cover bg-slate-200" />
                        ) : (
                          <div className="size-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                            <ChefHat size={20} />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{r.name}</p>
                          <div className="flex gap-1">
                            {r.tags?.map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded font-bold">{t}</span>)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold w-fit capitalize mb-1">
                          {r.category}
                        </span>
                        <span className="font-bold text-slate-900 flex flex-col gap-1">
                          <span className="text-xs text-slate-500">M: <span className="text-slate-900 text-sm">S/ {r.prices?.mediana?.toFixed(2) || '0.00'}</span></span>
                          <span className="text-xs text-slate-500">F: <span className="text-slate-900 text-sm">S/ {r.prices?.familiar?.toFixed(2) || '0.00'}</span></span>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      Prep: {r.prepTime}s <br />
                      Horno: {r.cookTime}s
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => startEdit(r)} className="p-2 hover:bg-slate-200 rounded text-slate-600"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(r.id)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* EDIT FORM */
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-xl font-bold mb-6">{formData?.id ? 'Editar Receta' : 'Crear Receta'}</h2>
            <form onSubmit={handleSave} className="space-y-8">

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nombre del Producto</label>
                    <input
                      required
                      className="w-full rounded-lg border-slate-300 focus:ring-red-500 focus:border-red-500"
                      value={formData?.name || ''}
                      onChange={e => setFormData(p => p ? ({ ...p, name: e.target.value }) : null)}
                      placeholder="Ej. Pizza Americana"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Precio Mediana (S/)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">S/</span>
                        <input
                          type="number"
                          step="0.10"
                          required
                          className="w-full pl-8 rounded-lg border-slate-300 focus:ring-red-500 focus:border-red-500 font-bold text-slate-900"
                          value={formData?.prices?.mediana || ''}
                          onChange={e => setFormData(p => p ? ({ ...p, prices: { ...p.prices, mediana: +e.target.value } }) : null)}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Precio Familiar (S/)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">S/</span>
                        <input
                          type="number"
                          step="0.10"
                          required
                          className="w-full pl-8 rounded-lg border-slate-300 focus:ring-red-500 focus:border-red-500 font-bold text-slate-900"
                          value={formData?.prices?.familiar || ''}
                          onChange={e => setFormData(p => p ? ({ ...p, prices: { ...p.prices, familiar: +e.target.value } }) : null)}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Descripción (Marketing)</label>
                    <textarea
                      className="w-full rounded-lg border-slate-300 focus:ring-red-500 focus:border-red-500"
                      rows={2}
                      value={formData?.description || ''}
                      onChange={e => setFormData(p => p ? ({ ...p, description: e.target.value }) : null)}
                      placeholder="Descripción corta para el menú..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Categoría</label>
                    <select
                      className="w-full rounded-lg border-slate-300 focus:ring-red-500 focus:border-red-500"
                      value={formData?.category || 'pizzas'}
                      onChange={e => setFormData(p => p ? ({ ...p, category: e.target.value as any }) : null)}
                    >
                      <option value="pizzas">Pizzas</option>
                      <option value="masas">Masas</option>
                      <option value="salsas">Salsas</option>
                      <option value="bebidas">Bebidas</option>
                      <option value="extras">Extras</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Imagen URL</label>
                    <input
                      className="w-full rounded-lg border-slate-300 focus:ring-red-500 focus:border-red-500"
                      value={formData?.image || ''}
                      onChange={e => setFormData(p => p ? ({ ...p, image: e.target.value }) : null)}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {/* Use this space for Time Settings */}
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 h-fit">
                  <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
                    <RefreshCw size={16} className="text-slate-400" /> Tiempos de Producción (Segundos)
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-600">Preparación (Mesa)</label>
                      <input type="number" className="w-24 rounded border-slate-300 text-sm text-center" value={formData?.prepTime || 0} onChange={e => setFormData(p => p ? ({ ...p, prepTime: +e.target.value }) : null)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-600">Cocción (Horno)</label>
                      <input type="number" className="w-24 rounded border-slate-300 text-sm text-center" value={formData?.cookTime || 0} onChange={e => setFormData(p => p ? ({ ...p, cookTime: +e.target.value }) : null)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-600">Corte y Empaque</label>
                      <input type="number" className="w-24 rounded border-slate-300 text-sm text-center" value={formData?.cutTime || 0} onChange={e => setFormData(p => p ? ({ ...p, cutTime: +e.target.value }) : null)} />
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <label className="text-sm font-bold text-slate-900">Total Estimado</label>
                      <span className="font-mono font-bold text-slate-900">
                        {((formData?.prepTime || 0) + (formData?.cookTime || 0) + (formData?.cutTime || 0)) / 60} min
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ingredients Section */}
              <div className="border-t border-slate-100 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-slate-900">Ingredientes</h3>
                  <button
                    type="button"
                    onClick={() => setFormData(p => p ? ({ ...p, ingredients: [...(p.ingredients || []), { name: '', quantity: { mediana: '', familiar: '' } }] }) : null)}
                    className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus size={14} /> Agregar Ingrediente
                  </button>
                </div>

                <div className="space-y-3">
                  {formData?.ingredients?.map((ing, idx) => (
                    <div key={idx} className="flex gap-3 items-start p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                      <div className="flex-1">
                        <input
                          placeholder="Nombre Ingrediente"
                          className="w-full text-sm border-slate-200 rounded-md focus:border-red-500 focus:ring-red-500 bg-white"
                          value={ing.name}
                          onChange={e => {
                            const newIngs = [...(formData.ingredients || [])];
                            newIngs[idx].name = e.target.value;
                            setFormData({ ...formData, ingredients: newIngs });
                          }}
                        />
                      </div>
                      <div className="w-24">
                        <input
                          placeholder="Cant. Med"
                          className="w-full text-sm border-slate-200 rounded-md focus:border-red-500 focus:ring-red-500 bg-white text-center"
                          value={ing.quantity.mediana}
                          onChange={e => {
                            const newIngs = [...(formData.ingredients || [])];
                            newIngs[idx].quantity.mediana = e.target.value;
                            setFormData({ ...formData, ingredients: newIngs });
                          }}
                        />
                      </div>
                      <div className="w-24">
                        <input
                          placeholder="Cant. Fam"
                          className="w-full text-sm border-slate-200 rounded-md focus:border-red-500 focus:ring-red-500 bg-white text-center"
                          value={ing.quantity.familiar}
                          onChange={e => {
                            const newIngs = [...(formData.ingredients || [])];
                            newIngs[idx].quantity.familiar = e.target.value;
                            setFormData({ ...formData, ingredients: newIngs });
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newIngs = formData.ingredients.filter((_, i) => i !== idx);
                          setFormData({ ...formData, ingredients: newIngs });
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {(!formData?.ingredients || formData.ingredients.length === 0) && (
                    <p className="text-center text-slate-400 text-sm py-4 italic">No hay ingredientes definidos.</p>
                  )}
                </div>
              </div>

              {/* Steps Section */}
              <div className="border-t border-slate-100 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-slate-900">Instrucciones de Preparación</h3>
                  <button
                    type="button"
                    onClick={() => setFormData(p => p ? ({ ...p, steps: [...(p.steps || []), { title: '', description: '', image: '' }] }) : null)}
                    className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus size={14} /> Agregar Paso
                  </button>
                </div>

                <div className="space-y-4">
                  {formData?.steps?.map((step, idx) => (
                    <div key={idx} className="flex gap-4 items-start relative pl-8 border-l-2 border-slate-200 hover:border-red-200 transition-colors">
                      <div className="absolute -left-[9px] top-0 size-4 rounded-full bg-slate-200 text-[10px] flex items-center justify-center font-bold text-slate-600 mt-2.5">
                        {idx + 1}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input
                          placeholder="Título del paso (ej. Estirar Masa)"
                          className="w-full font-bold text-sm border-slate-200 rounded-md focus:border-red-500 focus:ring-red-500"
                          value={step.title}
                          onChange={e => {
                            const newSteps = [...(formData.steps || [])];
                            newSteps[idx].title = e.target.value;
                            setFormData({ ...formData, steps: newSteps });
                          }}
                        />
                        <textarea
                          placeholder="Descripción detallada..."
                          className="w-full text-sm border-slate-200 rounded-md focus:border-red-500 focus:ring-red-500 min-h-[60px]"
                          value={step.description}
                          onChange={e => {
                            const newSteps = [...(formData.steps || [])];
                            newSteps[idx].description = e.target.value;
                            setFormData({ ...formData, steps: newSteps });
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newSteps = formData.steps.filter((_, i) => i !== idx);
                          setFormData({ ...formData, steps: newSteps });
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md mt-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {(!formData?.steps || formData.steps.length === 0) && (
                    <p className="text-center text-slate-400 text-sm py-4 italic">No hay pasos definidos.</p>
                  )}
                </div>
              </div>


              <div className="flex justifies-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setViewMode('list')} className="px-5 py-2.5 rounded-lg border border-slate-200 font-bold text-sm text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
                <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-bold text-sm hover:bg-red-700 flex items-center gap-2 shadow-lg shadow-red-200 transition-all">
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
