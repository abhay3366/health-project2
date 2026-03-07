import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import Dashboard from "../pages/admin/Dashboard";
import Coaches from "../pages/admin/Coaches";
import Users from "../pages/admin/Users";
import UserHealthDetail from "../pages/user/UserHealthDetail";

export default function AdminLayout() {
  return (
    <Layout>
      <Routes>
        <Route index element={<Dashboard />} />
         <Route path="coaches" element={<Coaches />} />
         <Route path="/user/:id/health" element={<UserHealthDetail />} />
      </Routes>
    </Layout>
  );
}