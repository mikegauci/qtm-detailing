import type { Metadata } from "next";
import { InternalPageSection } from "@/components/layout/internal-page-section";
import { SectionHeading } from "@/components/ui/section-heading";
import { getSiteSettings } from "@/lib/content/get-site-settings";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that apply when you book with QTM Detailing.",
  alternates: { canonical: "/terms" },
};

export const revalidate = 3600;

export default async function TermsPage() {
  const settings = await getSiteSettings();
  const email = settings.contact.email;

  return (
    <InternalPageSection>
      <SectionHeading
        eyebrow="Legal"
        title="Terms of Service"
        description="Last updated: 20 October 2026"
        align="left"
      />

      <div className="max-w-3xl space-y-8 text-muted-foreground [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        <section>
          <h2>About these terms</h2>
          <p>
            These terms apply when you use this website or book a service with{" "}
            {settings.name}, a car detailing business based in Malta. By making a
            booking, you agree to them.
          </p>
        </section>

        <section>
          <h2>Bookings</h2>
          <ul>
            <li>
              Bookings are confirmed once we have agreed a date and service with
              you and, where requested, received a deposit.
            </li>
            <li>
              Prices on this website are a guide. The final price depends on the
              size and condition of the vehicle and is agreed before work
              starts.
            </li>
            <li>
              Please remove personal belongings and valuables from the vehicle
              before handing it over.
            </li>
          </ul>
        </section>

        <section>
          <h2>Deposits, rescheduling and cancellations</h2>
          <p>
            Some services require a deposit to secure your date. If you need to
            reschedule or cancel, please let us know as early as possible. A
            deposit may be kept if a booking is cancelled at short notice or the
            vehicle is not made available at the agreed time. We will always try
            to offer a new date first.
          </p>
        </section>

        <section>
          <h2>Payment</h2>
          <p>
            The remaining balance is due when the work is completed, unless we
            have agreed otherwise.
          </p>
        </section>

        <section>
          <h2>Our work</h2>
          <p>
            We take great care with every vehicle. Results depend on the
            vehicle&apos;s existing condition: some scratches, stains or paint
            defects cannot be fully removed. We will tell you before starting if
            we expect this. If you are not happy with the result, contact us
            within 48 hours and we will look at it with you.
          </p>
        </section>

        <section>
          <h2>Liability</h2>
          <p>
            We are not responsible for pre-existing damage, wear, or faults in
            the vehicle, or for items left inside it. Nothing in these terms
            limits your rights as a consumer under Maltese law.
          </p>
        </section>

        <section>
          <h2>Photos</h2>
          <p>
            We may take photos of your vehicle before and after a job for our
            records. We will only share them publicly (for example on social
            media or in our gallery) without identifying details such as number
            plates, unless you agree otherwise.
          </p>
        </section>

        <section>
          <h2>Privacy</h2>
          <p>
            How we handle your information is explained in our{" "}
            <a
              href="/privacy"
              className="text-foreground underline underline-offset-4"
            >
              Privacy Policy
            </a>
            .
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Questions about these terms? Email{" "}
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
