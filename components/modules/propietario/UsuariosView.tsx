import { db, firebaseConfig } from "@/lib/firebase";
import { UserProfile, UserRole } from "@/lib/types";
import { getApps, initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signOut } from "firebase/auth";
import { collection, deleteDoc, doc, getDocs, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import {
  AlertTriangle,
  CheckCircle,
  Edit,
  Loader2,
  Search,
  Shield,
  Trash2,
  UserPlus
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function UsuariosView() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    uid: '',
    nombre: '',
    email: '',
    password: '',
    rol: 'cocina' as UserRole,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const userList = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
      setUsers(userList);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // TRICK: Create a secondary app to create user without logging out the main admin
      const secondaryAppName = "SecondaryAppForUserCreation";
      let secondaryApp = getApps().find(app => app.name === secondaryAppName);
      if (!secondaryApp) {
        secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
      }
      const secondaryAuth = getAuth(secondaryApp);

      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, formData.email, formData.password);
      const newUser = userCredential.user;

      // Create Firestore Doc
      const userData: UserProfile = {
        uid: newUser.uid,
        nombre: formData.nombre,
        email: newUser.email!,
        rol: formData.rol,
        active: true,
        createdAt: Timestamp.now(),
      };

      await setDoc(doc(db, "users", newUser.uid), userData);

      // Sign out from secondary app to clean up
      await signOut(secondaryAuth);

      setMessage({ type: 'success', text: `Usuario ${formData.nombre} creado correctamente.` });
      setFormData({ uid: '', nombre: '', email: '', password: '', rol: 'cocina' });
      fetchUsers();
      setViewMode('list');

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', formData.uid), {
        nombre: formData.nombre,
        rol: formData.rol
      });
      setMessage({ type: 'success', text: 'Usuario actualizado correctamente.' });
      fetchUsers();
      setViewMode('list');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (uid: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    try {
      await deleteDoc(doc(db, 'users', uid));
      // Note: This only deletes Firestore doc, not Auth user. Admin SDK needed for proper Auth deletion.
      setMessage({ type: 'success', text: 'Usuario eliminado (Solo base de datos).' });
      fetchUsers();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const startEdit = (user: UserProfile) => {
    setFormData({
      uid: user.uid,
      nombre: user.nombre,
      email: user.email,
      password: '', // Can't edit password easily from here client-side
      rol: user.rol
    });
    setViewMode('edit');
    setMessage(null);
  };

  const filteredUsers = users.filter(u =>
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 animate-in fade-in duration-300">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-8">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gestión de Personal</h1>
            <p className="text-slate-500 text-sm">Administra cuentas, roles y accesos.</p>
          </div>
          {viewMode === 'list' && (
            <button
              onClick={() => { setViewMode('create'); setMessage(null); setFormData({ uid: '', nombre: '', email: '', password: '', rol: 'cocina' }); }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold text-sm shadow-md shadow-red-200"
            >
              <UserPlus size={18} /> Nuevo Usuario
            </button>
          )}
          {viewMode !== 'list' && (
            <button
              onClick={() => setViewMode('list')}
              className="text-slate-500 hover:text-slate-800 font-medium text-sm"
            >
              Cancelar
            </button>
          )}
        </div>

        {/* FEEDBACK MESSAGE */}
        {message && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
            <span className="font-medium text-sm">{message.text}</span>
          </div>
        )}

        {/* VIEWS */}
        {viewMode === 'list' ? (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filteredUsers.length} Usuarios</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-900 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Usuario</th>
                    <th className="px-6 py-4">Rol</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-400">Cargando...</td></tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-400">No se encontraron usuarios.</td></tr>
                  ) : filteredUsers.map(u => (
                    <tr key={u.uid} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs">
                            {u.nombre?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{u.nombre}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border capitalize
                                   ${u.rol === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            u.rol === 'gerente' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {u.rol === 'admin' && <Shield size={12} />}
                          {u.rol}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600">
                          <span className="size-2 rounded-full bg-green-500"></span> Activo
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => startEdit(u)} className="p-2 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-900 transition-colors"><Edit size={16} /></button>
                          <button onClick={() => handleDelete(u.uid)} className="p-2 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* CREATE / EDIT FORM */
          <div className="max-w-xl mx-auto w-full">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-lg text-slate-900">{viewMode === 'create' ? 'Crear Nuevo Usuario' : 'Editar Usuario'}</h3>
              </div>
              <form onSubmit={viewMode === 'create' ? handleCreateUser : handleUpdate} className="p-8 space-y-6">

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre Completo</label>
                  <input
                    required
                    className="w-full rounded-lg border-slate-300 focus:ring-red-500 focus:border-red-500"
                    value={formData.nombre}
                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej. María González"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Rol Asignado</label>
                  <select
                    className="w-full rounded-lg border-slate-300 focus:ring-red-500 focus:border-red-500"
                    value={formData.rol}
                    onChange={e => setFormData({ ...formData, rol: e.target.value as UserRole })}
                  >
                    <option value="admin">Administrador Global</option>
                    <option value="gerente">Gerente de Tienda</option>
                    <option value="pizzero">Pizzero (Cocina)</option>
                    <option value="atencion">Atención al Cliente</option>
                    <option value="delivery">Repartidor</option>
                  </select>
                </div>

                {viewMode === 'create' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Email Corporativo</label>
                      <input
                        type="email" required
                        className="w-full rounded-lg border-slate-300 focus:ring-red-500 focus:border-red-500"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="usuario@pizzaops.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Contraseña Temporal</label>
                      <input
                        type="password" required minLength={6}
                        className="w-full rounded-lg border-slate-300 focus:ring-red-500 focus:border-red-500"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••"
                      />
                    </div>
                  </>
                )}

                {viewMode === 'edit' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-2">Email (No editable)</label>
                    <input disabled className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed" value={formData.email} />
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-200 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {viewMode === 'create' ? 'Crear Cuenta' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
