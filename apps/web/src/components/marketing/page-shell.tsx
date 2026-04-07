import { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

type PageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function PageShell({ eyebrow, title, description, children }: PageShellProps) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 md:px-8">
      <section className="rounded-xl border bg-card p-6 md:p-8">
        <Badge variant="secondary" className="mb-4">
          {eyebrow}
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">{description}</p>
      </section>
      {children}
    </main>
  );
}
