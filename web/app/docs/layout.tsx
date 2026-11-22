import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { EnglishOnly } from '@/components/site/english-only';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <EnglishOnly>
      <DocsLayout tree={source.getPageTree()} {...baseOptions()}>
        {children}
      </DocsLayout>
    </EnglishOnly>
  );
}
