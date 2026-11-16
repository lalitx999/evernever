import { fetchCompany } from '@/lib/cms/server'
import Image from 'next/image'
import Link from 'next/link'
import { MAIN_NAVIGATION } from '@/data/navigation'
import styles from './site-shell.module.css'

export async function Footer() {
 const company = await fetchCompany()

  return <footer className={styles.footer}>
    <div className={styles.footerTop}>
      <div className={styles.footerBrand}><Link href="/" aria-label="evernever หน้าแรก"><Image src="/brand/evernever-wordmark.svg" alt="evernever" width={115} height={67} /></Link><p>{company.thaiDescription}</p></div>
      <nav aria-label="เมนูท้ายเว็บไซต์"><span>EXPLORE</span><Link href="/">Home</Link><Link href="/services">Services</Link>{MAIN_NAVIGATION.map(item => <Link key={item.href} href={item.href}>{item.label}</Link>)}</nav>
      <div className={styles.footerAddress}><span>FIND US</span><p>{company.legalName}<br />{company.address}</p><p><a href={`mailto:${company.email}`}>{company.email}</a><br /><a href="tel:0952468978">095-246-8978</a><br /><a href="tel:0655299645">065-529-9645 (Jack)</a></p></div>
    </div>
    <div className={styles.footerBottom}><span>© {new Date().getFullYear()} evernever co., ltd.</span><span>BANGKOK, THAILAND</span></div>
  </footer>
}
