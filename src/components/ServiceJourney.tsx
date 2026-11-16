'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { SERVICES, PROJECTS } from '@/data/projects'
import { SERVICE_GROUPS } from '@/data/serviceGroups'
import { SERVICE_NAVIGATION } from '@/data/navigation'
import styles from '@/app/home.module.css'

const images = ['1353', '1877', '2586', '1353'].map(id => PROJECTS.find(project => project._id === id)!)
const titles = ['Creative & strategy', 'Content & production', 'Events & experiences', 'Social & digital']

export function ServiceJourney() {
  const [active, setActive] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const sections = root.current?.querySelectorAll<HTMLElement>('[data-service-step]')
    if (!sections) return
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.serviceStep))
    }, { rootMargin: '-25% 0px -45% 0px', threshold: 0 })
    sections.forEach(section => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return <div ref={root} className={styles.serviceJourney}>
    <div className={styles.serviceVisual} aria-hidden="true">
      <div className={styles.serviceImageStack}>{images.map((project, index) => <Image key={index} src={project.coverImage} alt="" fill sizes="45vw" className={index === active ? styles.imageActive : ''} />)}</div>
      <div className={styles.imageCaption}><span>{String(active + 1).padStart(2, '0')} / 04</span><span>{titles[active]}</span></div>
    </div>
    <div>{SERVICE_GROUPS.map((group, index) => <article className={styles.serviceStep} data-service-step={index} key={group.number}>
      <span className={styles.eyebrow}>EVERNEVER / {group.number}</span>
      <h3>{titles[index]}</h3>
      <div className={styles.mobileServiceImage}><Image src={images[index].coverImage} alt={images[index].title} fill sizes="90vw" /></div>
      <p>{SERVICES.find(service => service.id === group.descriptionId)?.description}</p>
      <ul className={styles.serviceLinks}>{group.services.map(id => {
        const service = SERVICES.find(item => item.id === id)!
        const navigation = SERVICE_NAVIGATION.find(item => item.serviceId === id)!
        return <li key={id}><Link href={`/services/${navigation.slug}`}>{service.title}<ArrowUpRight size={16} /></Link></li>
      })}</ul>
    </article>)}</div>
  </div>
}
