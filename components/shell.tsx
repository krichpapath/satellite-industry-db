"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ensureSeeded, useRole, setRole } from "@/lib/store";
import { roleAtLeast, type Role, ROLES } from "@/lib/schema";
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
  Lock,
  ChevronRight
} from "lucide-react";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; min: Role };

const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, min: "Public" },
  { href: "/search", label: "Search", icon: Search, min: "Public" },
  { href: "/firms", label: "Firms", icon: Building2, min: "Public" },
  { href: "/value-chain", label: "Value Chain", icon: GitBranch, min: "Public" },
  { href: "/network", label: "Ecosystem", icon: Network, min: "Public" },
  { href: "/gap-analysis", label: "Gap Analysis", icon: Target, min: "Public" },
  { href: "/sources", label: "Sources", icon: DbIcon, min: "Analyst" },
  { href: "/taxonomy", label: "Taxonomy", icon: BookOpenText, min: "Analyst" },
  { href: "/audit", label: "Audit", icon: ScrollText, min: "Admin" },
  { href: "/admin", label: "Admin", icon: Settings, min: "Admin" }
];

const roleDesc: Record<Role, string> = {
  Public: "Read-only. Cannot edit any record.",
  Analyst: "Can edit firm & sub-tables, sources, taxonomy.",
  Admin: "Full access — audit, import/export, wipe."
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

  useEffect(() => {
    ensureSeeded();
  }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh" }}>
      <aside
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
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}
        >
          <motion.div
            whileHover={{ rotate: 15, scale: 1.08 }}
            transition={{ type: "spring", stiffness: 300, damping: 12 }}
            style={{
              width: 36,
              height: 36,
              background: "linear-gradient(135deg, var(--primary), var(--accent))",
              borderRadius: 9,
              display: "grid",
              placeItems: "center",
              color: "#fff",
              boxShadow: "0 4px 12px rgba(15, 118, 110, 0.25)"
            }}
          >
            <Satellite size={20} />
          </motion.div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.1 }}>SatDB</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>Thai Satellite Industry</div>
          </div>
        </motion.div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
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
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            style={{
              width: "100%",
              padding: "7px 10px",
              border: `1px solid ${roleColor[role]}`,
              borderRadius: 8,
              background: "var(--surface)",
              color: "var(--ink)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              transition: "border-color 200ms ease, box-shadow 200ms ease",
              outline: "none"
            }}
            onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${roleColor[role]}33`)}
            onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
              style={{ fontSize: 11, color: "var(--muted)", marginTop: 6, lineHeight: 1.4 }}
            >
              {roleDesc[role]}
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.nav
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } }
          }}
          style={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {NAV.map((item) => {
            const visible = roleAtLeast(role, item.min);
            const active =
              item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
            const Icon = item.icon;
            const isHover = hovered === item.href;

            const itemVariant = {
              hidden: { opacity: 0, x: -12 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
            };

            if (!visible) {
              return (
                <motion.div
                  key={item.href}
                  variants={itemVariant}
                  whileHover={{ x: 2 }}
                  onHoverStart={() => setHovered(item.href)}
                  onHoverEnd={() => setHovered(null)}
                  title={`Requires ${item.min} role`}
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 12px",
                    borderRadius: 9,
                    fontSize: 14,
                    color: "var(--muted)",
                    opacity: 0.55,
                    cursor: "not-allowed",
                    background: isHover ? "var(--surface-muted)" : "transparent",
                    transition: "background 180ms ease"
                  }}
                >
                  <Icon size={17} />
                  {item.label}
                  <Lock size={11} style={{ marginLeft: "auto" }} />
                </motion.div>
              );
            }

            return (
              <motion.div
                key={item.href}
                variants={itemVariant}
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
                    animate={{
                      scale: isHover ? 1.15 : 1,
                      rotate: isHover && !active ? -6 : 0
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 14 }}
                    style={{ display: "inline-flex" }}
                  >
                    <Icon size={17} />
                  </motion.span>
                  {item.label}
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

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          whileHover={{ y: -2, boxShadow: "0 8px 20px rgba(16, 24, 40, 0.08)" }}
          style={{
            marginTop: 28,
            padding: "14px 12px",
            background: "var(--surface-muted)",
            borderRadius: 10,
            border: "1px solid var(--line-soft)",
            cursor: "default"
          }}
        >
          <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
            Prototype
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.5 }}>
            No backend. Data in <code>localStorage</code>. Role mock for §6.5 access control.
          </div>
        </motion.div>
      </aside>

      <main style={{ padding: "28px 32px", overflowX: "hidden" }}>{children}</main>
    </div>
  );
}
