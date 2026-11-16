import Image from 'next/image'
import { COMPANY } from '@/data/projects'
import styles from '../content.module.css'
export const metadata = { title: 'Clients', description: 'A few of our clients — evernever house' }
export default function ClientsPage() {
  return <div className={styles.page}><span className={styles.eyebrow}>EVERNEVER HOUSE</span><h1>A few of our clients</h1><Image src={COMPANY.clientsImage} alt="แบรนด์ลูกค้าของ evernever ตามเว็บไซต์ต้นฉบับ" width={1920} height={981} priority style={{ width: '100%', height: 'auto' }} /></div>
}
