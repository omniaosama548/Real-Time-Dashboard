import React, { useEffect, useState } from "react";
import api from "../services/api";
import { getSocket } from "../utils/socket";

export default function NotificationList() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // load existing notifications
    const load = async () => {
      try {
        const { data } = await api.get("/notifications");
        setNotifications(data);
      } catch (err) {
        console.error("Failed load notifications", err);
      }
    };
    load();

    // realtime listener
    const socket = getSocket();
    if (socket) {
      socket.on("notificationCreated", (notif) => {
        setNotifications((prev) => [notif, ...prev]);
        // optionally show toast
      });
    }

    return () => {
      if (socket) socket.off("notificationCreated");
    };
  }, []);

  return (
    <div className="p-3">
      <h3 className="font-semibold mb-2">Notifications</h3>
      <ul>
        {notifications.map((n) => (
          <li key={n._id} className="mb-2 border-b pb-2">
            <div className="text-sm">{n.message}</div>
            <div className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
