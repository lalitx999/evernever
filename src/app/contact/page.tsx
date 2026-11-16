import { fetchCompany } from '@/lib/cms/server'
import { ContactForm } from '@/components/ContactForm'
import styles from '../content.module.css'
import refined from '../refinements.module.css'
export async function generateMetadata(){const company=await fetchCompany();return {title:'Contact us',description:`${company.legalName} — ${company.email}`}}
export default async function ContactPage(){
 const company = await fetchCompany()
return <div className={styles.page}><div className={refined.contactPanel}><section className={refined.contactCopy}><span className={styles.eyebrow}>LET’S WORK TOGETHER</span><h1>Let’s start<br/>with your story.</h1><p>{company.invitation}</p><h2>{company.legalName}</h2><dl><div><dt>Email</dt><dd><a href={`mailto:${company.email}`}>{company.email}</a></dd></div><div><dt>Tel</dt><dd><a href="tel:0952468978">095-246-8978</a><br/><a href="tel:0655299645">065-529-9645 (Jack)</a></dd></div><div><dt>ที่อยู่</dt><dd>{company.address}</dd></div><div><dt>เวลาทำการ</dt><dd>{company.hours}</dd></div></dl></section><ContactForm boxed contactEmail={company.email}/></div></div>}
