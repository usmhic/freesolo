import { SiteHeader } from "@/components/site/site-header";

/** Full-height app screens (the planner): the site header, no footer. */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex flex-1 flex-col">
        {children}
      </main>
    </>
  );
}
