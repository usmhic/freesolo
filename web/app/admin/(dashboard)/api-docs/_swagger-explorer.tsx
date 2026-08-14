"use client";

import { useEffect, useRef, useState } from "react";

const CSS_HREF = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css";
const BUNDLE_SRC = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js";

declare global {
  interface Window {
    SwaggerUIBundle?: any;
  }
}

function loadStylesheet(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if (window.SwaggerUIBundle) return resolve();
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)));
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

export function SwaggerExplorer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    loadStylesheet(CSS_HREF);
    loadScript(BUNDLE_SRC)
      .then(() => {
        if (cancelled || !containerRef.current || !window.SwaggerUIBundle) return;
        window.SwaggerUIBundle({
          url: "/api/openapi.json",
          domNode: containerRef.current,
          deepLinking: true,
          presets: [window.SwaggerUIBundle.presets.apis],
          layout: "BaseLayout",
          docExpansion: "list",
          defaultModelsExpandDepth: 1,
          tryItOutEnabled: true,
        });
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="swagger-explorer-root overflow-hidden rounded-xl border border-fd-border bg-fd-card">
      {status === "loading" && (
        <p className="p-6 text-sm text-fd-muted-foreground">Loading the interactive explorer…</p>
      )}
      {status === "error" && (
        <p className="p-6 text-sm text-red-600">
          Couldn&apos;t load Swagger UI from the CDN. Check your connection and refresh — or open{" "}
          <a href="/api/openapi.json" className="underline" target="_blank" rel="noreferrer">
            /api/openapi.json
          </a>{" "}
          directly.
        </p>
      )}
      <div ref={containerRef} className="swagger-explorer" />
      <style jsx global>{`
        /* Let this page's content span the full dashboard width instead of
           the shared admin layout's centered max-w-6xl column. */
        main:has(.swagger-explorer-root) > div {
          max-width: none;
        }

        .swagger-explorer .topbar {
          display: none;
        }
        .swagger-explorer .swagger-ui {
          font-family: inherit;
          color: var(--color-fd-foreground);
        }
        .swagger-explorer .swagger-ui .info {
          margin: 24px 0;
        }

        /* Re-theme Swagger UI's surfaces to track the site's fd-* palette,
           which already swaps values under the .dark class — so these rules
           work for both light and dark without duplicating them. */
        .swagger-explorer .swagger-ui,
        .swagger-explorer .swagger-ui .scheme-container {
          background: transparent;
        }
        .swagger-explorer .swagger-ui .scheme-container {
          box-shadow: none;
          border-bottom: 1px solid var(--color-fd-border);
        }
        .swagger-explorer .swagger-ui .info .title,
        .swagger-explorer .swagger-ui .info li,
        .swagger-explorer .swagger-ui .info p,
        .swagger-explorer .swagger-ui .info table,
        .swagger-explorer .swagger-ui .opblock-tag,
        .swagger-explorer .swagger-ui .opblock .opblock-summary-operation-id,
        .swagger-explorer .swagger-ui .opblock .opblock-summary-path,
        .swagger-explorer .swagger-ui .opblock-description-wrapper p,
        .swagger-explorer .swagger-ui .opblock-external-docs-wrapper p,
        .swagger-explorer .swagger-ui .opblock-title_normal,
        .swagger-explorer .swagger-ui .tab li,
        .swagger-explorer .swagger-ui table thead tr td,
        .swagger-explorer .swagger-ui table thead tr th,
        .swagger-explorer .swagger-ui .parameter__name,
        .swagger-explorer .swagger-ui .parameter__type,
        .swagger-explorer .swagger-ui .parameter__in,
        .swagger-explorer .swagger-ui .parameter__deprecated,
        .swagger-explorer .swagger-ui .response-col_status,
        .swagger-explorer .swagger-ui .response-col_links,
        .swagger-explorer .swagger-ui .responses-inner h4,
        .swagger-explorer .swagger-ui .responses-inner h5,
        .swagger-explorer .swagger-ui .opblock-section-header h4,
        .swagger-explorer .swagger-ui .opblock-section-header > label,
        .swagger-explorer .swagger-ui .renderedMarkdown p,
        .swagger-explorer .swagger-ui .model-title,
        .swagger-explorer .swagger-ui .model,
        .swagger-explorer .swagger-ui .model-toggle,
        .swagger-explorer .swagger-ui section.models h4,
        .swagger-explorer .swagger-ui section.models .model-container,
        .swagger-explorer .swagger-ui .prop-type,
        .swagger-explorer .swagger-ui .prop-format,
        .swagger-explorer .swagger-ui label {
          color: var(--color-fd-foreground);
        }
        .swagger-explorer .swagger-ui .opblock-summary-description,
        .swagger-explorer .swagger-ui .muted-note,
        .swagger-explorer .swagger-ui .response-col_description__inner div.markdown p,
        .swagger-explorer .swagger-ui table.model tr.description-col,
        .swagger-explorer .swagger-ui .opblock-tag small {
          color: var(--color-fd-muted-foreground);
        }

        .swagger-explorer .swagger-ui .opblock-tag,
        .swagger-explorer .swagger-ui table thead tr td,
        .swagger-explorer .swagger-ui table thead tr th,
        .swagger-explorer .swagger-ui .opblock,
        .swagger-explorer .swagger-ui .opblock .opblock-summary,
        .swagger-explorer .swagger-ui .tab,
        .swagger-explorer .swagger-ui section.models,
        .swagger-explorer .swagger-ui section.models.is-open h4 {
          border-color: var(--color-fd-border);
        }
        .swagger-explorer .swagger-ui .opblock {
          background: var(--color-fd-card);
        }
        .swagger-explorer .swagger-ui .opblock .opblock-section-header {
          background: transparent;
          box-shadow: none;
          border-bottom: 1px solid var(--color-fd-border);
        }
        .swagger-explorer .swagger-ui section.models {
          background: var(--color-fd-card);
        }
        .swagger-explorer .swagger-ui .model-box {
          background: var(--color-fd-secondary);
        }
        .swagger-explorer .swagger-ui .model-box-control,
        .swagger-explorer .swagger-ui .models-control {
          color: var(--color-fd-foreground);
        }
        .swagger-explorer .swagger-ui input[type="text"],
        .swagger-explorer .swagger-ui input[type="password"],
        .swagger-explorer .swagger-ui input[type="search"],
        .swagger-explorer .swagger-ui input[type="email"],
        .swagger-explorer .swagger-ui textarea,
        .swagger-explorer .swagger-ui select {
          background: var(--color-fd-background);
          color: var(--color-fd-foreground);
          border: 1px solid var(--color-fd-border);
        }
        .swagger-explorer .swagger-ui .btn {
          color: var(--color-fd-foreground);
          border-color: var(--color-fd-border);
          background: var(--color-fd-secondary);
        }
        .swagger-explorer .swagger-ui .btn.authorize,
        .swagger-explorer .swagger-ui .btn.execute {
          background: var(--color-fd-primary);
          color: var(--color-fd-primary-foreground);
          border-color: var(--color-fd-primary);
        }
        .swagger-explorer .swagger-ui .btn.authorize svg {
          fill: var(--color-fd-primary-foreground);
        }
        .swagger-explorer .swagger-ui .opblock-body pre.microlight,
        .swagger-explorer .swagger-ui .highlight-code,
        .swagger-explorer .swagger-ui .responses-inner .response-col_description pre,
        .swagger-explorer .swagger-ui .copy-to-clipboard {
          background: var(--color-fd-secondary) !important;
          color: var(--color-fd-foreground);
        }
        .swagger-explorer .swagger-ui .dialog-ux .modal-ux,
        .swagger-explorer .swagger-ui .dialog-ux .modal-ux-header,
        .swagger-explorer .swagger-ui .dialog-ux .modal-ux-content,
        .swagger-explorer .swagger-ui .dialog-ux .modal-ux-content h4,
        .swagger-explorer .swagger-ui .dialog-ux .modal-ux-content p,
        .swagger-explorer .swagger-ui .dialog-ux .modal-ux-content label {
          background: var(--color-fd-card);
          border-color: var(--color-fd-border);
          color: var(--color-fd-foreground);
        }
        .swagger-explorer .swagger-ui .dialog-ux .backdrop-ux {
          background: var(--color-fd-overlay);
        }
      `}</style>
    </div>
  );
}
