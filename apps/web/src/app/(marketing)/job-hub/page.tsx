import { PageShell } from "@/components/marketing/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function JobHubPage() {
  return (
    <PageShell
      eyebrow="Job Hub"
      title="Matching workers to opportunities"
      description="A two-sided matching layer where workers receive job alerts and employers find certified talent by role, location, and readiness."
    >
      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">For Workers</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Subscribe to receive curated opportunities and respond quickly to relevant role matches.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">For Employers</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Post requests and shortlist top candidates using objective training and assessment signals.
          </CardContent>
        </Card>
      </section>
    </PageShell>
  );
}
