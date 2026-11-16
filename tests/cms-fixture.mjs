// Local-only UI/API test fixture. Never used by the production application.
import http from 'node:http';
const secret='local-fixture-secret-not-for-production-00000000';
let projects=[];let company={};const tokens=new Set();let counter=0;
http.createServer(async(req,res)=>{
 const chunks=[];for await(const c of req)chunks.push(c);const raw=Buffer.concat(chunks).toString();let body={};try{body=JSON.parse(raw||'{}')}catch{}
 const path=req.url.replace('/wp-json/evernever/v1/','');
 const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(data))};
 if(req.headers['x-evernever-key']!==secret)return send(401,{message:'Invalid key'});
 if(path==='login'){if(body.username!=='test-editor'||body.password!=='test-password')return send(401,{message:'ข้อมูลเข้าสู่ระบบไม่ถูกต้อง'});const token=crypto.randomUUID();tokens.add(token);return send(200,{token,user:{id:1,name:'Local test editor',canManageSettings:true}})}
 if(path==='public/projects')return send(200,projects.filter(p=>p.status==='publish'));
 if(path==='public/company')return send(200,company);
 if(!tokens.has(req.headers['x-evernever-session']))return send(401,{message:'Session expired'});
 if(path==='session')return send(200,{id:1,name:'Local test editor',canManageSettings:true});
 if(path==='logout'){tokens.delete(req.headers['x-evernever-session']);return send(200,{success:true})}
 if(path==='company'){if(req.method==='POST')company=body;return send(200,company)}
 if(path==='projects'&&req.method==='GET')return send(200,projects);
 if(/^projects(?:\/\d+)?$/.test(path)){
  const id=Number(path.split('/')[1]);let existing=projects.find(p=>p.id===id);
  if(req.method==='DELETE'){if(!existing)return send(404,{message:'Not found'});existing.status='trash';return send(200,{success:true})}
  if(existing&&existing.modified!==body.modified)return send(409,{message:'Conflict'});
  if(projects.some(p=>p.id!==id&&p.slug.current===body.slug.current))return send(409,{message:'Duplicate slug'});
  if(body.status==='publish'&&!body.coverImage)return send(400,{message:'Cover required'});
  const next={...body,id:id||++counter,_id:`wp-${id||counter}`,modified:crypto.randomUUID()};projects=projects.filter(p=>p.id!==next.id);projects.push(next);return send(200,next);
 }
 return send(404,{message:'Not found'});
}).listen(4310,'127.0.0.1',()=>console.log('Isolated CMS test fixture on 4310'));
