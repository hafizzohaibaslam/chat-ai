"use client";

import { useState } from "react";
import { MultiSelect } from "react-multi-select-component";

// Fallback default options
const defaultLegislationOptions = [
  {
    label: "A NEW TAX SYSTEM (LUXURY CAR TAX)",
    value: "a-new-tax-system-luxury-car-tax",
  },
  {
    label: "A NEW TAX SYSTEM (TAX ADMINISTRATION)",
    value: "a-new-tax-system-tax-admin",
  },
  { label: "ABORIGINAL AFFAIRS", value: "aboriginal-affairs" },
  {
    label: "ABORIGINAL COMMUNITIES ACT 1979",
    value: "aboriginal-communities-act-1979",
  },
  // ...add more items as needed
];

export default function MultiSelectComponent({
  data = [],
  setSelectedLegislation,
  selectedLegislation,
}: {
  data: any[];
  setSelectedLegislation: (legislation: string) => void;
  selectedLegislation: string;
}) {
  const [selected, setSelected] = useState([]);

  console.log("data", data);

  // Use provided data if available; otherwise fallback to default options
  const options =
    Array.isArray(data) && data.length > 0
      ? data.map((item: { title: string; source_url: string }) => ({
          label: item.title,
          value: item.source_url,
        }))
      : defaultLegislationOptions;

  return (
    <div className="space-y-2">
      <MultiSelect
        options={options}
        value={selectedLegislation}
        onChange={setSelectedLegislation}
        labelledBy="Select Legislation"
        overrideStrings={{
          selectSomeItems: "Select Legislation",
          allItemsAreSelected: "All selected",
          selectAll: "Select All",
          search: "Search Legislation...",
        }}
        className="bg-card border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black hover:bg-gray-50 transition-colors"
      />
    </div>
  );
}
