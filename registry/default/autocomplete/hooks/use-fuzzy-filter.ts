import { matchSorter } from "match-sorter";

type RankingValue = (typeof matchSorter.rankings)[keyof typeof matchSorter.rankings];

export interface UseFuzzyFilterOptions {
  keys: Array<string | { key: string; threshold?: RankingValue }>;
  threshold?: RankingValue;
}

export function useFuzzyFilter<T>(options: UseFuzzyFilterOptions) {
  const filter = (items: T[], query: string): T[] => {
    if (!query) {
      return items;
    }

    return matchSorter(items, query, {
      keys: options.keys,
      threshold: options.threshold,
    });
  };

  const filterItem = (item: T, query: string): boolean => {
    if (!query) {
      return true;
    }

    const results = matchSorter([item], query, {
      keys: options.keys,
      threshold: options.threshold,
    });

    return results.length > 0;
  };

  return { filter, filterItem };
}

// Export rankings separately to avoid circular reference
export const fuzzyRankings = matchSorter.rankings;