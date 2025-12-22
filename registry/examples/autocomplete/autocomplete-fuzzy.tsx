import * as React from "react";
import {
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup,
  AutocompletePortal,
  AutocompletePositioner,
  AutocompleteRoot,
  AutocompleteValue,
} from "@/registry/default/autocomplete/autocomplete";
import { useFuzzyFilter } from "@/registry/default/autocomplete/hooks/use-fuzzy-filter";
import { highlightText } from "@/registry/default/autocomplete/lib/highlight-text";
import { Label } from "@/registry/default/label/label";

interface Documentation {
  title: string;
  description: string;
  category: string;
}

const documentationItems: Documentation[] = [
  {
    title: "React Hooks Guide",
    description:
      "Learn how to use React Hooks like useState, useEffect, and custom hooks",
    category: "React",
  },
  {
    title: "JavaScript Array Methods",
    description:
      "Master array methods like map, filter, reduce, and forEach in JavaScript",
    category: "JavaScript",
  },
  {
    title: "CSS Flexbox Layout",
    description: "Complete guide to CSS Flexbox for responsive web design",
    category: "CSS",
  },
  {
    title: "TypeScript Interfaces",
    description: "Understanding TypeScript interfaces and type definitions",
    category: "TypeScript",
  },
  {
    title: "React Performance Optimization",
    description:
      "Tips and techniques for optimizing React application performance",
    category: "React",
  },
  {
    title: "HTML Semantic Elements",
    description:
      "Using semantic HTML elements for better accessibility and SEO",
    category: "HTML",
  },
  {
    title: "Node.js Express Server",
    description: "Building RESTful APIs with Node.js and Express framework",
    category: "Node.js",
  },
  {
    title: "Vue Composition API",
    description: "Modern Vue.js development using the Composition API",
    category: "Vue.js",
  },
  {
    title: "Angular Components",
    description: "Creating reusable Angular components with TypeScript",
    category: "Angular",
  },
  {
    title: "Python Django Framework",
    description: "Web development with Python Django framework",
    category: "Python",
  },
  {
    title: "CSS Grid Layout",
    description: "Advanced CSS Grid techniques for complex layouts",
    category: "CSS",
  },
  {
    title: "React Testing Library",
    description: "Testing React components with React Testing Library",
    category: "React",
  },
  {
    title: "MongoDB Queries",
    description: "Advanced MongoDB queries and aggregation pipelines",
    category: "Database",
  },
  {
    title: "Webpack Configuration",
    description: "Optimizing Webpack configuration for production builds",
    category: "Build Tools",
  },
  {
    title: "SASS/SCSS Guide",
    description: "Writing maintainable CSS with SASS and SCSS",
    category: "CSS",
  },
];

export default function AutocompleteFuzzy() {
  const { filterItem } = useFuzzyFilter<Documentation>({
    keys: [
      { key: "title", threshold: "contains" },
      { key: "description", threshold: "word-starts-with" },
      "category",
    ],
  });

  return (
    <AutocompleteRoot
      items={documentationItems}
      filter={filterItem}
      itemToStringValue={(item) => item.title}
    >
      <Label className="w-full max-w-xs">
        Fuzzy search documentation
        <AutocompleteInput placeholder="e.g. React, hooks, css grid" />
      </Label>

      <AutocompletePortal>
        <AutocompletePositioner sideOffset={4}>
          <AutocompletePopup>
            <AutocompleteEmpty>
              No results found for "<AutocompleteValue />"
            </AutocompleteEmpty>

            <AutocompleteList>
              {(item: Documentation) => (
                <AutocompleteItem key={item.title} value={item}>
                  <AutocompleteValue>
                    {(value) => (
                      <div className="flex w-full flex-col gap-1">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 leading-5 font-medium">
                            {highlightText(item.title, value)}
                          </div>
                          <span className="text-muted-foreground bg-muted rounded px-2 py-1 text-xs">
                            {item.category}
                          </span>
                        </div>
                        <div className="text-muted-foreground text-sm leading-5">
                          {highlightText(item.description, value)}
                        </div>
                      </div>
                    )}
                  </AutocompleteValue>
                </AutocompleteItem>
              )}
            </AutocompleteList>
          </AutocompletePopup>
        </AutocompletePositioner>
      </AutocompletePortal>
    </AutocompleteRoot>
  );
}
