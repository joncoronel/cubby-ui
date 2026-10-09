"use client";

import * as React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationStatus,
} from "@/registry/default/pagination/pagination";

const PAGE_COUNT = 12;

export default function PaginationCompact() {
  const [page, setPage] = React.useState(1);

  function go(next: number) {
    return (event: React.MouseEvent) => {
      event.preventDefault();
      setPage(Math.min(Math.max(1, next), PAGE_COUNT));
    };
  }

  return (
    <Pagination>
      <PaginationContent className="[--radius:9999px]">
        <PaginationItem>
          <PaginationPrevious
            href={`?page=${page - 1}`}
            isDisabled={page <= 1}
            onClick={go(page - 1)}
          />
        </PaginationItem>
        {/* Room for "Page 12 of 12", so Next doesn't shift as it grows. */}
        <PaginationStatus className="min-w-28">
          Page {page} of {PAGE_COUNT}
        </PaginationStatus>
        <PaginationItem>
          <PaginationNext
            href={`?page=${page + 1}`}
            isDisabled={page >= PAGE_COUNT}
            onClick={go(page + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
