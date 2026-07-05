import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}



function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Dupuis Immobilier · Agent immobilier à Reims" },
      { name: "description", content: "Estimation gratuite · Vente · Location · Gestion locative à Reims" },
      { name: "author", content: "Dupuis Immobilier" },
      { property: "og:title", content: "Dupuis Immobilier · Agent immobilier à Reims" },
      { property: "og:description", content: "Estimation gratuite · Vente · Location · Gestion locative à Reims" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@DupuisImmobilier" },
      { name: "twitter:title", content: "Dupuis Immobilier · Agent immobilier à Reims" },
      { name: "twitter:description", content: "Estimation gratuite · Vente · Location · Gestion locative à Reims" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/3zlMl33H2wbtn8F61T0zLipEWE72/social-images/social-1781127290457-Screenshot_2026-06-10_at_23-34-23_Dupuis_Immobilier_·_Agent_immobilier_à_Reims.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/3zlMl33H2wbtn8F61T0zLipEWE72/social-images/social-1781127290457-Screenshot_2026-06-10_at_23-34-23_Dupuis_Immobilier_·_Agent_immobilier_à_Reims.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap",
      },
    ],
    scripts: [
      { src: "https://www.googletagmanager.com/gtag/js?id=G-GE530MHKM6", async: true },
      {
        children:
          "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','G-GE530MHKM6',{send_page_view:false});",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.searchStr });

  // GA4 SPA page_view on route change
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    const path = pathname + (search ? `?${search}` : "");
    window.gtag("event", "page_view", {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, search]);

  // GA4 global click / submit tracking
  useEffect(() => {
    if (typeof window === "undefined") return;
    const send = (name: string, params: Record<string, unknown> = {}) => {
      window.gtag?.("event", name, params);
    };
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href") || "";
      const text = (anchor.textContent || "").trim().slice(0, 80);
      if (href.startsWith("mailto:")) send("click_email", { link_url: href, link_text: text });
      else if (href.startsWith("tel:")) send("click_phone", { link_url: href, link_text: text });
      else if (/wa\.me|whatsapp\.com/i.test(href)) send("click_whatsapp", { link_url: href, link_text: text });
      else if (/\/contact/i.test(href)) send("click_contact", { link_url: href, link_text: text });
      else if (/demo|démo/i.test(href) || /demo|démo/i.test(text)) send("click_demo", { link_url: href, link_text: text });
    };
    const onSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement | null;
      send("form_submit", {
        form_id: form?.id || undefined,
        form_name: form?.getAttribute("name") || undefined,
        form_location: window.location.pathname,
      });
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}


