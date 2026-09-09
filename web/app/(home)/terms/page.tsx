import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — FreeSolo",
  description: "The terms and conditions that govern your use of FreeSolo.",
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

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="mb-12 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Terms of Service</h1>
        <p className="text-sm text-fd-muted-foreground">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="space-y-10">
        <Section title="1. Acceptance of terms">
          <p>
            By creating an account or otherwise using FreeSolo&rsquo;s mobile app, website, or API
            (collectively, the &ldquo;Service&rdquo;), you agree to be bound by these Terms of
            Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, do not use the
            Service.
          </p>
        </Section>

        <Section title="2. Eligibility & accounts">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>You must be at least 18 years old to create an account or book an experience.</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.</li>
            <li>Hosts and businesses must be approved through our application process before listing experiences.</li>
            <li>You agree to provide accurate, current information and to keep it up to date.</li>
          </ul>
        </Section>

        <Section title="3. Bookings & cancellations">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Booking an experience reserves a seat subject to the host&rsquo;s availability and the details shown at checkout.</li>
            <li>Cancellation terms are set per experience and shown before you confirm a booking.</li>
            <li>Hosts may cancel an experience (e.g. for low attendance or unforeseen circumstances); affected travelers will be notified.</li>
            <li>FreeSolo is a platform connecting travelers and hosts — we are not the operator of any experience and are not responsible for how a host conducts it.</li>
          </ul>
        </Section>

        <Section title="4. User conduct">
          <p>You agree not to:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Violate any applicable law or the rights of others</li>
            <li>Post false, misleading, or fraudulent listings, reviews, or content</li>
            <li>Harass, threaten, or discriminate against other users</li>
            <li>Attempt to circumvent the Service to transact outside the platform</li>
            <li>Interfere with or disrupt the integrity or performance of the Service</li>
          </ul>
          <p>
            We may suspend or terminate accounts that violate these Terms, at our discretion,
            with or without notice.
          </p>
        </Section>

        <Section title="5. Reviews & content">
          <p>
            By submitting reviews, photos, or other content (&ldquo;User Content&rdquo;), you
            grant FreeSolo a non-exclusive, worldwide, royalty-free license to use, display, and
            distribute that content in connection with operating and promoting the Service. You
            are solely responsible for the accuracy and legality of your User Content.
          </p>
        </Section>

        <Section title="6. Disclaimers">
          <p>
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
            warranties of any kind, whether express or implied. FreeSolo does not guarantee that
            the Service will be uninterrupted, secure, or error-free, or that any experience will
            meet your expectations.
          </p>
        </Section>

        <Section title="7. Limitation of liability">
          <p>
            To the fullest extent permitted by law, FreeSolo shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages, or any loss of
            profits or revenues, arising from your use of the Service or any experience booked
            through it.
          </p>
        </Section>

        <Section title="8. Termination">
          <p>
            You may stop using the Service and close your account at any time. We may suspend or
            terminate your access to the Service if you breach these Terms or if we reasonably
            believe doing so is necessary to protect the Service or its users.
          </p>
        </Section>

        <Section title="9. Changes to these terms">
          <p>
            We may update these Terms from time to time. If we make material changes, we will
            notify you by posting the updated Terms on this page and updating the &ldquo;Last
            updated&rdquo; date above. Continued use of the Service after changes take effect
            constitutes acceptance of the revised Terms.
          </p>
        </Section>

        <Section title="10. Contact us">
          <p>
            Questions about these Terms? Reach us at{" "}
            <a href="mailto:support@freesolo.app" className="font-medium text-fd-foreground underline underline-offset-4">
              support@freesolo.app
            </a>
            .
          </p>
        </Section>
      </div>
    </div>
  );
}
