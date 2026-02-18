import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    /*
      ❗ FIX
      unique should be PER ADMIN, not global
      so we remove unique:true here
      and use compound index below
    */
    email: {
      type: String,
      unique: true,
      required: true,
    },

    role: {
      type: String,
      required: true,
    },

    phoneNumber: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    /*
      🔥 IMPORTANT FOR SOCKET MAP
      always keep string (never null)
    */
    currentZone: {
      type: String,
      default: "Not inside any zone",
    },
  },
  { timestamps: true }
);



/*
====================================================
   COMPOUND UNIQUE INDEX (PER ADMIN)
====================================================
*/

employeeSchema.index({ employeeId: 1, admin: 1 }, { unique: true });

// Index for fetching employees by admin (Office Map, Employee List)
employeeSchema.index({ admin: 1 });



/*
====================================================
   HASH PASSWORD
====================================================
*/
employeeSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});



export default mongoose.model("Employee", employeeSchema);
