import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import Dashboard from "../pages/coach/Dashboard";
export default function CoachLayout() {
  return (
    <Layout>
      <Routes>
        <Route index element={<Dashboard />} />
        
      </Routes>
    </Layout>
  );
}