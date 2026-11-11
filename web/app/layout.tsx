import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import { cn } from '@/lib/cn';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  applicationName: 'FreeSolo',
  title: {
    default: 'FreeSolo — small-group trips for solo travelers',
    template: '%s | FreeSolo',
  },
  description:
    'Join small, vetted groups of solo travelers on trips hosted by members — and plan your own route on the map.',
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

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={cn(display.variable, body.variable, 'font-sans')} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
