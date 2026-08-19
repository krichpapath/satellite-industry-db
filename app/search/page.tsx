"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpDown, Boxes, MapPin, Search as SearchIcon, SlidersHorizontal, X } from "lucide-react";
import { useDatabase } from "@/lib/store";
import {
  Card,
  SectionTitle,
  Input,
  Select,
  Field,
  Grid,
  Button,
  Badge,
  Pagination
} from "@/components/ui";
import { OWNERSHIP_TYPES } from "@/lib/schema";
import { COMPONENT_SYSTEMS, componentsForModule, modulesForSystem } from "@/lib/component-taxonomy";
import { ProvinceCombobox } from "@/components/province-combobox";
import { SystemPill } from "@/components/component-records";
import { ownershipTone } from "@/components/ui";

type SortKey = "company" | "province" | "components";
const PAGE_SIZE = 8;

function compareText(a: string, b: string) {
  return a.localeCompare(b, undefined, { sensitivity: "base", numeric: true });
}

function recordLabel(count: number) {
  return count === 1 ? "record" : "records";
}

function includesText(values: unknown[], keyword: string) {
  const needle = keyword.trim().toLowerCase();
  if (!needle) return true;
  return values.some((value) => String(value ?? "").toLowerCase().includes(needle));
}

function highlightText(value: string, keyword: string) {
  const needle = keyword.trim();
  if (!needle) return value;
  const index = value.toLowerCase().indexOf(needle.toLowerCase());
  if (index < 0) return value;
  return (
    <>
      {value.slice(0, index)}
      <mark className="search-highlight">{value.slice(index, index + needle.length)}</mark>
      {value.slice(index + needle.length)}
    </>
  );
}

