import { fetchCompany } from '@/lib/cms/server'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { TEAM } from '@/data/projects'
import styles from '../content.module.css'
import refined from '../refinements.module.css'
export const metadata = { title: 'Team', description: 'Meet our team — evernever house' }
export default async function TeamPage() {
 const company = await fetchCompany()

  return <div className={styles.page}>
    <header className={refined.centerHeader}><span className={styles.eyebrow}>THE PEOPLE AT EVERNEVER</span><h1>Meet our beautiful team</h1><p>{company.invitation}</p><div className={refined.actions}><Link href="/works">Explore our work <ArrowUpRight size={16}/></Link><Link href="/contact">Get in touch <ArrowUpRight size={16}/></Link></div></header>
    <div className={refined.teamGrid}>{TEAM.map(member => <section key={member.name}><Image src={member.image} alt={member.name} width={480} height={600} sizes="(max-width: 700px) 44vw, 22vw"/><h3>{member.name}</h3><p>{member.role}</p></section>)}</div>
  </div>
}
