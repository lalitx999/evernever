'use client'

import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { COMPANY } from '@/data/projects'
import styles from './contact-form.module.css'

export function ContactForm({ boxed = false, contactEmail = COMPANY.email }: { boxed?: boolean; contactEmail?: string }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const fields = new FormData(form)
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: `${fields.get('firstName')} ${fields.get('lastName')}`, phone: fields.get('phone'), email: fields.get('email'), company: fields.get('company'), website: fields.get('website') }),
      })
      const result = await response.json()
      setMessage(result.message)
      if (response.ok && result.success) form.reset()
    } catch { setMessage('ส่งข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง หรือติดต่อทางโทรศัพท์หรืออีเมล') }
    finally { setBusy(false) }
  }
  return <form className={`${styles.form} ${boxed ? styles.boxed : ''}`} onSubmit={submit}>
    <h3>Tell us about you</h3><div aria-hidden="true" style={{ position: 'absolute', left: '-10000px' }}><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <div className={styles.fields}>
      <label>ชื่อ *<input name="firstName" autoComplete="given-name" required maxLength={60} /></label>
      <label>นามสกุล *<input name="lastName" autoComplete="family-name" required maxLength={60} /></label>
      <label>เบอร์โทรศัพท์ *<input name="phone" type="tel" autoComplete="tel" required maxLength={30} pattern="[+0-9 ()-]{8,30}" /></label>
      <label>อีเมล *<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
      <label className={styles.wide}>บริษัท<input name="company" autoComplete="organization" maxLength={160} /></label>
    </div>
    <button type="submit" disabled={busy}>{busy ? 'กำลังส่ง…' : 'ส่งข้อมูลติดต่อ'}<ArrowUpRight size={20} /></button>
    {message && <p role="status" className={styles.status}>{message}</p>}
    <p className={styles.alternative}>หรือติดต่อโดยตรง <a href={`mailto:${contactEmail}`}>{contactEmail}</a></p>
  </form>
}
