"use client";

import { useTransition } from "react";
import { Loader2, Database } from "lucide-react";
import { toast } from "sonner";
import { seedContentFromStatic } from "@/app/actions/admin/cms";
import { Button } from "@/components/ui/button";

export function SeedContentButton() {
  const [isPending, startTransition] = useTransition();

  const handleSeed = () => {
    if (
      !confirm(
        "Seed database from static TypeScript files? Existing CMS data may be updated or duplicated for FAQs/testimonials.",
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await seedContentFromStatic();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Button onClick={handleSeed} disabled={isPending} variant="outline">
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Seeding...
        </>
      ) : (
        <>
          <Database className="mr-2 h-4 w-4" />
          Seed from static files
        </>
      )}
    </Button>
  );
}
