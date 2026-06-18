"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpDown, Search as SearchIcon, SlidersHorizontal, X } from "lucide-react";
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
import { ProvinceCombobox } from "@/components/province-combobox";

type SortKey = "company" | "province" | "components";

function compareText(a: string, b: string) {
  return a.localeCompare(b, undefined, { sensitivity: "base", numeric: true });
}

export default function SearchPage() {
  const db = useDatabase();
  const [keyword, setKeyword] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const [system, setSystem] = useState("");
  const [module, setModule] = useState("");
  const [componentName, setComponentName] = useState("");
  const [ownership, setOwnership] = useState("");
  const [province, setProvince] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("company");

  const modules = modulesForSystem(system);
  const componentOptions = componentsForModule(system, module);
  const componentCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const component of db.products) {
      counts.set(component.firm_id, (counts.get(component.firm_id) ?? 0) + 1);
    }
    return counts;
  }, [db.products]);

  const filteredResults = useMemo(() => {
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

  const results = useMemo(() => {
    const byCompany = (a: (typeof filteredResults)[number], b: (typeof filteredResults)[number]) =>
      compareText(a.firm_name, b.firm_name) || compareText(a.firm_id, b.firm_id);

    return [...filteredResults].sort((a, b) => {
      if (sortBy === "province") {
        return compareText(a.province, b.province) || byCompany(a, b);
      }
      if (sortBy === "components") {
        return (componentCounts.get(b.firm_id) ?? 0) - (componentCounts.get(a.firm_id) ?? 0) || byCompany(a, b);
      }
      return byCompany(a, b);
    });
  }, [componentCounts, filteredResults, sortBy]);

  const sortLabels: Record<SortKey, string> = {
    company: "Company A-Z",
    province: "Province A-Z",
    components: "Most components"
  };

  const activeFilters = [
    keyword.trim() ? { key: "keyword", label: `Keyword: ${keyword.trim()}`, clear: () => setKeyword("") } : null,
    system ? { key: "system", label: `System: ${system}`, clear: () => onSystemChange("") } : null,
    module ? { key: "module", label: `Module: ${module}`, clear: () => onModuleChange("") } : null,
    componentName ? { key: "component", label: `Component: ${componentName}`, clear: () => setComponentName("") } : null,
    province ? { key: "province", label: `Province: ${province}`, clear: () => setProvince("") } : null,
    ownership ? { key: "ownership", label: `Ownership: ${ownership}`, clear: () => setOwnership("") } : null
  ].filter((filter): filter is { key: string; label: string; clear: () => void } => Boolean(filter));

  const hasActiveFilters = activeFilters.length > 0;

  function reset() {
    setKeyword("");
    setSystem("");
    setModule("");
    setComponentName("");
    setOwnership("");
    setProvince("");
    setSortBy("company");
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
        <div className="search-toolbar">
          <label className="search-keyword">
            <SearchIcon size={17} aria-hidden="true" />
            <Input
              type="search"
              placeholder="Search companies, locations, systems..."
              aria-label="Search companies"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ borderWidth: 0, boxShadow: "none", paddingLeft: 4 }}
            />
          </label>

          <div className="search-control-row">
            <Button variant="secondary" onClick={() => setAdvanced((v) => !v)} ariaLabel={advanced ? "Hide filters" : "Show filters"}>
              <SlidersHorizontal size={16} aria-hidden="true" />
              {advanced ? "Hide filters" : "Filters"}
            </Button>
            <label className="search-sort">
              <ArrowUpDown size={16} aria-hidden="true" />
              <span className="sr-only">Sort results</span>
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)} aria-label="Sort results">
                <option value="company">Company A-Z</option>
                <option value="province">Province A-Z</option>
                <option value="components">Most components</option>
              </Select>
            </label>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={reset}>
                Reset
              </Button>
            )}
          </div>
        </div>

        {advanced && (
            <div className="search-filter-panel">
              <Grid cols={3} gap={14}>
                <Field label="System">
                  <Select value={system} onChange={(e) => onSystemChange(e.target.value)}>
                    <option value="">All systems</option>
                    {COMPONENT_SYSTEMS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Province">
                  <ProvinceCombobox value={province} onChange={setProvince} allLabel="All provinces" />
                </Field>
                <Field label="Ownership">
                  <Select value={ownership} onChange={(e) => setOwnership(e.target.value)}>
                    <option value="">All ownership</option>
                    {OWNERSHIP_TYPES.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </Select>
                </Field>
                {system && (
                  <Field label="Module">
                    <Select value={module} onChange={(e) => onModuleChange(e.target.value)}>
                      <option value="">All modules</option>
                      {modules.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </Select>
                  </Field>
                )}
                {module && (
                  <Field label="Component">
                    <Select value={componentName} onChange={(e) => setComponentName(e.target.value)}>
                      <option value="">All components</option>
                      {componentOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </Select>
                  </Field>
                )}
              </Grid>
            </div>
        )}

        <AnimatePresence initial={false}>
          {activeFilters.length > 0 && (
            <motion.div className="search-chip-row" initial={false} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {activeFilters.map((filter) => (
                <motion.button
                  key={filter.key}
                  type="button"
                  className="search-chip"
                  onClick={filter.clear}
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.16 }}
                >
                  <span>{filter.label}</span>
                  <X size={13} aria-hidden="true" />
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <Card>
        <div className="search-result-header">
          <SectionTitle hint={`${results.length} matching compan${results.length === 1 ? "y" : "ies"} sorted by ${sortLabels[sortBy]}.`}>Results</SectionTitle>
        </div>
        <div
          key={`${keyword}|${system}|${module}|${componentName}|${ownership}|${province}|${sortBy}|${results.length}`}
          className="search-results-motion"
        >
          {results.length === 0 ? (
            <div className="search-empty">
              <strong>No companies match these filters.</strong>
              <span>Clear the filters or try a broader keyword.</span>
              {hasActiveFilters && (
                <Button variant="secondary" onClick={reset}>
                  Reset filters
                </Button>
              )}
            </div>
          ) : (
            <Table
              rows={results}
              getRowKey={(company) => company.firm_id}
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
                { key: "own", header: "Ownership", render: (company) => <Badge>{company.ownership_type}</Badge> },
                { key: "loc", header: "Location", render: (company) => company.province },
                {
                  key: "components",
                  header: "Components",
                  render: (company) => {
                    const count = componentCounts.get(company.firm_id) ?? 0;
                    return count === 0 ? "-" : (
                      <span style={{ display: "inline-flex", gap: 4, flexWrap: "wrap" }}>
                        <Badge tone="accent">{count} component{count === 1 ? "" : "s"}</Badge>
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
          )}
        </div>
      </Card>
    </div>
  );
}
