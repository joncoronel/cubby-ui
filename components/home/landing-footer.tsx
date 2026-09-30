import Link from "next/link";
import { GET_STARTED_HREF, GITHUB_URL } from "./links";
import { Wordmark } from "./wordmark";

export function LandingFooter() {
  return (
    <footer className="mx-auto flex max-w-7xl flex-col gap-10 px-5 pt-16 pb-12 sm:flex-row sm:justify-between sm:px-10">
      <div className="max-w-xs">
        <Link href="/" className="text-foreground" aria-label="Cubby UI home">
          <Wordmark />
        </Link>
        <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
          React components with the details done. MIT licensed.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
        <FooterColumn
          title="Docs"
          links={[
            ["Introduction", GET_STARTED_HREF],
            ["Installation", "/docs/getting-started/installation"],
            ["Hooks", "/docs/hooks/use-fuzzy-filter"],
          ]}
        />
        <FooterColumn
          title="Components"
          links={[
            ["Text Morph", "/docs/components/text-morph"],
            ["Circular Slider", "/docs/components/circular-slider"],
            ["Tree", "/docs/components/tree"],
          ]}
        />
        <FooterColumn
          title="Project"
          links={[
            ["GitHub", GITHUB_URL],
            ["License", `${GITHUB_URL}/blob/main/LICENSE`],
          ]}
        />
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <p className="text-foreground font-medium">{title}</p>
      <ul className="mt-3 flex flex-col gap-2">
        {links.map(([label, href]) => (
          <li key={label}>
            {href.startsWith("http") ? (
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className="text-muted-foreground hover:text-foreground"
              >
                {label}
              </a>
            ) : (
              <Link
                href={href}
                className="text-muted-foreground hover:text-foreground"
              >
                {label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
