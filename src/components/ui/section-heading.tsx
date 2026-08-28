import Link from "next/link";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-12 max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-brand-cyan-400">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
        <span className="gradient-text">{title}</span>
      </h2>
      {description && (
        <p className="mt-4 text-lg text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

type CTAButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
  onClick?: () => void;
};

export function CTAButton({
  href,
  children,
  variant = "primary",
  className,
  onClick,
}: CTAButtonProps) {
  const variants = {
    primary:
      "bg-gradient-to-r from-brand-purple-600 to-brand-cyan-700 text-white hover:from-brand-purple-500 hover:to-brand-cyan-600 glow-purple",
    secondary:
      "bg-surface-elevated text-foreground hover:bg-surface-raised border border-border-subtle",
    outline:
      "border border-brand-purple-400/50 text-brand-purple-300 hover:bg-brand-purple-950/50 hover:border-brand-purple-400",
  };

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300",
        variants[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}
