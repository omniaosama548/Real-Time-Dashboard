
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    try {
      await login(email, password);
      nav("/dashboard");
    } catch (error) {
      setErr(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="w-full max-w-md p-6 border rounded">
        <h2 className="text-2xl mb-4">Login</h2>
        {err && <div className="text-red-600 mb-2">{err}</div>}
        <input className="w-full mb-2 p-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="w-full mb-4 p-2" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full p-2 bg-blue-600 text-white">Login</button>
      </form>
    </div>
  );
}