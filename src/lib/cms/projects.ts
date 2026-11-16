import { wordpressProjects } from './server'
import { PROJECTS, type Project } from '@/data/projects'
import legacyMedia from '@/data/legacy-media.json'

const preservedMedia: Record<string, string> = legacyMedia
const preserveProjectMedia = (project: Project): Project => ({
  ...project,
  coverImage: preservedMedia[project.coverImage] || project.coverImage,
  gallery: project.gallery?.map(url => preservedMedia[url] || url),
})

export async function fetchProjects(): Promise<Project[]> {
  const projects = process.env.CONTENT_SOURCE === 'wordpress' ? await wordpressProjects() : PROJECTS
  return projects.map(preserveProjectMedia)
}
export async function fetchFeaturedProjects(): Promise<Project[]> {
  return (await fetchProjects()).filter(project => project.featured).slice(0, 4)
}
export async function fetchProjectBySlug(slug: string): Promise<Project | null> {
  const projects = process.env.CONTENT_SOURCE === 'wordpress' ? await wordpressProjects() : PROJECTS
  const project = projects.find(project => project.slug.current === slug)
  return project ? preserveProjectMedia(project) : null
}
