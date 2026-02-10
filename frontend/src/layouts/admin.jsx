import Sidebar from "../components/sidebar";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-64 p-6">
        <Outlet />
      </main>
    </div>
  );
}
