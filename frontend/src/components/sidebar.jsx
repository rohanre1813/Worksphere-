import { motion } from "framer-motion";
import {
  User,
  Map,
  Megaphone,
  Users,
  Menu,
  LogOutIcon,
  Printer
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";



export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();


  const menuItems = [
    { label: "Admin Info", icon: User, path: "/admin-info" },
    { label: "Office Area", icon: Map, path: "/office-area" },
    { label: "Add Announcement", icon: Megaphone, path: "/announcement" },
    { label: "Employee List", icon: Users, path: "/employees" },
    { label: "Setup Guide", icon: Printer, path: "/admin/setup" },
  ];
  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50  bg-black/80 border border-yellow-400 text-yellow-400 p-2 rounded-lg"
      >
        <Menu />
      </button>

      <motion.aside
        initial={{ x: -260 }}
        animate={{ x: open ? 0 : -260 }}
        transition={{ type: "spring", stiffness: 120 }}
        className="fixed top-0 z-40 w-64 h-screen
        bg-zinc-950/90 backdrop-blur-md
        border-r border-yellow-400/40
        shadow-[0_0_40px_rgba(250,204,21,0.25)]
        flex flex-col overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 text-center border-b border-yellow-400/30">
          <h1 className="text-yellow-400 font-mono font-bold tracking-widest">
            ADMIN PANEL
          </h1>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-3">
          {menuItems.map((item) => (
            <motion.button
              key={item.label}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 15px rgba(250,204,21,0.5)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-4 px-4 py-3
              rounded-xl border border-yellow-400/30
              text-yellow-400 bg-black/70
              hover:bg-yellow-400 hover:text-black
              transition-all"
            >
              <item.icon size={20} />
              <span className="font-semibold tracking-wide">
                {item.label}
              </span>
            </motion.button>
          ))}
        </nav>

        {/* Footer */}
        <nav className=" p-4 mt-">
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 15px rgba(250,204,21,0.5)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              localStorage.clear();
              navigate('/');
            }}
            className="w-full flex items-center gap-4 px-4 py-3
              rounded-xl border border-yellow-400/30
              text-yellow-400 bg-black/70
              hover:bg-yellow-400 hover:text-black
              transition-all"
          >
            <LogOutIcon size={20} />
            <span className="font-semibold tracking-wide">
              Logout
            </span>
          </motion.button>
        </nav>
        <div className="p-4 text-center text-xs text-yellow-400/60 border-t border-yellow-400/30">
          © Secure Office System
        </div>
      </motion.aside >
    </>
  );
}
