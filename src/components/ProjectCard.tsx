import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { type Project, projectCategories } from '@/data/projects'
import styles from '@/app/home.module.css'

export function ProjectCard({ project }: { project: Project }) {
  return <Link href={`/works/${encodeURIComponent(project.slug.current)}`} className={styles.project}>
    <div className={styles.projectImage}><Image src={project.coverImage} alt={project.title} fill sizes="(max-width: 700px) 100vw, 50vw" /><span className={styles.projectArrow}><ArrowUpRight size={24} /></span></div>
    {project.category !== 'all' && <div className={styles.projectMeta}>{projectCategories(project)}</div>}
    <h3>{project.title}</h3>
  </Link>
}
