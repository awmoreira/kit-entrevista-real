"""MIT. Validate source parity, selectable text, navigation and page bounds; optional render."""
import hashlib
import json
import subprocess
import sys
import shutil
from pathlib import Path

import pdfplumber
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'output/pdf'
version = json.loads((ROOT / 'package.json').read_text())['version']
manifest = json.loads((OUT / 'sources.json').read_text())
assert manifest['version'] == version
results = []
for volume in manifest['volumes']:
    for source in volume['sources']:
        assert hashlib.sha256((ROOT / source['path']).read_bytes()).hexdigest() == source['sha256'], f"Fonte alterada: {source['path']}"
    path = OUT / volume['file']
    reader = PdfReader(path)
    assert len(reader.pages) >= 4 and reader.outline, f'Navegação ausente: {path.name}'
    assert version in reader.metadata.title
    texts = [page.extract_text() or '' for page in reader.pages]
    combined = '\n'.join(texts)
    assert 'Allan Winckler' in combined and 'não' in combined, f'Texto ou acentuação ausentes: {path.name}'
    assert '\ufffd' not in combined and '\u25a0' not in combined
    links = sum(len(page.get('/Annots', [])) for page in reader.pages)
    assert links > 0
    with pdfplumber.open(path) as document:
        for index, page in enumerate(document.pages):
            for char in page.chars:
                if char['text'].strip():
                    assert 28 <= char['x0'] <= char['x1'] <= page.width - 28, f'{path.name} p{index+1}: texto fora da largura'
                    assert 15 <= char['top'] <= char['bottom'] <= page.height - 14, f'{path.name} p{index+1}: texto fora da altura'
    result = {'file': path.name, 'pages': len(reader.pages), 'textCharacters': len(combined),
              'annotations': links, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'sourceHashesVerified': True,
              'selectableText': True, 'pageBoundsVerified': True, 'bookmarksPresent': True}
    results.append(result)
    print(f"{path.name}: {len(reader.pages)} páginas, texto e navegação verificados")
    if '--render' in sys.argv:
        target = ROOT / 'tmp/pdfs' / path.stem
        if target.exists(): shutil.rmtree(target)
        target.mkdir(parents=True, exist_ok=True)
        subprocess.run(['pdftoppm', '-r', '85', '-png', str(path), str(target / 'page')], check=True)
report = {'version': version, 'automaticChecks': results, 'visualReview': 'Ver registro da edição; verificações automáticas não substituem inspeção visual.'}
(ROOT / 'evidencias/pdf-verificacao.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')

if '--render' in sys.argv:
    from PIL import Image, ImageDraw
    for volume in manifest['volumes']:
        target = ROOT / 'tmp/pdfs' / Path(volume['file']).stem
        pages = sorted(target.glob('page-*.png'))
        for start in range(0, len(pages), 9):
            sheet = Image.new('RGB', (840, 1220), '#dce3e7')
            draw = ImageDraw.Draw(sheet)
            for pos, page_path in enumerate(pages[start:start+9]):
                pic = Image.open(page_path).convert('RGB')
                pic.thumbnail((260, 375))
                x, y = 10 + (pos % 3) * 280, 25 + (pos // 3) * 402
                sheet.paste(pic, (x, y))
                draw.text((x, y - 17), f"{page_path.stem}", fill='black')
            sheet.save(target / f'contact-{start//9+1}.jpg')
            print(target / f'contact-{start//9+1}.jpg')
