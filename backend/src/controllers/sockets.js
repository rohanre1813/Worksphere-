import Employee from "../models/Employee.js";
import ZoneLog from "../models/ZoneLog.js";

export default function initSocket(io) {

  // ✅ Helper: Broadcast only to a specific room (Admin ID)
  const broadcastToRoom = async (adminId) => {
    try {
      if (!adminId) return;

      const employees = await Employee.find({ admin: adminId })
        .select("employeeId name email currentZone");

      const formatted = employees.map(e => ({
        _id: e._id,
        employeeId: e.employeeId,
        email: e.email,
        name: e.name,
        zone: e.currentZone || null,
      }));

      // Emit ONLY to that room
      console.log(`📡 Broadcasting to room: ${adminId} (Employees: ${employees.length})`);
      io.to(adminId.toString()).emit("employees_update", formatted);

    } catch (err) {
      console.error("Broadcast room error:", err);
    }
  };

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    // 1️⃣ JOIN ROOM (Admin or Employee)
    socket.on("join_room", async (adminId) => {
      if (!adminId) return;
      socket.join(adminId);
      console.log(`Socket ${socket.id} joined room: ${adminId}`);

      // Send initial data for this room
      await broadcastToRoom(adminId);
    });

    // 2️⃣ HANDLE MANUAL REQUEST
    socket.on("request_employees", async (adminId) => {
      console.log(`🔄 Request Employees received for Admin: ${adminId}`);
      if (adminId) {
        await broadcastToRoom(adminId);
      } else {
        console.log("⚠️ Request Employees skipped: Missing Admin ID");
      }
    });

    // 3️⃣ HANDLE ZONE UPDATES
    socket.on("join_zone", async ({ id, employeeId, zone }) => {
      try {
        console.log(`${employeeId} (ID: ${id}) entered ${zone}`);


        // ✅ Find by Unique Mongo ID (No Ambiguity)
        const emp = await Employee.findById(id).select("admin currentZone"); // 🔥 MODIFIED: Fetch currentZone

        if (!emp || !emp.admin) {
          console.error("No Admin found for employee:", id);
          return;
        }

        /*
        ===========================================
           🔥 ZONE ENFORCEMENT LOGIC (NEW)
        ===========================================
        */
        const targetZone = zone.toLowerCase();
        const currentZoneStatus = (emp.currentZone || "Not inside any zone").toLowerCase();

        // ALLOW: "In" scan always allowed (starts session)
        // ALLOW: "Out" scan always allowed (ends session)
        if (targetZone !== "in" && targetZone !== "out") {

          // REJECT: If they are NOT "In" (either "Out" or have no zone)
          if (currentZoneStatus === "out" || currentZoneStatus === "not inside any zone") {
            console.log(`❌ Scan Blocked: ${emp.name} must scan IN first.`);

            // Send specific error event back to sender socket
            socket.emit("scan_error", {
              message: "User must scan 'IN' first before accessing other zones!",
              type: "ACCESS_DENIED"
            });
            return; // STOP EXECUTION
          }
        }

        const adminId = emp.admin.toString();

        // ---------------- ANALYTICS LOGGING ----------------
        // 1. Close previous active log
        const previousLog = await ZoneLog.findOne({
          employeeId: id,
          exitTime: null
        });

        if (previousLog) {
          previousLog.exitTime = new Date();
          const durationMs = previousLog.exitTime - previousLog.entryTime;
          previousLog.durationMinutes = durationMs / 1000 / 60;
          await previousLog.save();
        }

        // 2. Create new log
        await ZoneLog.create({
          employeeId: id,
          adminId: adminId,
          zone: zone,
        });
        // ---------------------------------------------------

        await Employee.findByIdAndUpdate(
          id,
          { currentZone: zone }
        );

        console.log(`✅ DB Updated for ${employeeId} -> ${zone}`);

        // ✅ EMIT SUCCESS to the scanner
        socket.emit("scan_success", { zone: zone });

        console.log(`📡 Triggering broadcast to Admin Room: ${adminId}`);

        // Broadcast to that Admin's room ONLY
        await broadcastToRoom(adminId);

      } catch (err) {
        console.error("join_zone error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 Disconnected:", socket.id);
    });
  });
}
