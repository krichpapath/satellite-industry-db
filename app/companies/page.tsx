"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Boxes, MapPin, Search as SearchIcon, X } from "lucide-react";
import { useDatabase, useRole } from "@/lib/store";
import { rolePermissions, provinceLabel, OWNERSHIP_TYPES } from "@/lib/schema";
import { normalizeSystem } from "@/lib/component-taxonomy";
import { Card, Input, Button, Badge, EmptyState, Select, ownershipTone } from "@/components/ui";
import { SystemPill } from "@/components/component-records";

type SortKey = "name" | "components" | "founded";

export default function FirmsPage() {
  const db = useDatabase();
  const permissions = rolePermissions(useRole());
  const [q, setQ] = useState("");
  const [ownership, setOwnership] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("name");

  const systemsByFirm = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const component of db.products) {
      const systems = map.get(component.firm_id) ?? [];
      const system = normalizeSystem(component.system);
      if (!systems.includes(system)) systems.push(system);
      map.set(component.firm_id, systems);
    }
    return map;
  }, [db.products]);

  const countByFirm = useMemo(() => {
    const map = new Map<string, number>();
    for (const component of db.products) {
      map.set(component.firm_id, (map.get(component.firm_id) ?? 0) + 1);
    }
    return map;
  }, [db.products]);

  const rows = useMemo(() => {
    const kw = q.trim().toLowerCase();
    const filtered = db.firms.filter((company) => {
      if (ownership && company.ownership_type !== ownership) return false;
      if (!kw) return true;
      return `${company.firm_name} ${company.firm_id} ${company.province} ${company.industrial_zone ?? ""} ${(systemsByFirm.get(company.firm_id) ?? []).join(" ")}`
        .toLowerCase()
        .includes(kw);
    });
    return [...filtered].sort((a, b) => {
      if (sortBy === "components") {
        return (countByFirm.get(b.firm_id) ?? 0) - (countByFirm.get(a.firm_id) ?? 0) || a.firm_name.localeCompare(b.firm_name);
      }
      if (sortBy === "founded") {
        return b.year_established - a.year_established || a.firm_name.localeCompare(b.firm_name);
      }
      return a.firm_name.localeCompare(b.firm_name, undefined, { sensitivity: "base" });
    });
  }, [db.firms, q, ownership, sortBy, systemsByFirm, countByFirm]);

  const provinceCount = new Set(db.firms.map((f) => f.province).filter((p) => p && p !== "Unidentified")).size;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <header className="search-page__header">
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 650 }}>Companies</h1>
          <p style={{ margin: "6px 0 0", color: "var(--ink-soft)", fontSize: 14 }}>
            Companies registered in the Thai satellite industry database.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div className="search-page__summary" aria-label="Directory summary">
            <strong className="tabular">{db.firms.length}</strong>
            <span>companies</span>
            <strong className="tabular">{provinceCount}</strong>
            <span>provinces</span>
            <strong className="tabular">{db.products.length}</strong>
            <span>components</span>
          </div>
          {permissions.canCreateCompany && (
            <Link href="/companies/new" className="page-header-action">
              <Button>Add company</Button>
            </Link>
          )}
        </div>
      </header>

      <Card>
        <div className="search-toolbar" style={{ marginBottom: 16 }}>
          <label className="search-keyword search-keyword--primary">
            <SearchIcon size={18} aria-hidden="true" />
            <Input
              type="search"
              placeholder="Filter by name, province, zone, or system"
              aria-label="Filter companies"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ borderWidth: 0, boxShadow: "none", paddingLeft: 4 }}
            />
            {q && (
              <button type="button" className="search-clear-button" onClick={() => setQ("")} aria-label="Clear filter">
                <X size={15} aria-hidden="true" />
              </button>
            )}
          </label>
          <div className="search-control-row">
            <div style={{ minWidth: 150 }}>
              <Select value={ownership} onChange={(e) => setOwnership(e.target.value)} aria-label="Filter by ownership">
                <option value="">All ownership</option>
                {OWNERSHIP_TYPES.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
            </div>
            <div style={{ minWidth: 170 }}>
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)} aria-label="Sort companies">
                <option value="name">Name A-Z</option>
                <option value="components">Most components</option>
                <option value="founded">Newest founded</option>
              </Select>
            </div>
            <div className="search-found-count" aria-live="polite">
              <strong className="tabular">{rows.length}</strong>
              <span>{rows.length === 1 ? "company" : "companies"}</span>
            </div>
          </div>
        </div>

        {rows.length === 0 ? (
          <EmptyState message="No companies match your filter." />
        ) : (
          <div className="catalog-grid">
            {rows.map((company) => {
              const systems = systemsByFirm.get(company.firm_id) ?? [];
              const count = countByFirm.get(company.firm_id) ?? 0;
              return (
                <article key={company.firm_id} className="catalog-card">
                  <div className="catalog-card__head">
                    <div className="catalog-card__title">
                      <Link
                        href={`/companies/${company.firm_id}`}
                        style={{ color: "var(--primary-strong)", fontWeight: 700, fontSize: 15, textDecoration: "none" }}
                      >
                        {company.firm_name}
                      </Link>
                      <div className="catalog-card__path" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <MapPin size={12} aria-hidden="true" />
                        {provinceLabel(company.province)} · Est. {company.year_established}
                      </div>
                    </div>
                    <code className="catalog-card__id">{company.firm_id}</code>
                  </div>
                  <div className="catalog-card__badges">
                    <Badge tone={ownershipTone(company.ownership_type)}>{company.ownership_type}</Badge>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--ink-soft)", fontSize: 12 }}>
                      <Boxes size={13} aria-hidden="true" />
                      {count} component{count === 1 ? "" : "s"}
                    </span>
                  </div>
                  {systems.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {systems.slice(0, 3).map((system) => (
                        <SystemPill key={system} system={system} compact />
                      ))}
                      {systems.length > 3 && <Badge>+{systems.length - 3} more</Badge>}
                    </div>
                  )}
                  <div className="catalog-card__actions">
                    <Link href={`/companies/${company.firm_id}`} style={{ textDecoration: "none" }}>
                      <Button variant="secondary" style={{ minHeight: 36, padding: "7px 12px" }}>
                        View
                        <ArrowRight size={14} aria-hidden="true" />
                      </Button>
                    </Link>
                    {permissions.canEdit && (
                      <Link href={`/companies/${company.firm_id}/edit`} style={{ textDecoration: "none" }}>
                        <Button variant="ghost" style={{ minHeight: 36, padding: "7px 12px" }}>
                          Edit
                        </Button>
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
