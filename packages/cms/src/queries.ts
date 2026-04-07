// GROQ queries — expand as the Sanity schema is built out

export const allRolesQuery = /* groq */ `
  *[_type == "role"] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    sector,
    description,
    moduleCount,
    estimatedHours,
    priceKobo
  }
`

export const roleBySlugQuery = /* groq */ `
  *[_type == "role" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    sector,
    description,
    modules[] {
      _key,
      title,
      topics[] {
        _key,
        title,
        contentType,
        estimatedMinutes
      }
    }
  }
`

export const topicContentQuery = /* groq */ `
  *[_type == "topic" && _id == $id][0] {
    _id,
    title,
    contentType,
    body,
    steps,
    questions
  }
`
