'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'
import styles from '@/app/content.module.css'

function embedUrl(value: string): string | null {
 try {
  const url=new URL(value)
  if(url.protocol!=='https:')return null
  if(url.hostname==='drive.google.com' && /^\/file\/d\/[\w-]+\/preview$/.test(url.pathname))return url.href
  if(['www.youtube.com','youtube.com','youtu.be'].includes(url.hostname)){
   const id=url.hostname==='youtu.be'?url.pathname.slice(1):url.searchParams.get('v')
   return id && /^[\w-]{11}$/.test(id)?`https://www.youtube-nocookie.com/embed/${id}`:null
  }
  if(['vimeo.com','www.vimeo.com','player.vimeo.com'].includes(url.hostname)){
   const id=url.pathname.split('/').pop()
   return id && /^\d+$/.test(id)?`https://player.vimeo.com/video/${id}`:null
  }
 }catch{}
 return null
}
export function VideoPlayer({ videoUrl,coverImage,title }: { videoUrl?:string|null;coverImage:string;title:string }){
 const [playing,setPlaying]=useState(false)
 const embed=videoUrl?embedUrl(videoUrl):null
 return <div className={styles.video}>{!playing?<div style={{position:'relative'}}><Image src={coverImage} alt={title} width={1280} height={720} className={styles.cover}/>{embed&&<button type="button" aria-label={`เล่นวิดีโอ ${title}`} onClick={()=>setPlaying(true)} style={{position:'absolute',inset:'50% auto auto 50%',transform:'translate(-50%,-50%)',borderRadius:'50%',background:'white',color:'var(--accent)',padding:24,boxShadow:'0 3px 20px #0002',cursor:'pointer'}}><Play size={30}/></button>}</div>:<><iframe src={embed!} title={title} allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen/><button type="button" className={styles.link} onClick={()=>setPlaying(false)}>ปิดวิดีโอ</button></>}{videoUrl&&<a href={videoUrl} target="_blank" rel="noopener noreferrer">เปิดวิดีโอในหน้าต่างใหม่ ↗</a>}</div>
}
