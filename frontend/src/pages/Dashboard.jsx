import React, { useEffect, useState } from "react";
import api from "../services/api";
import { getSocket } from "../utils/socket";
import NotificationList from "../components/NotificationList";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [ordersRes, usersRes] = await Promise.all([
          api.get("/orders"),
          api.get("/users/online"),
        ]);
        setOrders(ordersRes.data);
        setOnlineCount(usersRes.data.count ?? usersRes.data.length ?? 0);
      } catch (err) {
        console.error(err);
      }
    };
    load();

    const socket = getSocket();
    if (!socket) return;

    const onOrderCreated = (order) => setOrders(prev => [order, ...prev]);
    const onOrderUpdated = (order) => setOrders(prev => prev.map(o => o._id === order._id ? order : o));
    const onUserOnline = ({ onlineCount: oc }) => setOnlineCount(oc ?? (c => c + 1));
    const onUserOffline = ({ onlineCount: oc }) => setOnlineCount(oc ?? (c => Math.max(0, c - 1)));

    socket.on("orderCreated", onOrderCreated);
    socket.on("orderUpdated", onOrderUpdated);
    socket.on("userOnline", onUserOnline);
    socket.on("userOffline", onUserOffline);

    return () => {
      socket.off("orderCreated", onOrderCreated);
      socket.off("orderUpdated", onOrderUpdated);
      socket.off("userOnline", onUserOnline);
      socket.off("userOffline", onUserOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">📊 Dashboard</h1>
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg shadow-sm">
          Online Users: <strong>{onlineCount}</strong>
        </div>
      </header>

      {/* Main Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side: charts + orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Sales Overview</h2>
              <div className="h-40 flex items-center justify-center text-gray-400">
                📈 Line Chart (Placeholder)
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Orders by Category</h2>
              <div className="h-40 flex items-center justify-center text-gray-400">
                📊 Bar Chart (Placeholder)
              </div>
            </div>
          </div>

          {/* Orders */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
            <ul className="divide-y divide-gray-200">
              {orders.map((o) => (
                <li key={o._id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-700">
                      {o.title} — <span className="text-green-600">${o.amount}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      {o.status} • {new Date(o.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      o.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {o.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right side: notifications */}
        <aside className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">🔔 Notifications</h2>
          <NotificationList />
        </aside>
      </section>
    </div>
  );
}
