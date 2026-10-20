import type { Metadata } from "next";
import { InternalPageSection } from "@/components/layout/internal-page-section";
import { SectionHeading } from "@/components/ui/section-heading";
import { getSiteSettings } from "@/lib/content/get-site-settings";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How QTM Detailing collects, uses and protects your information.",
  alternates: { canonical: "/privacy" },
};

export const revalidate = 3600;

export default async function PrivacyPage() {
  const settings = await getSiteSettings();
  const email = settings.contact.email;

  return (
    <InternalPageSection>
      <SectionHeading
        eyebrow="Legal"
        title="Privacy Policy"
        description="Last updated: 20 October 2026"
        align="left"
      />

      <div className="max-w-3xl space-y-8 text-muted-foreground [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        <section>
          <h2>Who we are</h2>
          <p>
            {settings.name} is a car detailing business based in Malta. This
            policy explains what information we collect when you book with us or
            use this website, and how we use it.
          </p>
        </section>

        <section>
          <h2>What we collect</h2>
          <ul>
            <li>Your name, phone number and email address.</li>
            <li>Details of your vehicle (make, model and registration).</li>
            <li>Booking dates, services, notes and payment status.</li>
            <li>Photos of your vehicle taken before and after a job.</li>
            <li>Messages you send us by WhatsApp, phone or email.</li>
          </ul>
        </section>

        <section>
          <h2>How we use it</h2>
          <p>
            We use this information only to arrange and carry out your booking,
            contact you about it, keep records of work done, and manage our
            schedule. We do not sell your information or use it for third-party
            advertising.
          </p>
        </section>

        <section>
          <h2>Google services</h2>
          <p>
            The QTM Detailing admin system lets our staff sign in with a Google
            account. It is not available to customers or the public. When a staff
            member connects their Google account, the app accesses:
          </p>
          <ul className="my-3">
            <li>
              <strong className="text-foreground">Email address</strong> (via
              Google sign-in): to show which Google account is connected.
            </li>
            <li>
              <strong className="text-foreground">Google Calendar</strong>: to
              create a &ldquo;QTM Bookings&rdquo; calendar, share it with our
              staff, and add, update or remove booking events on it when
              bookings change in our admin system. We do not read or change any
              other calendars or events.
            </li>
            <li>
              <strong className="text-foreground">Google Drive (read-only)</strong>
              : to list and display vehicle photos stored in our business Drive
              folder. We do not create, change or delete Drive files.
            </li>
          </ul>
          <p>
            Google access tokens are stored securely in our database and are
            used only by our server to perform the actions above. Google user
            data is not sold, not shared with third parties, not used for
            advertising, and not used to train AI models. You can remove the
            app&apos;s access at any time from your Google Account&apos;s
            third-party connections page, after which the stored tokens stop
            working. Our use of information received from Google APIs adheres
            to the{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </p>
        </section>

        <section>
          <h2>Where your data is stored</h2>
          <p>
            Booking and customer records are stored securely with our hosting
            and database providers. Calendar entries and photos are stored in
            our Google account. Only QTM Detailing staff can access them.
          </p>
        </section>

        <section>
          <h2>How long we keep it</h2>
          <p>
            We keep booking records for as long as needed to provide our
            services and meet legal and accounting obligations, after which they
            are deleted.
          </p>
        </section>

        <section>
          <h2>Your rights</h2>
          <p>
            You can ask to see, correct or delete the information we hold about
            you at any time. Contact us at{" "}
            <a
              href={`mailto:${email}`}
              className="text-foreground underline underline-offset-4"
            >
              {email}
            </a>
            .
          </p>
        </section>
      </div>
    </InternalPageSection>
  );
}
