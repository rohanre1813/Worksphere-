import { BrowserRouter, Routes, Route } from "react-router-dom";
import PacManAnimatedBackground from "./components/pacman";
import AnimatedLogin from "./components/login";
import RegisterPage from "./pages/register";

import AdminLayout from "./layouts/admin";
import EmployeeLayout from "./layouts/employee";
import { Toaster } from "react-hot-toast";
import OfficeMap from "./components/officemap";
import AdminInfo from "./components/admininfo";
import EmployeeList from "./components/addemployee";
import AnnouncementPage from "./components/announcements";
import EmployeeDashboard from "./components/employeedashboard";
import EmployeeScanner from "./components/Employeescanner";
import EmployeeAnnouncements from "./components/EmployeeAnnouncements";
import EmployeeDetails from "./components/EmployeeDetails";
import AdminSetupInfo from "./components/AdminSetupInfo";


function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen overflow-hidden">
        <Toaster />
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <PacManAnimatedBackground />
        </div>

        <div className="relative z-10">
          <Routes>

            {/* Public */}
            <Route path="/" element={<AnimatedLogin />} />
            <Route path="/register" element={<RegisterPage role="admin" />} />

            {/* Admin Routes */}
            <Route element={<AdminLayout />}>
              <Route path="/admin-info" element={<AdminInfo />} />
              <Route path="/employees" element={<EmployeeList />} />
              <Route path="/office-area" element={<OfficeMap />} />
              <Route path="/announcement" element={<AnnouncementPage />} />
              <Route path="/admin/employee-details/:id" element={<EmployeeDetails />} />
              <Route path="/admin/setup" element={<AdminSetupInfo />} />

            </Route>

            {/* Employee Routes */}
            <Route element={<EmployeeLayout />}>
              <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
              <Route path="/employee/office-area" element={<OfficeMap />} />
              <Route path="/employee/announcements" element={<EmployeeAnnouncements />} />
              <Route path="/employee/Scan" element={<EmployeeScanner />} />
              <Route path="/employee/details/:id" element={<EmployeeDetails />} />
            </Route>

          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
