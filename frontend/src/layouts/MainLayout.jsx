import React, { Suspense, lazy } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar.jsx";
import PageTransition from "../components/PageTransition.jsx";
const FloatingKnowledgeObject = lazy(() => import("../components/FloatingKnowledgeObject.jsx"));

export default function MainLayout() {
  const location = useLocation();
  return (
    <div className="luxury-shell min-h-screen bg-gray-50">
      <div className="luxury-decoration" aria-hidden="true">
        <div className="luxury-orb luxury-orb-one" />
      </div>
      <Suspense fallback={null}><FloatingKnowledgeObject className="app-sculpture" /></Suspense>
      <Navbar />
      <main className="relative z-10 mx-auto w-full max-w-7xl min-w-0 px-4 py-6">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}><Outlet /></PageTransition>
        </AnimatePresence>
      </main>
    </div>
  );
}
