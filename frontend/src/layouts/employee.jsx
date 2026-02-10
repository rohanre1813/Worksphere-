 import ESidebar from "../components/employeesidebar";
import { Outlet } from "react-router-dom";

export default function EmployeeLayout() {
  return (
    <div className="flex">
      <ESidebar />
      <main className="flex-1 ml-0 md:ml-64 p-6">
        <Outlet />
      </main>
    </div>
  );
}
