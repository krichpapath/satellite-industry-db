"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ensurePublicEntryRole, ensureSeeded, syncDatasetFromApi, useRole } from "@/lib/store";
import { roleAtLeast, type Role } from "@/lib/schema";
import {
  LayoutDashboard,
  Search,
  Building2,
  Network,
  GitBranch,
  Settings,
  Satellite,
  Target,
  Database as DbIcon,
  ScrollText,
  BookOpenText,
  ChevronRight,
  Menu,
  X
} from "lucide-react";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; min: Role };

const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, min: "Public" },
  { href: "/search", label: "Search", icon: Search, min: "Public" },
  { href: "/companies", label: "Companies", icon: Building2, min: "Public" },
  { href: "/value-chain", label: "System Coverage", icon: GitBranch, min: "Admin" },
  { href: "/network", label: "Ecosystem", icon: Network, min: "Admin" },
  { href: "/gap-analysis", label: "Gap Analysis", icon: Target, min: "Admin" },
  { href: "/sources", label: "Sources", icon: DbIcon, min: "Admin" },
  { href: "/taxonomy", label: "Taxonomy", icon: BookOpenText, min: "Admin" },
  { href: "/audit", label: "Audit", icon: ScrollText, min: "Admin" },
  { href: "/admin", label: "Admin", icon: Settings, min: "Admin" }
];

const roleDesc: Record<Role, string> = {
  Public: "Read-only. Cannot edit any record.",
  Analyst: "Can add companies and components. Cannot edit, delete, or export.",
  Admin: "Full access: audit, import/export, wipe."
};

const roleColor: Record<Role, string> = {
  Public: "var(--muted)",
  Analyst: "var(--accent)",
  Admin: "var(--primary)"
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const role = useRole();
  const [hovered, setHovered] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleNav = NAV.filter((item) => roleAtLeast(role, item.min));
  const bottomNav = visibleNav.filter((item) => ["/", "/search", "/companies"].includes(item.href));

  useEffect(() => {
    ensureSeeded();
    ensurePublicEntryRole();
    void syncDatasetFromApi();
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function isActive(href: string) {
    if (href === "/companies") return pathname?.startsWith("/companies") || pathname?.startsWith("/firms");
    return href === "/" ? pathname === "/" : pathname?.startsWith(href);
  }

  return (
    <div
      className="app-shell"
      data-mobile-open={mobileOpen ? "true" : "false"}
      style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh" }}
    >
      <header className="app-shell__mobile-top">
        <button
          type="button"
          className="app-shell__icon-button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          aria-controls="primary-navigation"
          aria-expanded={mobileOpen}
        >
          <Menu size={20} />
        </button>
        <Link href="/" className="app-shell__mobile-brand" aria-label="SatDB dashboard">
          <span className="app-shell__brand-mark"><Satellite size={18} /></span>
          <span>SatDB</span>
        </Link>
        <span className="app-shell__role-pill" style={{ borderColor: roleColor[role], color: roleColor[role] }}>
          {role}
        </span>
      </header>

      <button
        type="button"
        className="app-shell__overlay"
        aria-label="Close navigation"
        onClick={() => setMobileOpen(false)}
      />

      <aside
        id="primary-navigation"
        className="app-shell__sidebar"
        aria-label="Primary navigation"
        style={{
          borderRight: "1px solid var(--line)",
          padding: "22px 16px",
          background: "var(--surface)",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto"
        }}
      >
        <div className="app-shell__sidebar-tools">
          <button
            type="button"
            className="app-shell__icon-button app-shell__mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="app-shell__brand"
          style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}
        >
          <motion.div
            whileHover={{ rotate: 12, scale: 1.04 }}
            transition={{ type: "spring", stiffness: 300, damping: 16 }}
            style={{
              width: 36,
              height: 36,
              background: "linear-gradient(135deg, var(--primary), var(--accent))",
              borderRadius: 9,
              display: "grid",
              placeItems: "center",
              color: "#fff"
            }}
          >
            <Satellite size={20} />
          </motion.div>
          <div className="app-shell__label">
            <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.1 }}>SatDB</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>Thai Satellite Industry</div>
          </div>
        </motion.div>

        <div className="app-shell__role" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
            <motion.span
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: roleColor[role],
                display: "inline-block"
              }}
            />
            Active role
          </div>
          <div className="app-shell__role-card" style={{ borderColor: roleColor[role] }}>
            {role}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.18 }}
              style={{ fontSize: 11, color: "var(--muted)", marginTop: 6, lineHeight: 1.4 }}
            >
              {roleDesc[role]}
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.nav
          className="app-shell__nav"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.035, delayChildren: 0.08 } }
          }}
          style={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {visibleNav.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            const isHover = hovered === item.href;

            return (
              <motion.div
                key={item.href}
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.24 } }
                }}
                onHoverStart={() => setHovered(item.href)}
                onHoverEnd={() => setHovered(null)}
                style={{ position: "relative" }}
              >
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "var(--surface-muted)",
                      borderRadius: 9,
                      zIndex: 0
                    }}
                  />
                )}
                {active && (
                  <motion.div
                    layoutId="nav-bar"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 8,
                      bottom: 8,
                      width: 3,
                      background: "var(--primary)",
                      borderRadius: 2,
                      zIndex: 1
                    }}
                  />
                )}
                <Link
                  href={item.href}
                  style={{
                    position: "relative",
                    zIndex: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 12px",
                    borderRadius: 9,
                    fontSize: 14,
                    color: active ? "var(--primary)" : isHover ? "var(--ink)" : "var(--ink-soft)",
                    fontWeight: active ? 600 : 500,
                    transition: "color 160ms ease, transform 180ms cubic-bezier(.2,.7,.2,1)",
                    transform: isHover && !active ? "translateX(3px)" : "translateX(0)"
                  }}
                >
                  <motion.span
                    animate={{ scale: isHover ? 1.12 : 1, rotate: isHover && !active ? -5 : 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 16 }}
                    style={{ display: "inline-flex" }}
                  >
                    <Icon size={17} />
                  </motion.span>
                  <span className="app-shell__label">{item.label}</span>
                  <AnimatePresence>
                    {isHover && !active && (
                      <motion.span
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -4 }}
                        transition={{ duration: 0.15 }}
                        style={{ marginLeft: "auto", display: "inline-flex", color: "var(--muted)" }}
                      >
                        <ChevronRight size={14} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            );
          })}
        </motion.nav>
      </aside>

      <main className="app-shell__main" style={{ padding: "28px 32px", overflowX: "hidden" }}>{children}</main>

      <nav className="app-shell__bottom-nav" aria-label="Primary mobile navigation">
        {bottomNav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} data-active={active ? "true" : "false"}>
              <Icon size={18} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open all navigation"
          aria-controls="primary-navigation"
          aria-expanded={mobileOpen}
        >
          <Menu size={18} aria-hidden="true" />
          <span>Menu</span>
        </button>
      </nav>
    </div>
  );
}
