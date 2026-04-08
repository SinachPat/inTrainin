import { PageShell } from "@/components/marketing/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="About InTrainin"
      title="Training that translates to employment outcomes"
      description="InTrainin is purpose-built for informal sector workers and employers who need a practical, trusted path from skills development to better jobs."
    >
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mission</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Help workers get trained, certified, and employed faster through structured role-specific learning.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Market</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Starting in Nigeria with planned expansion into Ghana, Kenya, and Uganda.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Approach</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Web-first PWA, modular architecture, and clear learning-to-hiring product loops.
          </CardContent>
        </Card>
      </section>
    </PageShell>
  );
}
