import { io } from "socket.io-client";
let socket = null;
export const connectSocket=(token)=>{
     if (socket) return socket;
      socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
    auth: { token }, 
    
  });
  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  return socket;
}
export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};