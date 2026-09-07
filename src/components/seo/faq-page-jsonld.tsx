import type { FaqItem } from "@/types/content";
import { getFaqAnswerText } from "@/lib/content/faq-answer-text";

type FaqPageJsonLdProps = {
  faqs: FaqItem[];
  whatsappUrl: string;
};

export function FaqPageJsonLd({ faqs, whatsappUrl }: FaqPageJsonLdProps) {
  if (faqs.length === 0) {
    return null;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: getFaqAnswerText(faq.question, faq.answer, whatsappUrl),
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
