import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

// Index for fetching announcements by admin
announcementSchema.index({ admin: 1 });

export default mongoose.model("Announcement", announcementSchema);
