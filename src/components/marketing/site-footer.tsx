import Link from "next/link";

import { Separator } from "@/components/ui/separator";

export function SiteFooter() {
  return (
    <footer className="mt-16">
      <Separator />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <p className="font-medium">InTrainin</p>
          <p className="text-sm text-muted-foreground">
            Structured training, trusted certification, better employment outcomes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link className="text-sm text-muted-foreground hover:text-foreground" href="/roles">
            Roles
          </Link>
          <Link className="text-sm text-muted-foreground hover:text-foreground" href="/business">
            Business
          </Link>
          <Link className="text-sm text-muted-foreground hover:text-foreground" href="/job-hub">
            Job Hub
          </Link>
          <Link className="text-sm text-muted-foreground hover:text-foreground" href="/about">
            About
          </Link>
        </div>
      </div>
    </footer>
  );
}
