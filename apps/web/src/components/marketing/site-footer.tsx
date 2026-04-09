import Link from "next/link";
import Image from "next/image";

import { Separator } from "@/components/ui/separator";

export function SiteFooter() {
  return (
    <footer className="mt-16">
      <Separator />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <Image
            src="/logo.png"
            alt="InTrainin"
            width={120}
            height={30}
            className="mb-1.5 h-7 w-auto [filter:brightness(0)_saturate(100%)_invert(11%)_sepia(100%)_saturate(900%)_hue-rotate(-15deg)_brightness(0.8)] dark:[filter:none]"
          />
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
