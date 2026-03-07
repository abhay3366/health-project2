import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import Dashboard from "../pages/user/Dashboard";


import AddActivity from "../pages/user/AddActivity";
import ActivityHistory from "../pages/user/ActivityHistory";
import AddMedicine from "../pages/user/AddMedicince";
import MedicineSchedule from "../pages/user/MedicinceSchedule";
import AddMeal from "../pages/user/AddMeal";
import MealHistory from "../pages/user/MealHistory";



export default function UserLayout() {
  return (
    <Layout>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="/meal/add/" element={<AddMeal />} />
        <Route path="/meal/history/" element={<MealHistory />} />

        <Route path="/activity/add" element={<AddActivity/>} />
        <Route path="/activity/history" element={<ActivityHistory />} />
        <Route path="/medicine/add" element={<AddMedicine />} />
        <Route path="/medicine/schedule" element={<MedicineSchedule />} />
      </Routes>
    </Layout>
  );
}