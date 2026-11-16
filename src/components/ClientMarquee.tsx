'use client'

import { useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { COMPANY } from '@/data/projects'
import styles from '@/app/home.module.css'

const clients = [
  { name: 'Spotify', crop: [186, 185, 195, 80] },
  { name: 'Canon', crop: [789, 189, 229, 80] },
  { name: 'Dior', crop: [528, 316, 141, 68] },
  { name: 'LINE', crop: [468, 584, 164, 69] },
  { name: 'Toyota', crop: [675, 566, 99, 96] },
  { name: 'Grab', crop: [1265, 741, 179, 78] },
]

export function ClientMarquee() {
  const [paused, setPaused] = useState(false)
  return <div className={styles.marqueeShell}>
    <div className={styles.marqueeWindow}>
      <div className={styles.logoTrack} data-paused={paused}>
        {[0, 1].map(copy => <div className={styles.logoRow} key={copy} aria-hidden={copy === 1 || undefined}>
          {clients.map(({ name, crop: [x, y, width, height] }) => <svg key={name} viewBox={`${x} ${y} ${width} ${height}`} role="img" aria-label={name}>
            <defs><clipPath id={`client-${copy}-${name}`}><rect x={x} y={y} width={width} height={height} /></clipPath></defs>
            <image href={COMPANY.clientsImage} width="1920" height="981" clipPath={`url(#client-${copy}-${name})`} />
          </svg>)}
        </div>)}
      </div>
    </div>
    <button type="button" className={styles.motionToggle} onClick={() => setPaused(!paused)} aria-label={paused ? 'เล่นแถบโลโก้ลูกค้า' : 'หยุดแถบโลโก้ลูกค้า'} aria-pressed={paused}>{paused ? <Play size={16} /> : <Pause size={16} />}</button>
  </div>
}
