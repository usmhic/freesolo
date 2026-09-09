import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — FreeSolo",
  description: "How FreeSolo collects, uses, and protects your information.",
};

const LAST_UPDATED = "June 6, 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-fd-muted-foreground">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="mb-12 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
        <p className="text-sm text-fd-muted-foreground">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="space-y-10">
        <Section title="1. Overview">
          <p>
            This Privacy Policy explains how FreeSolo (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or
            &ldquo;our&rdquo;) collects, uses, and shares information when you use our mobile
            app, website, and API (collectively, the &ldquo;Service&rdquo;). By using the
            Service, you agree to the collection and use of information in accordance with this
            policy.
          </p>
        </Section>

        <Section title="2. Information we collect">
          <p>We collect information you provide directly, such as when you:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Create an account (name, email address, profile photo, bio)</li>
            <li>Apply to join as a traveler, host, or business</li>
            <li>Book or list an experience (booking details, party size, guest notes)</li>
            <li>Communicate with us or other users (messages, reviews, support requests)</li>
          </ul>
          <p>We also collect certain information automatically, including:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Device information (device type, operating system, push notification tokens)</li>
            <li>Usage data (pages viewed, features used, approximate location at time of booking)</li>
            <li>Log data (IP address, access times, app version)</li>
          </ul>
        </Section>

        <Section title="3. How we use your information">
          <p>We use the information we collect to:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Operate, maintain, and improve the Service</li>
            <li>Process and manage bookings</li>
            <li>Verify applications from prospective hosts and businesses</li>
            <li>Send booking confirmations, reminders, and other transactional notifications</li>
            <li>Respond to support requests and resolve disputes</li>
            <li>Detect, prevent, and address fraud, abuse, and security issues</li>
          </ul>
        </Section>

        <Section title="4. How we share your information">
          <p>We do not sell your personal information. We may share information with:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <span className="font-medium text-fd-foreground">Hosts and businesses</span> — when
              you book an experience, the host receives the details necessary to fulfil your
              booking (name, party size, contact information)
            </li>
            <li>
              <span className="font-medium text-fd-foreground">Service providers</span> — including
              our hosting, storage, and email/push notification providers
            </li>
            <li>
              <span className="font-medium text-fd-foreground">Legal authorities</span> — where
              required to comply with applicable law, regulation, or legal process
            </li>
          </ul>
        </Section>

        <Section title="5. Data retention">
          <p>
            We retain personal information for as long as your account is active or as needed to
            provide the Service, comply with legal obligations, resolve disputes, and enforce our
            agreements. You may request deletion of your account at any time by contacting us.
          </p>
        </Section>

        <Section title="6. Your rights">
          <p>Depending on where you live, you may have the right to:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Access, correct, or delete the personal information we hold about you</li>
            <li>Object to or restrict certain processing of your information</li>
            <li>Receive a copy of your information in a portable format</li>
            <li>Withdraw consent where processing is based on consent</li>
          </ul>
          <p>To exercise any of these rights, contact us using the details below.</p>
        </Section>

        <Section title="7. Security">
          <p>
            We use reasonable administrative, technical, and physical safeguards designed to
            protect your information. No method of transmission or storage is completely secure,
            so we cannot guarantee absolute security.
          </p>
        </Section>

        <Section title="8. Children's privacy">
          <p>
            The Service is not directed to individuals under the age of 18, and we do not
            knowingly collect personal information from children. If you believe a child has
            provided us with personal information, please contact us so we can remove it.
          </p>
        </Section>

        <Section title="9. Changes to this policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material
            changes by posting the new policy on this page and updating the &ldquo;Last
            updated&rdquo; date above.
          </p>
        </Section>

        <Section title="10. Contact us">
          <p>
            If you have questions about this Privacy Policy or how we handle your information,
            contact us at{" "}
            <a href="mailto:privacy@freesolo.app" className="font-medium text-fd-foreground underline underline-offset-4">
              privacy@freesolo.app
            </a>
            .
          </p>
        </Section>
      </div>
    </div>
  );
}
