"use client";

import { toast } from 'react-hot-toast';

import { useRef, useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { io } from "socket.io-client";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, SOCKET_URL } from "../config";

export default function EmployeeScanner() {
  const navigate = useNavigate();

  const scannerRef = useRef(null);
  const socketRef = useRef(null);

  // VALID ZONES LIST
  const VALID_ZONES = [
    "Work Zone",
    "Meeting Zone",
    "Cafeteria Zone",
    "Recreation Zone",
    "Restricted Zone",
    "Out",
    "In"
  ];

  const [employee, setEmployee] = useState(null);
  const [zone, setZone] = useState("Not inside any zone");
  const [scanning, setScanning] = useState(false);

  /*
  ===========================================
     🧹 CLEANUP HELPER
  ===========================================
  */
  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (err) {
        console.error("Failed to stop scanner", err);
      }
    }
    setScanning(false);
  };

  /*
  ===========================================
     🔥 LOAD EMPLOYEE FROM TOKEN
  ===========================================
  */
  useEffect(() => {
    const loadEmployee = async () => {
      try {
        const token = localStorage.getItem("employeeToken");

        if (!token) {
          console.log("Not logged in");
          navigate("/");
          return;
        }

        const res = await axios.get(
          `${API_BASE_URL}/api/employee/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setEmployee(res.data);
        if (res.data.currentZone) {
          setZone(res.data.currentZone);
        }

        /*
        ===========================================
           🔥 CONNECT SOCKET AFTER AUTH
        ===========================================
        */
        const socket = io(SOCKET_URL, {
          transports: ["websocket"],
        });

        socketRef.current = socket;

        socket.on("connect", () => {
          console.log("🟢 employee socket connected");

          socket.emit("employee_connect", {
            employeeId: res.data.employeeId,
          });
        });

        // 🔥 LISTEN FOR ERRORS
        socket.on("scan_error", async (data) => {
          toast.error(data.message);
          await stopScanner(); // 🔥 Ensure camera stops
        });

        // ✅ LISTEN FOR SUCCESS
        socket.on("scan_success", async (data) => {
          setZone(data.zone);
          toast.success(`Entered ${data.zone}`);
          await stopScanner(); // 🔥 Ensure camera stops
        });

      } catch (err) {
        console.log("Auth failed");
        navigate("/");
      }
    };

    loadEmployee();

    return () => {
      socketRef.current?.disconnect();
      stopScanner(); // 🔥 Ensure camera stops on unmount
    };
  }, [navigate]);

  /*
  ===========================================
     🔥 START QR SCAN
  ===========================================
  */
  const startScan = async () => {
    if (scanning || !employee) return;

    // Destroy existing instance if any
    if (scannerRef.current) {
      await stopScanner();
    }

    const qr = new Html5Qrcode("reader");
    scannerRef.current = qr;

    setScanning(true);

    try {
      await qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },

        async (decodedText) => {
          let zoneName = decodedText;

          try {
            const parsed = JSON.parse(decodedText);
            zoneName = parsed.zone || parsed.area;
          } catch { }

          if (typeof zoneName === "string") {
            zoneName = zoneName.trim();
          }

          // VALIDATION
          if (!VALID_ZONES.includes(zoneName)) {
            toast.error(`Invalid QR Code: "${zoneName}". Must be one of: ${VALID_ZONES.join(", ")}`);
            return; // Keep scanning on soft fail? usually stop
          }

          // SEND TO SERVER
          const targetId = employee._id || employee.id;

          if (!targetId) {
            toast.error("Error: Employee ID missing. Please relogin.");
            return;
          }

          socketRef.current.emit("join_zone", {
            id: targetId,
            employeeId: employee.employeeId,
            zone: zoneName,
          });

          // Stop scanning immediately after successful read
          await stopScanner();
        }
      );
    } catch (err) {
      console.error("Camera start failed", err);
      setScanning(false);
      toast.error("Failed to access camera");
    }
  };

  /*
  ===========================================
     LOADING
  ===========================================
  */
  if (!employee) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Loading employee...
      </div>
    );
  }

  /*
  ===========================================
     UI
  ===========================================
  */
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4">
      {/* 🔴 Camera Status Indicator */}
      <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium shadow-md transition-colors ${scanning ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
        }`}>
        <div className={`w-2 h-2 rounded-full animate-pulse ${scanning ? "bg-green-500" : "bg-red-500"}`} />
        {scanning ? "Camera On" : "Camera Off"}
      </div>

      <div className="w-full max-w-sm bg-white/40 backdrop-blur-xl border rounded-3xl p-6 flex flex-col items-center gap-6">

        <h1 className="text-xl font-bold">
          {employee.name}
        </h1>

        <div id="reader" className="w-full aspect-square bg-black rounded-xl" />

        <button
          onClick={startScan}
          disabled={scanning}
          className="w-full py-3 bg-green-600 text-white rounded-xl"
        >
          {scanning ? "Scanning..." : "Start Scan"}
        </button>

        <div className="text-center">
          Current Zone
          <div className="font-bold mt-1">{zone}</div>
        </div>
      </div>
    </div>
  );
}
