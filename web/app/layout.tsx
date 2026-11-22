import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Plus_Jakarta_Sans, Inter, IBM_Plex_Sans_Arabic } from 'next/font/google';
import { cn } from '@/lib/cn';
import type { Metadata } from 'next';
import { isRtl } from '@/lib/i18n/config';
import { I18nProvider } from '@/lib/i18n/client';
import { getDictionary, getLang } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary(await getLang());
  return { ...metadata, title: { default: t.meta.title, template: '%s | FreeSolo' }, description: t.meta.description };
}

const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  applicationName: 'FreeSolo',
  authors: [{ name: 'usmhic', url: 'https://github.com/usmhic' }],
  creator: 'usmhic',
  publisher: 'usmhic',
  icons: {
    icon: [{ url: '/icon-16.png', sizes: '16x16' }, { url: '/icon-32.png', sizes: '32x32' }],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: { images: [{ url: '/social-card.png', width: 1200, height: 630, alt: 'FreeSolo' }] },
  twitter: { card: 'summary_large_image', images: ['/social-card.png'] },
};

// Geometric display face to echo the rounded "f" of the logo; Inter for
// long-form reading and dense UI.
const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700', '800'],
});

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

// Arabic pages switch both faces to this (see global.css).
const arabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-arabic',
  weight: ['400', '500', '600', '700'],
});

export default async function Layout({ children }: LayoutProps<'/'>) {
  const lang = await getLang();
  const dict = await getDictionary(lang);
  return (
    <html
      lang={lang}
      dir={isRtl(lang) ? 'rtl' : 'ltr'}
      className={cn(display.variable, body.variable, arabic.variable, 'font-sans')}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen">
        <I18nProvider lang={lang} dict={dict}>
          <RootProvider dir={isRtl(lang) ? 'rtl' : 'ltr'}>{children}</RootProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
