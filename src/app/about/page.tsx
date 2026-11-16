import { fetchCompany } from '@/lib/cms/server'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { fetchProjects } from '@/lib/cms/projects'
import styles from '../content.module.css'
import refined from '../refinements.module.css'
export async function generateMetadata(){const company=await fetchCompany();return {title:'About us',description:company.thaiDescription}}
export default async function AboutPage(){
 const company = await fetchCompany()

  const projects = await fetchProjects()
  const selections: [string, number][] = [
    ['The masterpiece', 0], ['BamBam', 2], ['Bioderma', 1], ['ICHITAN', 1],
    ['Mother BKK', 1], ['YORCH', -1], ['Bioderma', 2], ['BamBam', 3],
    ['The masterpiece', 1], ['ICHITAN', 2],
  ]
  const images = selections.flatMap(([title, index]) => {
    const project = projects.find(item => item.title.startsWith(title))
    return project ? [{ title: project.title, src: project.gallery?.[index] || project.coverImage }] : []
  })
  return <div className={styles.page}>
    <section className={refined.aboutHero}>
      {images.map((project,index)=><div className={refined.aboutPhoto} key={`${project.src}-${index}`}><Image src={project.src} alt={project.title} fill sizes="(max-width: 700px) 22vw, 11vw"/></div>)}
      <div className={refined.aboutStatement}><span className={styles.eyebrow}>ABOUT EVERNEVER HOUSE</span><h1>Present your story.<br/><span>On your way.</span></h1><p>{company.thaiDescription}</p><div className={refined.actions}><Link href="/">Back to Home <ArrowUpRight size={16}/></Link><Link href="/contact">Let’s talk <ArrowUpRight size={16}/></Link></div></div>
    </section>
    <section className={refined.aboutDetails}><span className={styles.eyebrow}>BASED IN BANGKOK</span><h2>{company.aboutHeading}</h2><p>{company.about}</p><Link className={styles.link} href="/team">Meet our team <ArrowUpRight size={16}/></Link></section>
  </div>
}
