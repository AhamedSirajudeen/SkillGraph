import React, { Suspense, lazy } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar.jsx";
import PageTransition from "../components/PageTransition.jsx";

const FloatingKnowledgeObject = lazy(() => import("../components/FloatingKnowledgeObject.jsx"));
const ADMIN_LINKS = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/skills", label: "Skills" },
  { to: "/admin/goals", label: "Goals" },
  { to: "/admin/dependencies", label: "Dependencies" },
  { to: "/admin/users", label: "Users" },
];

export default function AdminLayout() {
  const location = useLocation();
  return <div className="luxury-shell min-h-screen">
    <Suspense fallback={null}><FloatingKnowledgeObject className="app-sculpture app-sculpture-admin" /></Suspense>
    <Navbar links={ADMIN_LINKS} brand="SkillGraph Admin" homeTo="/admin" backTo="/dashboard" showProfile={false} />
    <main className="relative z-10 mx-auto w-full max-w-7xl min-w-0 px-4 py-6"><AnimatePresence mode="wait"><PageTransition key={location.pathname}><Outlet /></PageTransition></AnimatePresence></main>
  </div>;
}
