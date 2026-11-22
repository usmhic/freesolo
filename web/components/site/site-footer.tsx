import Link from "next/link";
import { FreeSoloLogo } from "@/components/logo";
import { getDictionary, getLang } from "@/lib/i18n/server";

export async function SiteFooter() {
  const t = (await getDictionary(await getLang())).footer;
  const columns = [
    {
      title: t.play,
      links: [
        ["/play", t.playCity], ["/sky", t.sky], ["/ranking", t.ranking], ["/trips", t.trips], ["/planner", t.planner],
      ],
    },
    { title: t.membership, links: [["/apply", t.apply], ["/apply/status", t.status], ["/sign-in", t.signIn]] },
    {
      title: t.help,
      links: [["/docs", t.helpCenter], ["/docs/play", t.howGame], ["/docs/trips", t.howTrips], ["/docs/hosting", t.hosting]],
    },
    {
      title: t.freesolo,
      links: [
        ["/privacy", t.privacy], ["/terms", t.terms], ["/docs/photo-credits", t.credits],
        ["https://github.com/usmhic/freesolo", t.openSource],
      ],
    },
  ];

  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="container-page grid gap-10 py-14 lg:grid-cols-[1.3fr_2fr]">
        <div className="max-w-sm">
          <FreeSoloLogo />
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">{t.tagline}</p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-ink">{col.title}</p>
              <ul className="mt-3 space-y-2.5">
                {col.links.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-ink-soft transition hover:text-sunset">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} FreeSolo. {t.madeFor}</p>
          <p>{t.maps}</p>
        </div>
      </div>
    </footer>
  );
}
