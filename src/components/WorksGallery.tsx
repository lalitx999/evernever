'use client'
import { useState } from 'react'
import { ProjectCard } from './ProjectCard'
import { type Project } from '@/data/projects'
import styles from '@/app/content.module.css'
import refinements from '@/app/refinements.module.css'
export function WorksGallery({ projects }: { projects: Project[] }) {
 const [active,setActive]=useState('all')
 const categories = new Map<string,string>()
 for (const project of projects) {
   const ids = project.categories?.length ? project.categories : [project.category]
   ids.forEach((id,index) => { if(id!=='all')categories.set(id,project.categoryLabels?.[index] || id.replaceAll('-',' ')) })
 }
 const visible=active==='all'?projects:projects.filter(project=>(project.categories || [project.category]).includes(active))
 return <><div className={styles.filters} aria-label="ประเภทผลงาน"><button type="button" aria-pressed={active==='all'} onClick={()=>setActive('all')}>All Works</button>{Array.from(categories).map(([id,label])=><button type="button" key={id} aria-pressed={active===id} onClick={()=>setActive(id)}>{label}</button>)}</div><p aria-live="polite" className={styles.count}>{visible.length} ผลงาน</p><div className={refinements.worksGrid}>{visible.map(project=><ProjectCard key={project._id} project={project}/>)}</div>{visible.length===0 && <p>ยังไม่มีผลงานในหมวดนี้</p>}</>
}
