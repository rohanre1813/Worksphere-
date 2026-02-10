"use client";

import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../config";

/*
========================================================
   ADMIN SOCKET HOOK
   Used in Admin Dashboard to get LIVE employee positions
========================================================
*/

export default function useAdminSocket() {
  const [employees, setEmployees] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    /*
    =========================================
       CONNECT SOCKET
    =========================================
    */
    const socket = io(SOCKET_URL, {
      transports: ["websocket"], // faster + stable
    });

    socketRef.current = socket;

    console.log("🟢 Admin socket connected");

    /*
    =========================================
       RECEIVE LIVE UPDATES
       server emits: employees_update
    =========================================
    */
    socket.on("employees_update", (data) => {
      console.log("📡 Employees updated:", data);
      setEmployees(data);
    });

    /*
    =========================================
       HANDLE RECONNECT
    =========================================
    */
    socket.on("connect_error", (err) => {
      console.error("Socket error:", err);
    });

    /*
    =========================================
       CLEANUP
    =========================================
    */
    return () => {
      console.log("🔴 Admin socket disconnected");
      socket.disconnect();
    };
  }, []);

  return employees;
}