export default function SearchPage() {
  const db = useDatabase();
  const reduceMotion = useReducedMotion();
  const [keyword, setKeyword] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const [system, setSystem] = useState("");
  const [module, setModule] = useState("");
  const [componentName, setComponentName] = useState("");
  const [ownership, setOwnership] = useState("");
  const [province, setProvince] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("company");
  const [page, setPage] = useState(1);

  const modules = modulesForSystem(system);
  const componentOptions = componentsForModule(system, module);
  const productsByFirm = useMemo(() => {
    const groups = new Map<string, typeof db.products>();
    for (const component of db.products) {
      const rows = groups.get(component.firm_id) ?? [];
      rows.push(component);
      groups.set(component.firm_id, rows);
    }
    return groups;
  }, [db.products]);

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
      const components = productsByFirm.get(company.firm_id) ?? [];
      if (kw) {
        const hay = [
          company.firm_name,
          company.province,
          company.industrial_zone ?? "",
          company.parent_company ?? "",
          company.registration_no,
          ...components.flatMap((component) => [
            component.product_name,
            component.component_name,
            component.system,
            component.module,
            component.description ?? ""
          ])
        ].join(" ").toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      if (ownership && company.ownership_type !== ownership) return false;
      if (province && company.province !== province) return false;
      if (system || module || componentName) {
        const has = components.some((component) =>
          (!system || component.system === system) &&
          (!module || component.module === module) &&
          (!componentName || component.component_name === componentName)
        );
        if (!has) return false;
      }
      return true;
    });
  }, [db.firms, keyword, ownership, productsByFirm, province, system, module, componentName]);

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

  useEffect(() => {
    setPage(1);
  }, [keyword, system, module, componentName, ownership, province, sortBy]);

  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pagedResults = results.slice(pageStart, pageStart + PAGE_SIZE);

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
    <div className="search-page">
      <header className="search-page__header">
        <div>
          <h1>Search companies and components</h1>
          <p>Find companies by profile fields, province, ownership, and satellite component taxonomy.</p>
        </div>
        <div className="search-page__summary" aria-label="Search index summary">
          <strong className="tabular">{db.firms.length}</strong>
          <span>companies</span>
          <strong className="tabular">{db.products.length}</strong>
          <span>component records</span>
        </div>
      </header>

      <Card className="search-panel-card">
        <div className="search-toolbar">
          <label className="search-keyword search-keyword--primary">
            <SearchIcon size={18} aria-hidden="true" />
            <Input
              type="search"
              placeholder="Search company, component, system, module, province"
              aria-label="Search company, component, system, module, province"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ borderWidth: 0, boxShadow: "none", paddingLeft: 4 }}
            />
            {keyword && (
              <button type="button" className="search-clear-button" onClick={() => setKeyword("")} aria-label="Clear search keyword">
                <X size={15} aria-hidden="true" />
              </button>
            )}
          </label>

          <div className="search-control-row">
            <Button variant="secondary" onClick={() => setAdvanced((value) => !value)} ariaLabel={advanced ? "Hide filters" : "Show filters"}>
              <SlidersHorizontal size={16} aria-hidden="true" />
              Filters{activeFilters.length > 0 ? ` (${activeFilters.length})` : ""}
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
            <div className="search-found-count" aria-live="polite">
              <strong className="tabular">{results.length}</strong>
              <span>{results.length === 1 ? "company" : "companies"} found</span>
            </div>
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
              <Button variant="ghost" onClick={reset} style={{ minHeight: 32, padding: "5px 10px" }}>
                Clear all
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <Card className="search-results-card">
        <div className="search-result-header">
          <SectionTitle hint={`Sorted by ${sortLabels[sortBy]}. Showing ${results.length === 0 ? 0 : pageStart + 1}-${Math.min(pageStart + PAGE_SIZE, results.length)} of ${results.length}.`}>
            Results
          </SectionTitle>
        </div>
        <div className="search-results-motion">
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
            <div className="search-result-list">
              {pagedResults.map((company) => {
                const companyProducts = productsByFirm.get(company.firm_id) ?? [];
                const hasKeyword = keyword.trim().length > 0;
                const keywordMatchedProducts = hasKeyword
                  ? companyProducts.filter((component) => includesText([
                      component.product_name,
                      component.component_name,
                      component.system,
                      component.module,
                      component.description ?? ""
                    ], keyword))
                  : [];
                const visibleProducts = keywordMatchedProducts.slice(0, 3);
                const profileMatched = hasKeyword && includesText([
                  company.firm_name,
                  company.province,
                  company.industrial_zone ?? "",
                  company.parent_company ?? "",
                  company.registration_no
                ], keyword);
                const systems = Array.from(new Set(companyProducts.map((component) => component.system))).slice(0, 4);
                const componentCount = componentCounts.get(company.firm_id) ?? 0;

                return (
                  <motion.article
                    key={company.firm_id}
                    layout={!reduceMotion}
                    transition={{ duration: 0.24, ease: [0.2, 0.7, 0.2, 1] }}
                    className="search-result-card"
                  >
                    <div className="search-result-card__main">
                      <div className="search-result-card__title-row">
                        <Link href={`/companies/${company.firm_id}`} className="search-result-card__title">
                          {highlightText(company.firm_name, keyword)}
                        </Link>
                        <Link href={`/companies/${company.firm_id}`} className="search-result-card__open" aria-label={`View ${company.firm_name}`}>
                          View
                          <ArrowRight size={15} aria-hidden="true" />
                        </Link>
                      </div>
                      <div className="search-result-card__meta">
                        <span><MapPin size={14} aria-hidden="true" />{highlightText(company.province, keyword)}</span>
                        <Badge tone={ownershipTone(company.ownership_type)}>{company.ownership_type}</Badge>
                        <span><Boxes size={14} aria-hidden="true" />{componentCount} component {recordLabel(componentCount)}</span>
                      </div>
                      {profileMatched && visibleProducts.length === 0 && (
                        <div className="search-result-card__profile-match">Matched company profile fields.</div>
                      )}
                      <div className="search-result-card__systems" aria-label={`Systems represented by ${company.firm_name}`}>
                        {systems.length === 0 ? (
                          <span>No linked systems yet</span>
                        ) : (
                          systems.map((value) => <SystemPill key={value} system={value} compact />)
                        )}
                      </div>
                      <AnimatePresence initial={false}>
                        {visibleProducts.length > 0 && (
                          <motion.div
                            className="search-result-card__components"
                            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0, y: -6 }}
                            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, height: "auto", y: 0 }}
                            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0, y: -4 }}
                            transition={{ duration: reduceMotion ? 0.01 : 0.22, ease: [0.2, 0.7, 0.2, 1] }}
                          >
                            <span className="search-result-card__section-label">Matched components</span>
                            <ul>
                              {visibleProducts.map((component) => {
                                const name = component.component_name || component.product_name || "Unnamed component";
                                return (
                                  <li key={`${company.firm_id}-${component.product_id ?? name}`}>
                                    <strong>{highlightText(name, keyword)}</strong>
                                    <span>{highlightText(`${component.system} / ${component.module}`, keyword)}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.article>
                );
              })}
              <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}