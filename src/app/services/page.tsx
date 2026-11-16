import Link from 'next/link'
import { SERVICE_NAVIGATION } from '@/data/navigation'
import { SERVICES } from '@/data/projects'
import styles from '../content.module.css'
export const metadata={title:'Services',description:'We are Experts in — evernever house'}
export default function ServicesPage(){return <div className={styles.page}><span className={styles.eyebrow}>OUR SERVICES</span><h1>We are Experts in</h1><div className={styles.services}>{SERVICES.map((service,index)=><section id={service.id} key={service.id} className={styles.service}><span className={styles.serviceIndex}>{String(index+1).padStart(2,'0')}</span><h2><Link href={`/services/${SERVICE_NAVIGATION.find(item => item.serviceId === service.id)!.slug}`}>{service.title}</Link></h2><p>{service.description}</p><Link className={styles.link} href={`/services/${SERVICE_NAVIGATION.find(item => item.serviceId === service.id)!.slug}`}>ดูบริการและผลงาน ↗</Link></section>)}</div></div>}
