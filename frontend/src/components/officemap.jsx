"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import { useNavigate, useLocation } from "react-router-dom";
import { SOCKET_URL } from "../config";

/*       
========================================================
   ZONE LAYOUT (BIG → SMALL realistic office)
========================================================
*/
const ZONES = {
  "Work Zone": { top: 8, left: 5, width: 90, height: 45 },
  "Meeting Zone": { top: 53.5, left: 5, width: 56, height: 26 },
  "Cafeteria Zone": { top: 53.5, left: 62, width: 33, height: 26 },
  "Recreation Zone": { top: 80, left: 5, width: 70, height: 18 },
  "Restricted Zone": { top: 80, left: 76, width: 19, height: 18 },
};

/*
========================================================
   ✅ STATIC TAILWIND COLOR CLASSES (FIX)
========================================================
   Tailwind needs static class names
*/
const ZONE_COLORS = {
  "Work Zone": "from-blue-700/40 to-blue-900/40",
  "Meeting Zone": "from-green-700/40 to-green-900/40",
  "Cafeteria Zone": "from-yellow-600/40 to-yellow-800/40",
  "Recreation Zone": "from-purple-700/40 to-purple-900/40",
  "Restricted Zone": "from-red-700/40 to-red-900/40",
};

/*
========================================================
   GRID POSITION GENERATOR
========================================================
*/
const COLS = 8;

function calculateRandomPositions(employees) {
  const zoneGroups = {};

  employees.forEach((emp) => {
    const key = emp.zone?.trim();
    if (!ZONES[key]) return;

    if (!zoneGroups[key]) zoneGroups[key] = [];
    zoneGroups[key].push(emp);
  });

  const positioned = [];

  Object.entries(zoneGroups).forEach(([zoneKey, zoneEmployees]) => {
    const box = ZONES[zoneKey];

    const rows = Math.ceil(zoneEmployees.length / COLS);

    zoneEmployees.forEach((emp, index) => {
      const row = Math.floor(index / COLS);
      const col = index % COLS;

      const cellWidth = box.width / COLS;
      const cellHeight = box.height / rows;

      const leftVal = box.left + col * cellWidth + cellWidth / 2;
      const topVal = box.top + row * cellHeight + cellHeight / 2;

      positioned.push({
        ...emp,
        pos: { left: leftVal, top: topVal },
      });
    });
  });

  return positioned;
}

/*
========================================================
   MAIN COMPONENT
========================================================
*/
export default function OfficeMap() {
  const navigate = useNavigate();
  const location = useLocation();
  const [employees, setEmployees] = useState([]);
  const [debugAdminId, setDebugAdminId] = useState(null);
  const socketRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const lastTouchDist = useRef(null);

  const handleWheel = (e) => {
    e.preventDefault();
    setZoom((z) => Math.min(3, Math.max(1, z - e.deltaY * 0.001)));
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist.current = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (lastTouchDist.current) {
        const delta = dist - lastTouchDist.current;
        setZoom((z) => Math.min(3, Math.max(1, z + delta * 0.01)));
      }
      lastTouchDist.current = dist;
    }
  };

  const handleTouchEnd = () => {
    lastTouchDist.current = null;
  };

  /*
  ========================================================
     SOCKET CONNECT
  ========================================================
  */
  useEffect(() => {
    let adminId = localStorage.getItem("adminId");

    if (!adminId) {
      const empInfo = localStorage.getItem("employeeInfo");
      if (empInfo) {
        const parsed = JSON.parse(empInfo);
        adminId = parsed.admin;
      }
    }

    if (!adminId) {
      navigate("/");
      return;
    }

    setDebugAdminId(adminId);

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.emit("join_room", adminId);

    socket.on("employees_update", (data) => {
      setEmployees(data);
    });

    socket.emit("request_employees", adminId);

    return () => socket.disconnect();
  }, []);

  const positionedEmployees = useMemo(() => {
    return calculateRandomPositions(employees);
  }, [employees]);

  /*
  ========================================================
     UI
  ========================================================
  */
  return (
    <div
      className="fixed inset-0 md:left-64 p-4 overflow-hidden"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >

      {/* DEBUG */}
      <div className="absolute top-0 right-2 z-50 bg-black/80 text-white p-2 rounded-lg text-[8px] font-mono pointer-events-none">
        OFFICE ID: {debugAdminId || "Connecting..."}
        <br />
        ROOM: {socketRef.current?.connected ? "CONNECTED" : "DISCONNECTED"}
        <br />
        EMPS: {employees.length} (Visible: {positionedEmployees.length})
      </div>

      {/* ================= ZONES ================= */}
      {Object.entries(ZONES).map(([title, box]) => (
        <Zone
          key={title}
          title={title}
          box={box}
          zoom={zoom}
          colorClass={ZONE_COLORS[title]}
        />
      ))}

      {/* ================= EMPLOYEE DOTS ================= */}
      {positionedEmployees.map((emp) => (
        <div
          key={emp.employeeId}
          onClick={() => {
            if (location.pathname.includes("/employee/")) {
              navigate(`/employee/details/${emp.employeeId}`);
            } else {
              navigate(`/admin/employee-details/${emp.employeeId}`);
            }
          }}
          className="absolute flex flex-col items-center cursor-pointer hover:scale-110"
          style={{ left: `${emp.pos.left * zoom}%`, top: `${emp.pos.top * zoom}%`, transition: "left 1.5s ease, top 1.5s ease" }}
        >
          {/* NAME */}
          <div style={{ fontSize: 10 }} className="mb-0.5 px-1.5 py-0.5 rounded-md bg-white/70 backdrop-blur shadow text-center">
            <div className="font-bold">
              {emp.name.length > 5 ? emp.name.slice(0, 4) + ".." : emp.name}
            </div>
          </div>

          {/* DOT */}
          <div style={{ width: 10, height: 10, flexShrink: 0 }} className="rounded-full bg-yellow-400 border border-black shadow" />
        </div>
      ))}
    </div>
  );
}

/*
========================================================
   ZONE UI
========================================================
*/
function Zone({ title, box, zoom, colorClass }) {
  return (
    <div
      className={`
        absolute
        rounded-2xl
        border border-white/30
        bg-gradient-to-br
        ${colorClass}
        backdrop-blur-lg
        text-white text-sm pl-1 font-semibold
        flex items-center justify-center
        shadow-xl
      `}
      style={{
        top: `${box.top * zoom}%`,
        left: `${box.left * zoom}%`,
        width: `${box.width * zoom}%`,
        height: `${box.height * zoom}%`,
      }}
    >
      {title}
    </div>
  );
}
