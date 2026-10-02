import { useState } from "react";
import { createContext } from "react";

import { loginUser, signupUser } from "../services/api/authApi";
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
const [user, setUser] = useState(
  JSON.parse(localStorage.getItem("user")) || null
);

const [token, setToken] = useState(
  localStorage.getItem("token") || null
);

const login = async (email, password) => {
   const data = await loginUser(email, password);
     setUser(data.user);
     setToken(data.token);
     localStorage.setItem("user", JSON.stringify(data.user));
localStorage.setItem("token", data.token);
};

const signup = async (name, email, password) => {
  const data = await signupUser(name, email, password);

  setUser(data.user);
  setToken(data.token);
   localStorage.setItem("user", JSON.stringify(data.user));
  localStorage.setItem("token", data.token);
};

const logout = () => {
  setUser(null);
  setToken(null);

  localStorage.removeItem("user");
  localStorage.removeItem("token");
};
  return (
    <AuthContext.Provider value={{user ,token , login ,signup ,logout}}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };