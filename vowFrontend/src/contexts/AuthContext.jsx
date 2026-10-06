import {
  createContext,
  useState,
} from "react";

import {
  loginUser,
  signupUser,
} from "../services/api/authApi";

const AuthContext = createContext();

const getStoredUser = () => {
  try {
    const storedUser =
      localStorage.getItem("user");

    return storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

const AuthProvider = ({ children }) => {
  const [user, setUser] =
    useState(getStoredUser);

  const [token, setToken] = useState(
    () =>
      localStorage.getItem("token") ||
      null
  );

  const saveAuth = (data) => {
    setUser(data.user);
    setToken(data.token);

    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );

    localStorage.setItem(
      "token",
      data.token
    );
  };

  const login = async (
    email,
    password
  ) => {
    const data = await loginUser(
      email,
      password
    );

    saveAuth(data);

    return data;
  };

  const signup = async (
    name,
    email,
    password
  ) => {
    const data = await signupUser(
      name,
      email,
      password
    );

    saveAuth(data);

    return data;
  };

  const updateProfile = (updates) => {
    setUser((currentUser) => {
      if (!currentUser) {
        return currentUser;
      }

      const updatedUser = {
        ...currentUser,
        ...updates,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      return updatedUser;
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem(
      "deskverseWorkspaceId"
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        signup,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export {
  AuthContext,
  AuthProvider,
};