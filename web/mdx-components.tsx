import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import type { MDXComponents } from 'mdx/types';
import {
  BadgeCheck,
  Bell,
  CalendarCheck,
  Camera,
  Compass,
  CreditCard,
  Heart,
  HelpCircle,
  MapPin,
  MessagesSquare,
  PenLine,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Ticket,
  UserRound,
  Users,
  Utensils,
} from 'lucide-react';

/**
 * MDX surface for the Help Center.
 *
 * The lucide icons are registered as components so a page can write
 * `icon={<Compass />}` on a <Card> without importing anything itself — MDX
 * files stay plain prose plus components.
 */
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Step,
    Steps,
    Tab,
    Tabs,
    Accordion,
    Accordions,
    // Icons available to any .mdx page
    BadgeCheck,
    Bell,
    CalendarCheck,
    Camera,
    Compass,
    CreditCard,
    Heart,
    HelpCircle,
    MapPin,
    MessagesSquare,
    PenLine,
    Search,
    Send,
    ShieldCheck,
    Sparkles,
    Star,
    Ticket,
    UserRound,
    Users,
    Utensils,
    ...components,
  };
}
