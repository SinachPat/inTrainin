interface Props {
  params: Promise<{ roleSlug: string }>
}

export default async function RoleCurriculumPage({ params }: Props) {
  const { roleSlug } = await params
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Role: {roleSlug}</h1>
      {/* TODO Layer 6: module/topic list, progress bar, locked states */}
    </div>
  )
}
