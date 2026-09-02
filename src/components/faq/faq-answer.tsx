import Link from "next/link";
import { cn } from "@/lib/utils";

type FaqAnswerProps = {
  question: string;
  answer: string;
  className?: string;
};

const linkClassName =
  "font-medium text-brand-purple-400 underline-offset-2 hover:underline";

export function FaqAnswer({ question, answer, className }: FaqAnswerProps) {
  if (question === "How do I book an appointment?") {
    return (
      <p className={className}>
        Message us on{" "}
        <a
          href="https://wa.link/lvy8rn"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
        >
          WhatsApp
        </a>{" "}
        with your vehicle details and preferred service for the fastest
        response, or fill out our{" "}
        <Link href="/contact" className={linkClassName}>
          contact form
        </Link>
        . We&apos;ll respond within 24 hours with availability and a
        personalised quote.
      </p>
    );
  }

  return <p className={cn(className)}>{answer}</p>;
}
