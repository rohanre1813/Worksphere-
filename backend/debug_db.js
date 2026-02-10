import mongoose from "mongoose";
import dotenv from "dotenv";
import Employee from "./src/models/Employee.js";
import Admin from "./src/models/Admin.js";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const admins = await Admin.find({});
    let output = `Found ${admins.length} Admins:\n`;

    for (const admin of admins) {
      output += `------------------------------------------------\n`;
      output += `Admin: ${admin.email} (ID: ${admin._id})\n`;

      const employees = await Employee.find({ admin: admin._id });
      output += `Employees (${employees.length}):\n`;
      employees.forEach(e => {
        output += ` - ${e.name} (ID: ${e.employeeId}, Zone: ${e.currentZone || "None"})\n`;
      });
    }

    output += `\n------------------------------------------------\n`;

    const allEmployees = await Employee.find({});
    const orphans = [];

    for (const e of allEmployees) {
      const found = admins.find(a => a._id.toString() === e.admin?.toString());
      if (!found) orphans.push(e);
    }

    if (orphans.length > 0) {
      output += `⚠️ FOUND ${orphans.length} ORPHANED EMPLOYEES (Invalid Admin ID):\n`;
      orphans.forEach(e => output += ` - ${e.name} (AdminID: ${e.admin})\n`);
    } else {
      output += "✅ No orphaned employees found.\n";
    }

    const fs = await import('fs');
    fs.writeFileSync('debug_output.txt', output);
    console.log("Written to debug_output.txt");

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
};

run();
