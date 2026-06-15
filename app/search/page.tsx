"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useDatabase } from "@/lib/store";
import {
  Card,
  SectionTitle,
  Input,
  Select,
  Field,
  Grid,
  Button,
  Table,
  Badge
} from "@/components/ui";
import { OWNERSHIP_TYPES } from "@/lib/schema";
import { COMPONENT_SYSTEMS, componentsForModule, modulesForSystem } from "@/lib/component-taxonomy";

export default function SearchPage() {
  const db = useDatabase();
  const [keyword, setKeyword] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const [system, setSystem] = useState("");
  const [module, setModule] = useState("");
  const [componentName, setComponentName] = useState("");
  const [ownership, setOwnership] = useState("");
  const [province, setProvince] = useState("");

  const provinces = useMemo(
    () => Array.from(new Set(db.firms.map((company) => company.province))).sort(),
    [db.firms]
  );

  const modules = modulesForSystem(system);
  const componentOptions = componentsForModule(system, module);

  const results = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return db.firms.filter((company) => {
      if (kw) {
        const components = db.products.filter((component) => component.firm_id === company.firm_id);
        const hay = [
          company.firm_name,
          company.province,
          company.industrial_zone ?? "",
          company.parent_company ?? "",
          company.registration_no,
          ...components.flatMap((component) => [component.product_name, component.component_name, component.system, component.module, component.description ?? ""])
        ].join(" ").toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      if (ownership && company.ownership_type !== ownership) return false;
      if (province && company.province !== province) return false;
      if (system || module || componentName) {
        const has = db.products.some((component) =>
          component.firm_id === company.firm_id &&
          (!system || component.system === system) &&
          (!module || component.module === module) &&
          (!componentName || component.component_name === componentName)
        );
        if (!has) return false;
      }
      return true;
    });
  }, [db, keyword, ownership, province, system, module, componentName]);

  function reset() {
    setKeyword("");
    setSystem("");
    setModule("");
    setComponentName("");
    setOwnership("");
    setProvince("");
  }

  function onSystemChange(next: string) {
    setSystem(next);
    setModule("");
    setComponentName("");
  }

  function onModuleChange(next: string) {
    setModule(next);
    setComponentName("");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600 }}>Search</h1>
        <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 14 }}>
          Search companies by profile fields and satellite component taxonomy.
        </div>
      </header>

      <Card>
        <Grid cols={2} gap={14}>
          <Field label="Keyword">
            <Input
              placeholder="Search company, location, system, module, component..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </Field>
          <div className="search-filter-actions" style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <Button variant="secondary" onClick={() => setAdvanced((v) => !v)}>
              {advanced ? "Hide filters" : "Show filters"}
            </Button>
            <Button variant="ghost" onClick={reset}>
              Reset filters
            </Button>
          </div>
        </Grid>

        {advanced && (
          <div style={{ marginTop: 14 }}>
            <Grid cols={3} gap={14}>
              <Field label="System">
                <Select value={system} onChange={(e) => onSystemChange(e.target.value)}>
                  <option value="">All systems</option>
                  {COMPONENT_SYSTEMS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Module">
                <Select value={module} onChange={(e) => onModuleChange(e.target.value)} disabled={!system}>
                  <option value="">All modules</option>
                  {modules.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Component">
                <Select value={componentName} onChange={(e) => setComponentName(e.target.value)} disabled={!module}>
                  <option value="">All components</option>
                  {componentOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Ownership type">
                <Select value={ownership} onChange={(e) => setOwnership(e.target.value)}>
                  <option value="">All ownership</option>
                  {OWNERSHIP_TYPES.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Province">
                <Select value={province} onChange={(e) => setProvince(e.target.value)}>
                  <option value="">All provinces</option>
                  {provinces.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </Select>
              </Field>
            </Grid>
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle hint={`${results.length} matching compan${results.length === 1 ? "y" : "ies"}.`}>Results</SectionTitle>
        <Table
          rows={results}
          empty="No companies match the filters."
          columns={[
            {
              key: "name",
              header: "Company",
              render: (company) => (
                <Link href={`/companies/${company.firm_id}`} style={{ color: "var(--primary)", fontWeight: 500 }}>
                  {company.firm_name}
                </Link>
              )
            },
            { key: "id", header: "ID", render: (company) => <code>{company.firm_id}</code> },
            { key: "own", header: "Ownership", render: (company) => <Badge>{company.ownership_type}</Badge> },
            { key: "loc", header: "Location", render: (company) => company.province },
            {
              key: "components",
              header: "Components",
              render: (company) => {
                const components = db.products.filter((component) => component.firm_id === company.firm_id);
                return components.length === 0 ? "-" : (
                  <span style={{ display: "inline-flex", gap: 4, flexWrap: "wrap" }}>
                    <Badge tone="accent">{components.length} component{components.length === 1 ? "" : "s"}</Badge>
                  </span>
                );
              }
            },
            {
              key: "systems",
              header: "Systems",
              render: (company) => {
                const systems = Array.from(new Set(db.products.filter((component) => component.firm_id === company.firm_id).map((component) => component.system)));
                return systems.length === 0 ? "-" : systems.map((value) => <Badge key={value}>{value}</Badge>);
              }
            }
          ]}
        />
      </Card>
    </div>
  );
}
