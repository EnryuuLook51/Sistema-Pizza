"use client";

import { auth, db } from "@/lib/firebase";
import { UserProfile } from "@/lib/types";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { createContext, useContext, useEffect, useState } from "react";
import LoginForm from "./LoginForm";

// Contexto para compartir el perfil del usuario
interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export default function ProveedorAutenticacion({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const desuscribir = onAuthStateChanged(auth, async (usuarioFirebase) => {
      setUser(usuarioFirebase);

      if (usuarioFirebase) {
        // Fetch del rol y datos extra en Firestore
        try {
          const docRef = doc(db, "users", usuarioFirebase.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            console.warn("Usuario autenticado pero sin perfil en Firestore");
            setProfile(null);
          }
        } catch (error) {
          console.error("Error obteniendo perfil:", error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => desuscribir();
  }, []);

  if (loading) {
    return (
      <div className="flex bg-gray-50 h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-red-600" />
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
