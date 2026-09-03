import { Check } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import type { PricingItem } from "@/lib/content/pricing-data";

type PricingCardProps = {
  item: PricingItem;
  className?: string;
};

function tierGridClass(tierCount: number, hasIncludes: boolean) {
  if (hasIncludes) {
    return tierCount === 4
      ? "sm:grid-cols-2"
      : tierCount === 3
        ? "sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-1";
  }

  return tierCount === 4
    ? "sm:grid-cols-2 lg:grid-cols-4"
    : tierCount === 3
      ? "sm:grid-cols-3"
      : "sm:grid-cols-2";
}

export function PricingCard({ item, className }: PricingCardProps) {
  const hasIncludes = Boolean(item.includes?.length);

  return (
    <article
      id={item.slug}
      className={cn(
        "glass-panel scroll-mt-28 overflow-hidden rounded-2xl p-6 lg:p-10",
        className,
      )}
    >
      <div
        className={cn(
          hasIncludes && "lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-12 lg:gap-y-6",
        )}
      >
        <div>
          <h2 className="text-2xl font-bold">{item.title}</h2>
          {item.description && (
            <p className="mt-3 text-muted-foreground">{item.description}</p>
          )}

          <div
            className={cn(
              "mt-6 grid gap-4",
              tierGridClass(item.tiers.length, hasIncludes),
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
        </div>

        {hasIncludes && (
          <ul
            className={cn(
              "mt-6 grid gap-2 lg:mt-0",
              item.includes!.length >= 4 ? "sm:grid-cols-2" : "grid-cols-1",
            )}
          >
            {item.includes!.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-purple-400" />
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>

      {item.note && (
        <p className="mt-6 text-sm text-muted-foreground/80">{item.note}</p>
      )}

      {item.warning && (
        <p className="mt-6 rounded-xl border border-border-subtle bg-surface-raised/20 p-4 text-sm text-muted-foreground">
          {item.warning}
        </p>
      )}
    </article>
  );
}
