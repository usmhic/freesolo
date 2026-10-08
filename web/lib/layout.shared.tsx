import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { FreeSoloLogo } from '@/components/logo';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <FreeSoloLogo />,
    },
    themeSwitch: {
      enabled: true,
      mode: 'light-dark-system',
    },
    links: [
      { text: 'Trips', url: '/trips', active: 'nested-url' },
      { text: 'Docs', url: '/docs', active: 'nested-url' },
      { text: 'Privacy', url: '/privacy' },
      { text: 'Terms', url: '/terms' },
    ],
  };
}
