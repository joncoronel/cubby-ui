"use client";

import * as React from "react";
import {
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup,
  AutocompletePortal,
  AutocompletePositioner,
  AutocompleteRoot,
  AutocompleteStatus,
  Autocomplete,
} from "@/registry/default/autocomplete/autocomplete";
import { Label } from "@/registry/default/label/label";

interface Movie {
  id: string;
  title: string;
  year: number;
}

const top100Movies: Movie[] = [
  { id: "1", title: "The Shawshank Redemption", year: 1994 },
  { id: "2", title: "The Godfather", year: 1972 },
  { id: "3", title: "The Dark Knight", year: 2008 },
  { id: "4", title: "The Godfather Part II", year: 1974 },
  { id: "5", title: "12 Angry Men", year: 1957 },
  {
    id: "6",
    title: "The Lord of the Rings: The Return of the King",
    year: 2003,
  },
  { id: "7", title: "Schindler's List", year: 1993 },
  { id: "8", title: "Pulp Fiction", year: 1994 },
  {
    id: "9",
    title: "The Lord of the Rings: The Fellowship of the Ring",
    year: 2001,
  },
  { id: "10", title: "The Good, the Bad and the Ugly", year: 1966 },
  { id: "11", title: "Forrest Gump", year: 1994 },
  { id: "12", title: "The Lord of the Rings: The Two Towers", year: 2002 },
  { id: "13", title: "Fight Club", year: 1999 },
  { id: "14", title: "Inception", year: 2010 },
  {
    id: "15",
    title: "Star Wars: Episode V – The Empire Strikes Back",
    year: 1980,
  },
  { id: "16", title: "The Matrix", year: 1999 },
  { id: "17", title: "Goodfellas", year: 1990 },
  { id: "18", title: "Interstellar", year: 2014 },
  { id: "19", title: "One Flew Over the Cuckoo's Nest", year: 1975 },
  { id: "20", title: "Se7en", year: 1995 },
  { id: "21", title: "It's a Wonderful Life", year: 1946 },
  { id: "22", title: "The Silence of the Lambs", year: 1991 },
  { id: "23", title: "Seven Samurai", year: 1954 },
  { id: "24", title: "Saving Private Ryan", year: 1998 },
  { id: "25", title: "City of God", year: 2002 },
  { id: "26", title: "Life Is Beautiful", year: 1997 },
  { id: "27", title: "The Green Mile", year: 1999 },
  { id: "28", title: "Star Wars: Episode IV – A New Hope", year: 1977 },
  { id: "29", title: "Terminator 2: Judgment Day", year: 1991 },
  { id: "30", title: "Back to the Future", year: 1985 },
];

async function searchMovies(
  query: string,
  filter: (item: string, query: string) => boolean,
): Promise<Movie[]> {
  // Simulate network delay
  await new Promise((resolve) => {
    setTimeout(resolve, Math.random() * 500 + 100);
  });

  // Simulate occasional network errors (1% chance)
  if (Math.random() < 0.01 || query === "will_error") {
    throw new Error("Network error");
  }

  return top100Movies.filter(
    (movie) =>
      filter(movie.title, query) || filter(movie.year.toString(), query),
  );
}

export default function AutocompleteAsync() {
  const [searchValue, setSearchValue] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<Movie[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const { contains } = Autocomplete.useFilter({ sensitivity: "base" });

  React.useEffect(() => {
    if (!searchValue) {
      setSearchResults([]);
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);
    setError(null);

    let ignore = false;

    async function fetchMovies() {
      try {
        const results = await searchMovies(searchValue, contains);
        if (!ignore) {
          setSearchResults(results);
        }
      } catch (err) {
        if (!ignore) {
          setError("Failed to fetch movies. Please try again.");
          setSearchResults([]);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    const timeoutId = setTimeout(fetchMovies, 300);

    return () => {
      clearTimeout(timeoutId);
      ignore = true;
    };
  }, [searchValue, contains]);

  let status: React.ReactNode = `${searchResults.length} result${searchResults.length === 1 ? "" : "s"} found`;
  if (isLoading) {
    status = (
      <div className="flex items-center gap-2">
        <div
          className="border-muted-foreground border-t-foreground h-4 w-4 animate-spin rounded-full border-2"
          aria-hidden
        />
        Searching...
      </div>
    );
  } else if (error) {
    status = error;
  } else if (searchResults.length === 0 && searchValue) {
    status = `Movie or year "${searchValue}" does not exist in the Top 30 IMDb movies`;
  }

  const shouldRenderPopup = searchValue !== "";

  return (
    <AutocompleteRoot
      items={searchResults}
      value={searchValue}
      onValueChange={setSearchValue}
      itemToStringValue={(item) => item.title}
      filter={null}
    >
      <Label className="w-full max-w-xs">
        Search movies by name or year
        <AutocompleteInput placeholder="e.g. Pulp Fiction or 1994" />
      </Label>

      {shouldRenderPopup && (
        <AutocompletePortal>
          <AutocompletePositioner align="start">
            <AutocompletePopup aria-busy={isLoading || undefined}>
              <AutocompleteStatus className="flex items-center gap-2">
                {status}
              </AutocompleteStatus>
              <AutocompleteList>
                {(movie: Movie) => (
                  <AutocompleteItem key={movie.id} value={movie}>
                    <div className="flex w-full flex-col gap-1">
                      <div className="leading-5 font-medium">{movie.title}</div>
                      <div className="text-muted-foreground text-sm leading-4">
                        {movie.year}
                      </div>
                    </div>
                  </AutocompleteItem>
                )}
              </AutocompleteList>
            </AutocompletePopup>
          </AutocompletePositioner>
        </AutocompletePortal>
      )}
    </AutocompleteRoot>
  );
}
