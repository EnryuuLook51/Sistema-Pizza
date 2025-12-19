import recipesData from '@/data/recipes.json';
import { db } from "@/lib/firebase";
import { Recipe } from "@/lib/types";
import { collection, onSnapshot, query } from "firebase/firestore";
import { useEffect, useState } from "react";

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time listener for recipes
    const q = query(collection(db, "recipes"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));

      if (docs.length === 0) {
        // Fallback to static data if DB is empty to prevent broken UI before migration
        setRecipes(recipesData as unknown as Recipe[]);
      } else {
        setRecipes(docs);
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching recipes:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { recipes, loading };
}
