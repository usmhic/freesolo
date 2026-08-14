import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { PageHeader } from "../../_components/ui";
import { SwaggerExplorer } from "./_swagger-explorer";

export const dynamic = "force-dynamic";

export default async function AdminApiDocsPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title="API Docs"
          description="Interactive OpenAPI reference for the FreeSolo REST API — browse every endpoint, inspect request/response schemas, and try requests with your own session token."
        />
        <Link
          href="/api/openapi.json"
          target="_blank"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-fd-border bg-fd-background px-3 py-1.5 text-xs font-medium text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
        >
          Raw spec (openapi.json) <ExternalLink className="size-3.5" />
        </Link>
      </div>

      <p className="text-sm text-fd-muted-foreground">
        Looking for the traveler/host guide instead? That lives at{" "}
        <Link href="/docs" className="font-medium text-fd-foreground underline underline-offset-2">
          /docs
        </Link>{" "}
        — written in plain language for people using the app, not building on it.
      </p>

      <SwaggerExplorer />
    </div>
  );
}
