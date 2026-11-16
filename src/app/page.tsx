import { fetchCompany } from '@/lib/cms/server'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { fetchFeaturedProjects } from '@/lib/cms/projects'
import { PROJECTS } from '@/data/projects'
import { ProjectCard } from '@/components/ProjectCard'
import { ClientMarquee } from '@/components/ClientMarquee'
import { ServiceJourney } from '@/components/ServiceJourney'
import { ContactForm } from '@/components/ContactForm'
import styles from './home.module.css'

export async function generateMetadata(): Promise<Metadata> {
  const company = await fetchCompany()
  return { title: { absolute: 'evernever house — Present your story on Your way' }, description: company.thaiDescription }
}

export default async function HomePage() {
 const company = await fetchCompany()

  const featured = await fetchFeaturedProjects()
  const projects = [...featured].sort((a, b) => Number(b._id === '1353') - Number(a._id === '1353'))
  const heroProjects = ['1353', '2586'].map(id => PROJECTS.find(project => project._id === id)!)
  return <div className={styles.home}>
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={styles.heroContent}>
        <span className={styles.heroLabel}>EVERNEVER HOUSE · CREATIVE AGENCY</span>
        <h1 id="home-title">Present your story.<br /><span>On your way.</span></h1>
        <p>{company.thaiDescription}</p>
        <div className={styles.heroActions}><Link href="#services" className={styles.primaryButton}>เราช่วยแบรนด์คุณได้อย่างไร <ArrowUpRight size={19} /></Link><Link href="#contact" className={styles.textLink}>Let’s talk <ArrowUpRight size={18} /></Link></div>
      </div>
      <div className={styles.heroVisual}>
        {heroProjects.map((project, index) => <div key={project._id} className={`${styles.heroPhoto} ${index === 0 ? styles.heroPhotoMain : styles.heroPhotoSmall}`}><Image src={project.coverImage} alt={project.title} fill priority={index === 0} sizes="(max-width: 700px) 80vw, 38vw" /><span>{index === 0 ? 'Sulwhasoo' : 'YORCH × EVEANDBOY'}</span></div>)}
      </div>
    </section>

    <section className={styles.trust} aria-labelledby="clients-title">
      <div className={styles.trustHeading}><h2 id="clients-title">A few of our clients</h2><Link href="/clients">ลูกค้าของเรา <ArrowUpRight size={16} /></Link></div>
      <ClientMarquee />
    </section>

    <section className={styles.intro} id="about">
      <span className={styles.eyebrow}>MEET EVERNEVER / 360 SERVICE SUPPORTS</span>
      <h2>Creative. Strategy. Content.<br /><span>Everything your story needs.</span></h2>
      <div className={styles.introBody}><p>{company.thaiDescription}</p><Link href="/about" className={styles.textLink}>รู้จัก evernever <ArrowUpRight size={20} /></Link></div>
    </section>

    <section className={styles.services} id="services">
      <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>WHAT WE DO</span><h2>What we do<span>.</span></h2></div><Link href="/services" className={styles.textLink}>บริการทั้งหมด <ArrowUpRight size={20} /></Link></div>
      <ServiceJourney />
    </section>

    <section className={styles.works} id="selected-work">
      <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>IDEAS INTO ACTION</span><h2>Selected <span>work.</span></h2></div><Link href="/works" className={styles.textLink}>ดูผลงานทั้งหมด <ArrowUpRight size={20} /></Link></div>
      <div className={styles.featuredGrid}>{projects.slice(0, 3).map(project => <ProjectCard key={project._id} project={project} />)}</div>
    </section>

    <section className={styles.contact} id="contact">
      <div className={styles.contactCopy}><span className={styles.eyebrow}>LET’S WORK TOGETHER</span><h2>Let’s start<br /><span>with us.</span></h2><p>{company.invitation}</p><a href={`mailto:${company.email}`} className={styles.textLink}>{company.email}<ArrowUpRight size={18} /></a></div>
      <ContactForm contactEmail={company.email} />
    </section>
  </div>
}
