'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ChevronDown, Menu, X } from 'lucide-react'
import { MAIN_NAVIGATION, SERVICE_NAVIGATION } from '@/data/navigation'
import styles from './site-shell.module.css'

export function Navbar() {
  const pathname = usePathname()
  return <Navigation key={pathname} pathname={pathname} />
}

function Navigation({ pathname }: { pathname: string }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const serviceButtonRef = useRef<HTMLButtonElement>(null)
  const mobileButtonRef = useRef<HTMLButtonElement>(null)
  const close = () => { setMobileOpen(false); setServicesOpen(false) }
  const serviceActive = pathname === '/services' || pathname.startsWith('/services/')

  useEffect(() => {
    function outsideClick(event: PointerEvent) {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        setMobileOpen(false)
        setServicesOpen(false)
      }
    }
    document.addEventListener('pointerdown', outsideClick)
    return () => document.removeEventListener('pointerdown', outsideClick)
  }, [])

  return <header ref={headerRef} className={styles.header} onKeyDown={event => {
    if (event.key !== 'Escape') return
    if (servicesOpen) { setServicesOpen(false); serviceButtonRef.current?.focus() }
    else if (mobileOpen) { setMobileOpen(false); mobileButtonRef.current?.focus() }
  }}>
    <div className={styles.navbar}>
      <Link href="/" className={styles.brand} aria-label="evernever หน้าแรก" onClick={close}>
        <Image src="/brand/evernever-wordmark.svg" alt="evernever" width={90} height={52} priority />
      </Link>
      <button ref={mobileButtonRef} type="button" className={styles.menuToggle}
        aria-label={mobileOpen ? 'ปิดเมนู' : 'เปิดเมนู'} aria-expanded={mobileOpen} aria-controls="site-navigation"
        onClick={() => { setMobileOpen(!mobileOpen); setServicesOpen(false) }}>
        {mobileOpen ? <X size={26} /> : <Menu size={26} />}
      </button>
      <nav id="site-navigation" className={`${styles.navigation} ${mobileOpen ? styles.navigationOpen : ''}`} aria-label="เมนูหลัก">
        <ul className={styles.navList}>
          <li><Link href="/" onClick={close} aria-current={pathname === '/' ? 'page' : undefined}>Home</Link></li>
          <li className={styles.serviceMenu}
            onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setServicesOpen(false) }}>
            <div className={styles.serviceTrigger}>
              <Link href="/services" onClick={close} aria-current={pathname === '/services' ? 'page' : undefined} className={serviceActive ? styles.activeSection : undefined}>Services</Link>
              <button ref={serviceButtonRef} type="button" aria-label="เมนูย่อย Services" aria-expanded={servicesOpen} aria-controls="services-submenu"
                onClick={() => setServicesOpen(!servicesOpen)}
                onKeyDown={event => { if (event.key === 'ArrowDown') { event.preventDefault(); setServicesOpen(true); requestAnimationFrame(() => document.querySelector<HTMLAnchorElement>('#services-submenu a')?.focus()) } }}>
                <ChevronDown size={15} className={servicesOpen ? styles.chevronOpen : undefined} />
              </button>
            </div>
            <ul id="services-submenu" className={styles.submenu} hidden={!servicesOpen}>
              {SERVICE_NAVIGATION.map(service => <li key={service.slug}><Link href={`/services/${service.slug}`} onClick={close} aria-current={pathname === `/services/${service.slug}` ? 'page' : undefined}>{service.label}</Link></li>)}
            </ul>
          </li>
          {MAIN_NAVIGATION.map(link => <li key={link.href}><Link href={link.href} onClick={close} aria-current={pathname === link.href || pathname.startsWith(`${link.href}/`) ? 'page' : undefined}>{link.label}</Link></li>)}
        </ul>
      </nav>
    </div>
  </header>
}
