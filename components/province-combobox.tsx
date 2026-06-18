"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { provinceChoices, suggestProvinceChoices, type ProvinceChoice } from "@/lib/schema";
import { Input } from "./ui";

export function ProvinceCombobox({
  value,
  onChange,
  allLabel,
  id
}: {
  value: string;
  onChange: (value: string) => void;
  allLabel?: string;
  id?: string;
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listId = `${inputId}-options`;
  const options = useMemo(() => provinceChoices(allLabel), [allLabel]);
  const selectedLabel = options.find((option) => option.value === value)?.label ?? value;
  const [query, setQuery] = useState(selectedLabel);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => setQuery(selectedLabel), [selectedLabel]);

  const suggestions = useMemo(() => {
    return suggestProvinceChoices(options, query, selectedLabel);
  }, [options, query, selectedLabel]);

  function choose(option: ProvinceChoice) {
    onChange(option.value);
    setQuery(option.label);
    setOpen(false);
    setActiveIndex(0);
  }

  function restoreOrChooseExact() {
    const exact = suggestProvinceChoices(options, query, selectedLabel).find(
      (option) => option.label.localeCompare(query, undefined, { sensitivity: "base" }) === 0
    );
    if (exact) choose(exact);
    else setQuery(selectedLabel);
  }

  return (
    <div
      className="province-combobox"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          restoreOrChooseExact();
          setOpen(false);
        }
      }}
    >
      <Input
        id={inputId}
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={open}
        aria-activedescendant={open ? `${listId}-${activeIndex}` : undefined}
        autoComplete="off"
        value={query}
        onFocus={(event) => {
          setOpen(true);
          setActiveIndex(0);
          event.currentTarget.select();
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setActiveIndex(0);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((index) => open ? Math.min(index + 1, suggestions.length - 1) : 0);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((index) => Math.max(index - 1, 0));
          } else if (event.key === "Enter" && open && suggestions[activeIndex]) {
            event.preventDefault();
            choose(suggestions[activeIndex]);
          } else if (event.key === "Escape") {
            setQuery(selectedLabel);
            setOpen(false);
          }
        }}
      />
      <ChevronDown className="province-combobox__chevron" size={16} aria-hidden="true" />
      {open && suggestions.length > 0 && (
        <div id={listId} className="province-combobox__options" role="listbox" aria-label="Province suggestions">
          {suggestions.map((option, index) => (
            <button
              id={`${listId}-${index}`}
              key={option.value || "all"}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className="province-combobox__option"
              data-active={index === activeIndex}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(option)}
            >
              <span>{option.label}</span>
              {option.value === value && <Check size={15} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
