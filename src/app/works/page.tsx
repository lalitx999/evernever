import { fetchProjects } from '@/lib/cms/projects'
import { WorksGallery } from '@/components/WorksGallery'
import styles from '../content.module.css'
export const metadata={title:'Works',description:'ผลงานของ evernever house'}
export default async function WorksPage(){return <div className={styles.page}><span className={styles.eyebrow}>EVERNEVER HOUSE</span><h1>Our works.</h1><WorksGallery projects={await fetchProjects()}/></div>}
