import { Check } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import type { PricingItem } from "@/lib/content/pricing-data";

type PricingCardProps = {
  item: PricingItem;
  className?: string;
};

export function PricingCard({ item, className }: PricingCardProps) {
  return (
    <article
      id={item.slug}
      className={cn(
        "glass-panel scroll-mt-28 overflow-hidden rounded-2xl p-6 lg:p-10",
        className,
      )}
    >
      <h2 className="text-2xl font-bold">{item.title}</h2>
      {item.description && (
        <p className="mt-3 text-muted-foreground">{item.description}</p>
      )}

      <div
        className={cn(
          "mt-6 grid gap-4",
          item.tiers.length === 4
            ? "sm:grid-cols-2 lg:grid-cols-4"
            : item.tiers.length === 3
              ? "sm:grid-cols-3"
              : "sm:grid-cols-2",
        )}
      >
        {item.tiers.map((tier) => (
          <div
            key={tier.label}
            className="rounded-xl border border-border-subtle bg-surface-raised/30 p-4"
          >
            <p className="text-sm font-medium text-muted-foreground">
              {tier.label}
            </p>
            <p className="mt-1 text-lg font-semibold text-brand-cyan-400">
              From {formatPrice(tier.price)}
            </p>
          </div>
        ))}
      </div>

      {item.includes && item.includes.length > 0 && (
        <ul className="mt-6 space-y-2">
          {item.includes.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Check className="h-4 w-4 shrink-0 text-brand-purple-400" />
              {feature}
            </li>
          ))}
        </ul>
      )}

      {item.note && (
        <p className="mt-4 text-sm text-muted-foreground/80">{item.note}</p>
      )}

      {item.warning && (
        <p className="mt-4 rounded-xl border border-border-subtle bg-surface-raised/20 p-4 text-sm text-muted-foreground">
          {item.warning}
        </p>
      )}
    </article>
  );
}
