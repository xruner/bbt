import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import Home from "@/pages/Home";
import Booking from "@/pages/Booking";
import MyAppointments from "@/pages/MyAppointments";
import Admin from "@/pages/Admin";
import Appointments from "@/pages/admin/Appointments";
import Timeslots from "@/pages/admin/Timeslots";
import Notifications from "@/pages/admin/Notifications";
import Settings from "@/pages/admin/Settings";
import { createContext, useState } from "react";

export const AuthContext = createContext({
  isAuthenticated: false,
  setIsAuthenticated: (value: boolean) => {},
  logout: () => {},
});

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, logout }}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/booking" 
          element={
            <Suspense fallback={<div className="flex justify-center items-center h-screen">加载中...</div>}>
              <Booking />
            </Suspense>
          } 
        />
        <Route path="/my-appointments" element={<MyAppointments />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/appointments" element={<Appointments />} />
        <Route path="/admin/timeslots" element={<Timeslots />} />
        <Route path="/admin/notifications" element={<Notifications />} />
        <Route path="/admin/settings" element={<Settings />} />
      </Routes>
    </AuthContext.Provider>
  );
}
