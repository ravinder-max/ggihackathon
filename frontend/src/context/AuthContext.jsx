import { createContext, useContext, useMemo, useState } from "react";
import { loginUser } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("medledger_user");
    return saved ? JSON.parse(saved) : null;
  });

  const signIn = async ({ userId, password, role }) => {
    const response = await loginUser({ userId, password, role });
    const authUser = {
      userId,
      role,
      token: response.token
    };
    localStorage.setItem("medledger_user", JSON.stringify(authUser));
    setUser(authUser);
    return authUser;
  };

  const signOut = () => {
    localStorage.removeItem("medledger_user");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      signIn,
      signOut,
      isAuthenticated: Boolean(user)
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
