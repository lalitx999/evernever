import source from './evernever.json'

export interface Project {
  _id: string
  title: string
  slug: { current: string }
  category: string
  categories?: string[]
  categoryLabels?: string[]
  coverImage: string
  gallery?: string[]
  videoUrl?: string | null
  videoUrls?: string[]
  summary?: string
  description?: string
  content?: { kind: string; text: string }[]
  sourceUrl?: string
  featured?: boolean
}
export const PROJECTS: Project[] = source.projects
export const COMPANY = source.company
export const SERVICES = source.services
export const TEAM = source.team.map((member, index) => ({ ...member, name: source.teamText[1 + index * 2], role: source.teamText[2 + index * 2] }))
export function projectCategories(project: Project) {
  return project.categoryLabels?.join(' / ') || project.category.replaceAll('-', ' ')
}
