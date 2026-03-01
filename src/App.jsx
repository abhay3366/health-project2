import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./page/Login";
import Dashboard from "./page/Dashboard";
import MainLayout from "./Layout/MainLayout";
import HealthReports from "./page/HealthReports";
import DietPlan from "./page/DietPlan"
import Medications from "./page/Medications"
import Activities from "./page/Activites"
import Vitals from "./page/Vitals";
import Hydration from "./page/Hydration";
import Sleep from "./page/Sleep";
import Goals from "./page/Goals";

export default function HealthDashboard() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/app" element={<MainLayout />}>
          {/* Main - remove leading slashes for nested routes */}
          <Route index element={<Dashboard />} />
          <Route path="diet-plan" element={<DietPlan />} />
          <Route path="activities" element={<Activities />} />
          <Route path="health-reports" element={<HealthReports />} />
          <Route path="medications" element={<Medications />} />
          
          {/* Monitors - remove leading slashes */}
          <Route path="vitals" element={<Vitals />} />
          <Route path="hydration" element={<Hydration />} />
          <Route path="sleep" element={<Sleep />} />
          <Route path="goals" element={<Goals />} />
          
          {/* Connect - add if you have these routes */}
          {/* <Route path="doctor" element={<DoctorDashboard />} />
          <Route path="reminders" element={<Reminders />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}