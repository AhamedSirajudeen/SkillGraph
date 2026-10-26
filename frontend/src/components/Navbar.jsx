import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";

export const LEARNER_LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/roadmap", label: "Roadmap" },
  { to: "/skill-graph", label: "Skill Graph" },
  { to: "/skills", label: "Skills" },
  { to: "/progress", label: "Progress" },
];

export default function Navbar({ links = LEARNER_LINKS, brand = "SkillGraph", homeTo = "/dashboard", backTo, showProfile = true }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const visibleLinks = user?.role === "admin" && !links.some((link) => link.to === "/admin")
    ? [...links, { to: "/admin", label: "Admin" }]
    : links;
  function NavLink({ link, mobile = false }) {
    const active = location.pathname === link.to || (!mobile && link.to === "/admin" && location.pathname.startsWith("/admin/"));
    return <Link to={link.to} onClick={() => setMobileOpen(false)} className={`nav-link ${mobile ? "nav-link-mobile" : ""} ${active ? "nav-link-active" : ""}`}>
      {active && <motion.span layoutId={mobile ? "mobile-active-navigation" : "active-navigation"} transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }} className="nav-indicator" />}
      <span className="relative z-10">{link.label}</span>
    </Link>;
  }
  return <header className="luxury-navbar relative z-30">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
      <div className="flex items-center gap-2">
        {backTo && <Link to={backTo} aria-label="Back to SkillGraph" title="Back to SkillGraph" className="nav-back">←</Link>}
        <Link to={homeTo} className="brand-mark"><span className="brand-gem">◇</span>{brand}</Link>
      </div>
      <LayoutGroup><nav className="hidden min-w-0 items-center gap-1 lg:flex" aria-label="Main navigation">{visibleLinks.map((link) => <NavLink key={link.to} link={link} />)}</nav></LayoutGroup>
      <div className="flex items-center gap-3">
        {showProfile && <Link to="/profile" className="profile-link">{user?.name}</Link>}
        <button className="btn-secondary navbar-logout" onClick={() => { logout(); navigate("/login"); }}>Logout</button>
        <button className="mobile-menu-button lg:hidden" aria-expanded={mobileOpen} aria-label="Toggle navigation menu" onClick={() => setMobileOpen((value) => !value)}><span /><span /><span /></button>
      </div>
    </div>
    <AnimatePresence>{mobileOpen && <motion.nav initial={reduceMotion ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mobile-nav lg:hidden" aria-label="Mobile navigation"><LayoutGroup>{visibleLinks.map((link) => <NavLink key={link.to} link={link} mobile />)}</LayoutGroup></motion.nav>}</AnimatePresence>
  </header>;
}
