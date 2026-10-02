import { useState } from "react";
import { createContext } from "react";

import { loginUser, signupUser } from "../services/api/authApi";
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
const [user, setUser] = useState(null)
const [token, setToken] = useState(null);

const login = async (email, password) => {
   const data = await loginUser(email, password);
     setUser(data.user);
     setToken(data.token);
};

const signup = async (name, email, password) => {
  const data = await signupUser(name, email, password);

  setUser(data.user);
  setToken(data.token);
};

  return (
    <AuthContext.Provider value={{user ,token , login ,signup}}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };