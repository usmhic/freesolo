import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import { cn } from '@/lib/cn';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  applicationName: 'FreeSolo',
  title: {
    default: 'FreeSolo - curated solo-travel experiences',
    template: '%s | FreeSolo',
  },
  description:
    'Discover and book curated experiences built for independent travelers and local hosts.',
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

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
});

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={cn(playfair.variable, dmSans.variable, 'font-sans')} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
