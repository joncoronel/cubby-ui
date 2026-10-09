"use client";

import * as React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  getPaginationRange,
} from "@/registry/default/pagination/pagination";

function Pager({
  pageCount,
  ...props
}: { pageCount: number } & Omit<
  React.ComponentProps<typeof PaginationContent>,
  "children"
>) {
  const [page, setPage] = React.useState(1);

  function go(next: number) {
    return (event: React.MouseEvent) => {
      event.preventDefault();
      setPage(Math.min(Math.max(1, next), pageCount));
    };
  }

  return (
    <Pagination>
      <PaginationContent {...props}>
        <PaginationItem>
          <PaginationPrevious
            href={`?page=${page - 1}`}
            isDisabled={page <= 1}
            onClick={go(page - 1)}
          />
        </PaginationItem>
        {getPaginationRange({ page, pageCount }).map((item) =>
          typeof item === "number" ? (
            <PaginationItem key={item}>
              <PaginationLink
                href={`?page=${item}`}
                isActive={item === page}
                onClick={go(item)}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationEllipsis />
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            href={`?page=${page + 1}`}
            isDisabled={page >= pageCount}
            onClick={go(page + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export default function PaginationDemo() {
  return <Pager pageCount={20} />;
}
