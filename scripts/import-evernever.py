"""Import the public Evernever snapshot fetched into /tmp/evernever-source.
No invented descriptions, dates, client claims or performance statistics.
"""
import json, re, html, subprocess
from pathlib import Path
from html.parser import HTMLParser
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlparse, unquote

ROOT=Path(__file__).resolve().parents[1]
SOURCE=Path('/tmp/evernever-source')
class Node:
 def __init__(self,tag='',attrs=None): self.tag=tag; self.attrs=attrs or {}; self.children=[]
 def text(self): return re.sub(r'\s+',' ',''.join(x if isinstance(x,str) else x.text()+' ' for x in self.children)).strip()
 def nodes(self):
  yield self
  for x in self.children:
   if isinstance(x,Node): yield from x.nodes()
class Parser(HTMLParser):
 def __init__(self,source):
  super().__init__();self.root=Node();self.stack=[self.root];self.feed(source)
 def handle_starttag(self,t,a):
  n=Node(t,dict(a));self.stack[-1].children.append(n)
  if t not in ['img','br','hr','input','meta','link','source','embed','wbr']:self.stack.append(n)
 def handle_endtag(self,t):
  for i in range(len(self.stack)-1,0,-1):
   if self.stack[i].tag==t:self.stack=self.stack[:i];break
 def handle_data(self,d):
  if not any(n.tag in ['style','script','noscript'] for n in self.stack):self.stack[-1].children.append(d)
def parse(s):return Parser(s).root
def blocks(n):
 out=[]
 for c in n.children:
  if not isinstance(c,Node):continue
  if c.tag in ['h1','h2','h3','h4','h5','h6','p','li']:
   text=c.text()
   if text and not any(t in text.lower() for t in ['lorem ipsum','ut enim ad minim','duis aute irure','excepteur sint']):out.append({'kind':'heading' if c.tag.startswith('h') else 'paragraph','text':text})
  else:out.extend(blocks(c))
 return out
pages={p['slug']:p for p in json.load(open(SOURCE/'pages.json'))}
cats={p['id']:p for p in json.load(open(SOURCE/'categories.json'))}
assets={}
def asset(url,key):
 if not url:return ''
 path='/evernever/'+key+Path(urlparse(url).path).suffix
 assets[path]=url
 return path
projects=[]
for p in json.load(open(SOURCE/'posts.json')):
 if 1 not in p['categories']:continue
 tree=parse(p['content']['rendered']);media=p.get('_embedded',{}).get('wp:featuredmedia',[{}])[0]
 sizes=media.get('media_details',{}).get('sizes',{})
 cover=sizes.get('large',sizes.get('medium_large',{})).get('source_url',media.get('source_url',''))
 images=[];videos=[]
 for n in tree.nodes():
  url=n.attrs.get('data-src',n.attrs.get('src',''))
  if n.tag=='img' and url.startswith('https://evernever.net/wp-content/uploads/') and url not in images:images.append(url)
  if n.tag in ['iframe','video','source'] and url.startswith('https://') and url not in videos:videos.append(url)
  settings=n.attrs.get('data-settings','')
  if settings:
   try:
    s=json.loads(settings)
    for key in ['youtube_url','vimeo_url','hosted_url']:
     u=s.get(key);u=u.get('url') if isinstance(u,dict) else u
     if u and u not in videos:videos.append(u)
   except json.JSONDecodeError:pass
 textblocks=blocks(tree)
 # The source contains a song quotation; retain only the production write-up.
 if p['id']==1877:
  start=next((i for i,b in enumerate(textblocks) if 'A Tale of Passion' in b['text']),len(textblocks))
  textblocks=textblocks[start:]
 # Remove orphan template sections from the Metro Mall source, which contains lorem ipsum.
 if p['id']==1721:textblocks=[b for b in textblocks if b['text'] in ['Metro Mall','The Happy Hub of MRT']]
 categorySlugs=[cats[c]['slug'] for c in p['categories'] if c!=1]
 categoryNames=[html.unescape(cats[c]['name']) for c in p['categories'] if c!=1]
 # Source publication dates are not treated as project delivery years.
 projects.append({'_id':str(p['id']),'title':html.unescape(p['title']['rendered']),'slug':{'current':unquote(p['slug'])},'category':categorySlugs[0] if categorySlugs else 'all','categories':categorySlugs,'categoryLabels':categoryNames,'coverImage':asset(cover,'work-'+str(p['id'])),'gallery':images,'videoUrl':videos[0] if videos else None,'videoUrls':videos,'summary':'','content':textblocks,'sourceUrl':p['link'],'featured':p['id'] in [2677,1353,853,2391]})
