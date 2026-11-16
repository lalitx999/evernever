import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { fetchProjectBySlug, fetchProjects } from '@/lib/cms/projects'
import { projectCategories } from '@/data/projects'
import { VideoPlayer } from '@/components/VideoPlayer'
import styles from '@/app/content.module.css'
interface Props{params:Promise<{slug:string}>}
export async function generateMetadata({params}:Props):Promise<Metadata>{await connection();const {slug}=await params;const project=await fetchProjectBySlug(decodeURIComponent(slug));return {title:project?.title || 'ไม่พบผลงาน',description:project?.summary || project?.title}}
export default async function ProjectDetailPage({params}:Props){
 await connection()
 const {slug}=await params
 const project=await fetchProjectBySlug(decodeURIComponent(slug))
 if(!project)notFound()
 const projects=(await fetchProjects()).filter((item,index,items)=>items.findIndex(other=>other.slug.current===item.slug.current)===index)
 const index=projects.findIndex(item=>item._id===project._id)
 const next=projects.length>1?projects[(index+1)%projects.length]:null
 const videos=project.videoUrls?.length?project.videoUrls:project.videoUrl?[project.videoUrl]:[]
 return <article className={styles.page}><Link href="/works" className={styles.back}><ArrowLeft size={16}/>กลับไปดูผลงานทั้งหมด</Link><h1>{project.title}</h1>{project.category!=='all'&&<p>{projectCategories(project)}</p>}
 {videos.length? videos.map((video,index)=><VideoPlayer key={video} videoUrl={video} coverImage={project.coverImage} title={`${project.title}${videos.length>1?` — ${index+1}`:''}`}/>):<Image src={project.coverImage} alt={project.title} width={1280} height={720} priority className={styles.cover}/>}
 <div className={styles.story}>{project.content?.map((block,index)=>block.kind==='heading'?<h2 key={index}>{block.text}</h2>:<p key={index}>{block.text}</p>)}{!project.content?.length&&project.description&&<p>{project.description}</p>}</div>
 {!!project.gallery?.length&&<div className={styles.gallery}>{project.gallery.map((image,index)=><Image key={`${image}-${index}`} src={image} alt={`${project.title} — ภาพที่ ${index+1}`} width={800} height={600} loading="lazy"/>)}</div>}
 {next&&<Link href={`/works/${encodeURIComponent(next.slug.current)}`} className={styles.next}><div><p>ผลงานถัดไป</p><h2>{next.title}</h2></div><ArrowUpRight size={30}/></Link>}
 </article>
}
