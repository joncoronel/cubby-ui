import { matchSorter } from "match-sorter";

type Ranking = (typeof matchSorter.rankings)[keyof typeof matchSorter.rankings];

export type FuzzyThreshold =
  | "case-sensitive-equal"
  | "equal"
  | "starts-with"
  | "word-starts-with"
  | "contains"
  | "acronym"
  | "matches";

const thresholdMap: Record<FuzzyThreshold, Ranking> = {
  "case-sensitive-equal": matchSorter.rankings.CASE_SENSITIVE_EQUAL,
  "equal": matchSorter.rankings.EQUAL,
  "starts-with": matchSorter.rankings.STARTS_WITH,
  "word-starts-with": matchSorter.rankings.WORD_STARTS_WITH,
  "contains": matchSorter.rankings.CONTAINS,
  "acronym": matchSorter.rankings.ACRONYM,
  "matches": matchSorter.rankings.MATCHES,
};

function resolveThreshold(threshold: FuzzyThreshold | undefined): Ranking | undefined {
  if (!threshold) return undefined;
  return thresholdMap[threshold];
}

export interface UseFuzzyFilterOptions {
  keys: Array<string | { key: string; threshold?: FuzzyThreshold }>;
  threshold?: FuzzyThreshold;
}

export function useFuzzyFilter<T>(options: UseFuzzyFilterOptions) {
  const resolvedThreshold = resolveThreshold(options.threshold);
  const resolvedKeys = options.keys.map((key) =>
    typeof key === "string"
      ? key
      : { key: key.key, threshold: resolveThreshold(key.threshold) },
  );

  const filter = (items: T[], query: string): T[] => {
    if (!query) {
      return items;
    }

    return matchSorter(items, query, {
      keys: resolvedKeys,
      threshold: resolvedThreshold,
    });
  };

  const filterItem = (item: T, query: string): boolean => {
    if (!query) {
      return true;
    }

    const results = matchSorter([item], query, {
      keys: resolvedKeys,
      threshold: resolvedThreshold,
    });

    return results.length > 0;
  };

  return { filter, filterItem };
}