home=parse(pages['home']['content']['rendered'])
services=[]
for n in home.nodes():
 if n.tag in ['h5','h6']:
  title=n.text()
  if title: services.append({'title':title,'description':''})
 if n.tag=='li' and services and not services[-1]['description']:services[-1]['description']=n.text()
# Associate the service list with the source icons, in their source order.
icons=[n.attrs.get('data-src',n.attrs.get('src','')) for n in home.nodes() if n.tag=='img' and '/2024/04/' in n.attrs.get('data-src',n.attrs.get('src',''))]
for i,s in enumerate(services):
 s['image']=asset(icons[i],f'service-{i}') if i<len(icons) else ''
 s['id']='service-'+str(i)
teamTree=parse(pages['team']['content']['rendered']);teamBlocks=blocks(teamTree)
# Team names and roles are preserved in the same order as the source page.
teamText=[n.text() for n in teamTree.nodes() if n.tag=='p' and n.text()]
teamImages=list(dict.fromkeys(n.attrs.get('data-src',n.attrs.get('src','')) for n in teamTree.nodes() if n.tag=='img'))[1:]
team=[]
# Source p tags contain names and roles together; inspect through text lines below.
for i,u in enumerate(teamImages):team.append({'image':asset(u,'team-'+str(i))})
company={'name':'evernever house','tagline':'Present your story on Your way','intro':'When you are deeply in love and truly passionate about someone or something, You can make everything It’s happening and provocative things that may seem unsual to other people’s standards — all in one view. Because we are one stop service in entertainment media.','invitation':'Let’s start with us and work towards our goals together.','aboutHeading':'we are 360 Service Supports','about':'All we do is Entertainment, Consult, Creative Design Digital Content, Online clips, Production, Music Video live Streaming, Influencer, Media, Online / Offline media Event Organizer, Artist Entertainment, etc.','thaiDescription':'เอเจนซี่ service support ที่บริการดูแลเพิ่มยอดขายให้กับธุรกิจ พร้อมผลิตสื่อโฆษณาทุกชนิดอย่างครบวงจร','legalName':'บริษัท เอเวอร์เนเวอร์ จำกัด','address':'61 ถนนหทัยราษฎร์ แขวงมีนบุรี เขตมีนบุรี กรุงเทพฯ 10510','hours':'จันทร์ – ศุกร์ เวลา 10.00 – 18.00 น.','email':'hello@evernever.net','phones':['095-246-8978','065-529-9645'],'logo':asset('https://evernever.net/wp-content/uploads/2024/03/Symbol-02.png','symbol'),'aboutImage':asset('https://evernever.net/wp-content/uploads/2024/03/Cover33.png','about'),'clientsImage':asset('https://evernever.net/wp-content/uploads/2024/03/Footer3.png','clients')}
data={'company':company,'services':services,'projects':projects,'team':team,'teamText':teamText}
(ROOT/'src/data/evernever.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
(ROOT/'src/data/evernever-assets.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2)+'\n')
(ROOT/'public/evernever').mkdir(parents=True,exist_ok=True)
def download(item):
 path,url=item;dest=ROOT/'public'/path.lstrip('/');tmp=dest.with_suffix(dest.suffix+'.part')
 subprocess.run(['curl','-fsSL','--retry','2','--max-time','60',url,'-o',str(tmp)],check=True)
 tmp.replace(dest)
 return path
with ThreadPoolExecutor(max_workers=6) as pool:
 for path in pool.map(download,assets.items()):print('Saved',path)
print('Imported',len(projects),'projects,',len(services),'services; team source:',teamText)
