"""Copy referenced public legacy images locally; never modifies WordPress."""
import concurrent.futures
import hashlib
import json
from pathlib import Path
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
source = json.loads((ROOT / 'src/data/evernever.json').read_text())
urls = sorted({u for p in source['projects'] for u in [p['coverImage'], *p.get('gallery', [])]
               if u.startswith('https://evernever.net/wp-content/uploads/')})

def preserve(url):
    path = urllib.parse.urlsplit(url).path
    ext = Path(path).suffix.lower()
    if ext not in ('.jpg', '.jpeg', '.png', '.webp', '.gif'):
        raise ValueError('Unsupported image: ' + url)
    local = '/evernever/gallery/' + hashlib.sha256(url.encode()).hexdigest()[:24] + ext
    dest = ROOT / 'public' / local.lstrip('/')
    dest.parent.mkdir(parents=True, exist_ok=True)
    if not dest.exists():
        encoded = urllib.parse.quote(url, safe=':/%?=&')
        with urllib.request.urlopen(encoded, timeout=60) as response:
            if not response.headers.get('Content-Type', '').startswith('image/'):
                raise ValueError('Not an image: ' + url)
            data = response.read(25 * 1024 * 1024 + 1)
        if not data or len(data) > 25 * 1024 * 1024:
            raise ValueError('Invalid image size: ' + url)
        temp = dest.with_suffix(ext + '.part')
        temp.write_bytes(data)
        temp.replace(dest)
    return url, local

if __name__ == '__main__':
    results = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for url, local in pool.map(preserve, urls):
            results[url] = local
    # Commit the map only after every image is present.
    (ROOT / 'src/data/legacy-media.json').write_text(json.dumps(results, ensure_ascii=False, indent=2) + '\n')
    print('Preserved', len(results), 'images; bytes:', sum((ROOT / 'public' / p.lstrip('/')).stat().st_size for p in results.values()))
