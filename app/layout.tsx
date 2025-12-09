import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Rubik } from "next/font/google";
import "./globals.css";

import { RootProvider } from "fumadocs-ui/provider/next";
import { Providers } from "@/components/providers/providers";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cubby-ui.dev"),
  title: {
    default: "Cubby UI",
    template: "%s | Cubby UI",
  },
  description:
    "A modern UI component library built with React, Tailwind CSS, and Base UI. Beautiful, accessible components for your next project.",
  openGraph: {
    title: "Cubby UI",
    description:
      "A modern UI component library built with React, Tailwind CSS, and Base UI.",
    siteName: "Cubby UI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cubby UI",
    description:
      "A modern UI component library built with React, Tailwind CSS, and Base UI.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/cubby-ui-logo-favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
};

// export const viewport: Viewport = {
//   colorScheme: "light dark",
//   themeColor: [
//     { media: "(prefers-color-scheme: light)", color: "#ffffff" },
//     { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
//   ],
// };

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${rubik.variable} font-sans antialiased`}
        // className={`${geistSans.variable} ${geistMono.variable} ${rubik.variable} flex min-h-screen max-w-full flex-col font-sans antialiased`}
      >
        <Providers>
          <RootProvider>
            <div className="root bg-background" data-vaul-drawer-wrapper>
              {children}
            </div>
          </RootProvider>
        </Providers>
      </body>
    </html>
  );
}
