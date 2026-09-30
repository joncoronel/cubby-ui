/**
 * The landing's destinations, in a plain module so server pages and client
 * components share one copy (a constant imported from a "use client" file
 * reaches a server component as a client reference, not the value).
 */
export const GITHUB_URL = "https://github.com/joncoronel/cubby-ui";
export const GET_STARTED_HREF = "/docs/getting-started/introduction";
/** There's no components index; browsing starts at the flagship piece. */
export const BROWSE_HREF = "/docs/components/text-morph";
