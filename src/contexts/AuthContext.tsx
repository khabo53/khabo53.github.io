import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  userRole: string | null;
  userName: string | null;
  userEmail: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  userName: null,
  userEmail: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        setUserEmail(user.email);
        
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData.role || "member");
            setUserName(userData.name || user.email?.split('@')[0] || "User");
          } else {
            setUserRole("member");
            setUserName(user.email?.split('@')[0] || "User");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserRole("member");
          setUserName(user.email?.split('@')[0] || "User");
        }
      } else {
        setUserRole(null);
        setUserName(null);
        setUserEmail(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userRole, userName, userEmail, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
