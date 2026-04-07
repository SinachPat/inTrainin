interface Props {
  params: Promise<{ roleSlug: string; topicId: string }>
}

export default async function TopicPage({ params }: Props) {
  const { roleSlug, topicId } = await params
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {roleSlug} / {topicId}
      </p>
      <h1 className="text-2xl font-bold">Topic</h1>
      {/* TODO Layer 6: guide/case study/workflow/test content renderer */}
    </div>
  )
}
