"use client";

import { CheckCircle2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { WhyQtmContent } from "@/types/page-sections";

type WhyQtmAccordionProps = {
  reasons: WhyQtmContent["reasons"];
};

export function WhyQtmAccordion({ reasons }: WhyQtmAccordionProps) {
  return (
    <div className="glass-panel rounded-2xl px-5 sm:px-6">
      <Accordion
        type="single"
        collapsible
        defaultValue="reason-0"
        className="w-full"
      >
        {reasons.map((reason, index) => (
          <AccordionItem
            key={`reason-${index}`}
            value={`reason-${index}`}
            className="border-border-subtle"
          >
            <AccordionTrigger className="py-4 text-base font-semibold hover:no-underline">
              <span className="flex items-center gap-3 text-left">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-cyan-400" />
                {reason.title}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <p className="pl-8 text-muted-foreground">{reason.description}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
