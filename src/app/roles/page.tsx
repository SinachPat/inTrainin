import { PageShell } from "@/components/marketing/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RolesPage() {
  return (
    <PageShell
      eyebrow="Role Catalogue"
      title="Explore role-based learning tracks"
      description="Browse structured role curricula designed for informal and semi-formal job categories across retail, hospitality, logistics, office support, and more."
    >
      <section className="grid gap-4 md:grid-cols-3">
        {["Retail & Store Operations", "Food & Beverage", "Sales & Marketing"].map((item) => (
          <Card key={item}>
            <CardHeader>
              <CardTitle className="text-lg">{item}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Curriculum previews, pricing, and estimated completion windows will be displayed here.
            </CardContent>
          </Card>
        ))}
      </section>
    </PageShell>
  );
}
