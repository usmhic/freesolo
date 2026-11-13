import { getSession } from "@/lib/auth";
import { HeaderBar } from "./header-bar";

/** Server wrapper: reads the session cookie so the header knows who's signed in. */
export async function SiteHeader() {
  const session = await getSession();
  return (
    <HeaderBar
      user={session ? { name: session.name ?? session.email, email: session.email, role: session.role } : null}
    />
  );
}
