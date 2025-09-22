import React, {  useState, useEffect } from "react";
import api from "../services/api";
import { connectSocket, disconnectSocket} from "../utils/socket";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);

  useEffect(() => {
    if (token) {
      // establish socket connection with token
      connectSocket(token);
    } else {
      disconnectSocket();
    }
    // cleanup on unmount handled by disconnectSocket
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    // resp must contain token and user info
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    setToken(data.token);
    setUser({ _id: data._id, name: data.name, email: data.email });
    return data;
  };

  const signup = async (name, email, password) => {
    const { data } = await api.post("/auth/signup", { name, email, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    setToken(data.token);
    setUser({ _id: data._id, name: data.name, email: data.email });
    return data;
  };

  const logout = async () => {
    // call backend logout to flip isOnline (protected)
    try {
      await api.post("/auth/logout");
    } catch (err) {
      // ignore but proceed clearing client state
      console.log(err)
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    disconnectSocket();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};
