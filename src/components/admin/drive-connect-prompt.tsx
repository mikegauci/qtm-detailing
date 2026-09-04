import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DriveConnectPromptProps = {
  message?: string;
  buttonLabel?: string;
  showButton?: boolean;
  className?: string;
};

export function DriveConnectPrompt({
  message = "Connect Google Drive to browse your photo folders.",
  buttonLabel = "Connect Google Drive",
  showButton = true,
  className,
}: DriveConnectPromptProps) {
  return (
    <div className={cn("space-y-4 py-8 text-center", className)}>
      <p className="text-sm text-white/60">{message}</p>
      {showButton ? (
        <Button asChild size="sm">
          <Link href="/api/google-drive/auth">{buttonLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
