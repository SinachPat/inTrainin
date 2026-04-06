import { PageShell } from "@/components/marketing/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BusinessPage() {
  return (
    <PageShell
      eyebrow="Enterprise Package"
      title="Train your workforce and hire with confidence"
      description="InTrainin gives businesses a dashboard to onboard workers, assign role-specific curricula, monitor progress, and source certified candidates."
    >
      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Team Training Management</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Assign roles, track test outcomes, and monitor completion rates from a single dashboard.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hiring Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Post hire requests and review ranked candidate matches based on role readiness and certification.
          </CardContent>
        </Card>
      </section>
    </PageShell>
  );
}
