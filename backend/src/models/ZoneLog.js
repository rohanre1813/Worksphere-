import mongoose from "mongoose";

const zoneLogSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true
  },
  zone: {
    type: String,
    required: true
  },
  entryTime: {
    type: Date,
    default: Date.now
  },
  exitTime: {
    type: Date,
    default: null
  },
  durationMinutes: {
    type: Number,
    default: 0
  }
});

// Index for quick lookup of active sessions
zoneLogSchema.index({ employeeId: 1, exitTime: 1 });
// Index for Office Analytics (filtering by admin)
zoneLogSchema.index({ adminId: 1 });

export default mongoose.model("ZoneLog", zoneLogSchema);
