import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { SERVICE_NAVIGATION } from '@/data/navigation'
import { SERVICES } from '@/data/projects'
import { fetchProjects } from '@/lib/cms/projects'
import { ProjectCard } from '@/components/ProjectCard'
import styles from '@/app/content.module.css'
import home from '@/app/home.module.css'
interface Props { params: Promise<{ slug: string }> }
export function generateStaticParams() { return SERVICE_NAVIGATION.map(service => ({ slug: service.slug })) }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const entry = SERVICE_NAVIGATION.find(service => service.slug === slug)
  const service = SERVICES.find(service => service.id === entry?.serviceId)
  return { title: service?.title || 'ไม่พบบริการ', description: service?.description }
}
export default async function ServicePage({ params }: Props) {
  const { slug } = await params
  const entry = SERVICE_NAVIGATION.find(service => service.slug === slug)
  const service = SERVICES.find(service => service.id === entry?.serviceId)
  if (!entry || !service) notFound()
  const projects = (await fetchProjects()).filter(project => (project.categories?.length ? project.categories : [project.category]).includes(slug))
  return <div className={styles.page}>
    <Link href="/services" className={styles.back}><ArrowLeft size={16} />บริการทั้งหมด</Link>
    <h1>{entry.label}</h1>
    <div style={{ maxWidth: 760 }}><p>{service.description}</p></div>
    <section className={styles.section}><h2>Works</h2>{projects.length > 0 ? <div className={home.projectGrid}>{projects.map(project => <ProjectCard key={project._id} project={project} />)}</div> : <p>ยังไม่มีผลงานเผยแพร่ในหมวดนี้</p>}</section>
    <Link href="/contact" className={styles.link}>Contact us <ArrowUpRight size={18} /></Link>
  </div>
}
