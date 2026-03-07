import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("ht_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password) => {
    const res = await fetch(`http://localhost:3001/users?email=${email}`);
    const users = await res.json();
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) throw new Error("Invalid email or password");
    if (!found.isActive) throw new Error("Account is deactivated");
    localStorage.setItem("ht_user", JSON.stringify(found));
    setUser(found);
    return found;
  };

  const logout = () => {
    localStorage.removeItem("ht_user");
    setUser(null);
  };

  const refreshUser = async () => {
    if (!user) return;
    const res = await fetch(`http://localhost:3001/users/${user.id}`);
    const updated = await res.json();
    localStorage.setItem("ht_user", JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
