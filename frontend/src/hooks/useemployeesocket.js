"use client";

import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../config";

let socket;

export default function useEmployeeSocket(employeeId) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!socket) {
      socket = io(SOCKET_URL);
    }

    socketRef.current = socket;

    return () => {
      // Only disconnect if this specific hook instance was responsible for creating the socket,
      // or if we want to ensure it disconnects when the component unmounts.
      // Given `socket` is global, this might need more careful management if multiple components use it.
      // For now, keeping the original disconnect logic.
      socket.disconnect();
    };
  }, []);

  /*
  ======================================
     SEND ZONE WHEN QR SCANNED
  ======================================
  */
  const joinZone = (zone) => {
    if (!socketRef.current) return;

    socketRef.current.emit("join_zone", {
      employeeId,
      zone,
    });
  };

  return { joinZone };
}
