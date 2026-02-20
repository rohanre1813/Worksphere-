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
const COLS_DESKTOP = 12;
const COLS_MOBILE = 6;

function calculateRandomPositions(employees) {
  const zoneGroups = {};

  employees.forEach((emp) => {
    const key = emp.zone?.trim();
    if (!ZONES[key]) return;

    if (!zoneGroups[key]) zoneGroups[key] = [];
    zoneGroups[key].push(emp);
  });

  const positioned = [];

  // Padding (in %) to keep dots away from zone edges
  const PAD_X = 3;
  const PAD_TOP = 5;
  const PAD_BOTTOM = 3;

  Object.entries(zoneGroups).forEach(([zoneKey, zoneEmployees]) => {
    const box = ZONES[zoneKey];

    // Inner area after padding
    const innerLeft = box.left + PAD_X;
    const innerTop = box.top + PAD_TOP;
    const innerWidth = box.width - PAD_X * 2;
    const innerHeight = box.height - PAD_TOP - PAD_BOTTOM;

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const maxCols = isMobile ? COLS_MOBILE : COLS_DESKTOP;
    const cols = Math.min(maxCols, zoneEmployees.length);
    const rows = Math.ceil(zoneEmployees.length / cols);

    zoneEmployees.forEach((emp, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      // Evenly distribute within inner area
      const leftVal = cols === 1
        ? innerLeft + innerWidth / 2
        : innerLeft + (col / (cols - 1)) * innerWidth;

      const topVal = rows === 1
        ? innerTop + innerHeight / 2
        : innerTop + (row / (rows - 1)) * innerHeight;

      // Clamp to zone boundaries as a safety net
      const clampedLeft = Math.max(box.left + 1, Math.min(leftVal, box.left + box.width - 1));
      const clampedTop = Math.max(box.top + 1, Math.min(topVal, box.top + box.height - 1));

      positioned.push({
        ...emp,
        pos: {
          left: `${clampedLeft}%`,
          top: `${clampedTop}%`,
        },
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
    <div className="fixed inset-0 md:left-64 p-2 md:p-4 overflow-auto">
      <div className="relative w-full" style={{ minHeight: "100vh", height: "100%" }}>

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
            colorClass={ZONE_COLORS[title]}
          />
        ))}

        {/* ================= EMPLOYEE DOTS ================= */}
        {positionedEmployees.map((emp) => (
          <motion.div
            key={emp.employeeId}
            className="absolute"
            initial={emp.pos}
            animate={emp.pos}
            transition={{ duration: 2 }}
          >
            {/* Inner wrapper: centers content on the position point */}
            <div
              onClick={() => {
                if (location.pathname.includes("/employee/")) {
                  navigate(`/employee/details/${emp.employeeId}`);
                } else {
                  navigate(`/admin/employee-details/${emp.employeeId}`);
                }
              }}
              className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform -translate-x-1/2 -translate-y-1/2"
            >
              {/* NAME */}
              <div className="mb-0.5 px-0.5 py-0 text-[6px] md:text-[8px] lg:text-[10px] rounded bg-white/70 backdrop-blur shadow text-center whitespace-nowrap leading-tight">
                <div className="font-bold">{
                  emp.name.length > 5
                    ? emp.name.slice(0, 4) + ".."
                    : emp.name
                }</div>
              </div>

              {/* DOT */}
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 lg:w-3 lg:h-3 rounded-full bg-yellow-400 border border-black shadow" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/*
========================================================
   ZONE UI
========================================================
*/
function Zone({ title, box, colorClass }) {
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
        top: `${box.top}%`,
        left: `${box.left}%`,
        width: `${box.width}%`,
        height: `${box.height}%`,
      }}
    >
      {title}
    </div>
  );
}
