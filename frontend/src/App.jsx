import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import AdminRoute from "./routes/AdminRoute.jsx";
import MainLayout from "./layouts/MainLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Skills from "./pages/Skills.jsx";
import SkillDetail from "./pages/SkillDetail.jsx";
import SkillGraph from "./pages/SkillGraph.jsx";
import Roadmap from "./pages/Roadmap.jsx";
import Progress from "./pages/Progress.jsx";
import Profile from "./pages/Profile.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminSkills from "./pages/admin/AdminSkills.jsx";
import AdminGoals from "./pages/admin/AdminGoals.jsx";
import AdminDependencies from "./pages/admin/AdminDependencies.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<Onboarding />} />

        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/skills/:id" element={<SkillDetail />} />
          <Route path="/skill-graph" element={<SkillGraph />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/skills" element={<AdminSkills />} />
            <Route path="/admin/goals" element={<AdminGoals />} />
            <Route path="/admin/dependencies" element={<AdminDependencies />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
