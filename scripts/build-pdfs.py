"""MIT. Build all four volumes from their canonical Markdown, without remote assets."""
import hashlib
import html
import json
import re
import shlex
import textwrap
import posixpath
from urllib.parse import quote, unquote
from pathlib import Path

import reportlab
from reportlab import rl_config
from markdown_it import MarkdownIt
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Frame, LongTable, PageBreak, PageTemplate, Paragraph,
    Spacer, TableStyle, XPreformatted, KeepTogether,
)
from reportlab.platypus.tableofcontents import TableOfContents

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'output/pdf'
OUT.mkdir(parents=True, exist_ok=True)
VERSION = json.loads((ROOT / 'package.json').read_text())['version']
rl_config.invariant = 1
FONT_DIR = Path(reportlab.__file__).parent / 'fonts'
for name, filename in [('Vera', 'Vera.ttf'), ('VeraBold', 'VeraBd.ttf'), ('VeraItalic', 'VeraIt.ttf'), ('VeraBoldItalic', 'VeraBI.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(FONT_DIR / filename)))
pdfmetrics.registerFontFamily('Vera', normal='Vera', bold='VeraBold', italic='VeraItalic', boldItalic='VeraBoldItalic')
(ROOT / 'licenses').mkdir(exist_ok=True)
(ROOT / 'licenses/bitstream-vera.txt').write_text((FONT_DIR / 'bitstream-vera-license.txt').read_text())

INK = colors.HexColor('#142e40')
GOLD = colors.HexColor('#b27628')
GRAY = colors.HexColor('#50616c')
LIGHT = colors.HexColor('#eef3f5')
W, H = A4
MARGIN = 48
WIDTH = W - 2 * MARGIN
BODY = ParagraphStyle('Body', fontName='Vera', fontSize=9.4, leading=14.4, textColor=INK,
                      spaceAfter=8, splitLongWords=True)
STYLES = {
    1: ParagraphStyle('H1', parent=BODY, fontName='VeraBold', fontSize=20, leading=26, spaceBefore=12, spaceAfter=18, keepWithNext=True),
    2: ParagraphStyle('H2', parent=BODY, fontName='VeraBold', fontSize=13.2, leading=18, spaceBefore=15, spaceAfter=9, keepWithNext=True),
    3: ParagraphStyle('H3', parent=BODY, fontName='VeraBold', fontSize=10.5, leading=15, spaceBefore=12, spaceAfter=7, keepWithNext=True),
}
SMALL = ParagraphStyle('Small', parent=BODY, fontSize=8.1, leading=11.4, spaceAfter=0)
TABLE_HEAD = ParagraphStyle('TableHead', parent=SMALL, fontName='VeraBold', textColor=colors.white)
BULLET = ParagraphStyle('Bullet', parent=BODY, leftIndent=12, bulletIndent=0)
FORM = ParagraphStyle('Form', parent=BODY, leading=16, spaceAfter=20)
CODE = ParagraphStyle('Code', fontName='Courier', fontSize=8.2, leading=11.2, textColor=INK,
                      backColor=LIGHT, borderPadding=8, spaceBefore=7, spaceAfter=13)


def inline(children, source):
    output = []
    for token in children or []:
        kind = token.type
        if kind == 'text':
            output.append(html.escape(token.content))
        elif kind == 'code_inline':
            output.append('<font name="Courier">' + html.escape(token.content) + '</font>')
        elif kind in ('softbreak', 'hardbreak'):
            output.append(' ' if kind == 'softbreak' else '<br/>')
        elif kind == 'strong_open': output.append('<b>')
        elif kind == 'strong_close': output.append('</b>')
        elif kind == 'em_open': output.append('<i>')
        elif kind == 'em_close': output.append('</i>')
        elif kind == 'link_open':
            href = token.attrGet('href') or ''
            if not href.startswith(('https://', 'http://')):
                path, sep, anchor = href.partition('#')
                path = posixpath.normpath(posixpath.join(posixpath.dirname(source), unquote(path))) if path else source
                if path.startswith(('../', '/')): raise ValueError(f'Link fora do projeto: {href}')
                href = f'https://github.com/awmoreira/kit-entrevista-real/blob/v{VERSION}/' + quote(path, safe='/._-') + (sep + anchor if sep else '')
            output.append('<link href="' + html.escape(href, quote=True) + '" color="#17617a">')
        elif kind == 'link_close': output.append('</link>')
        elif kind == 'image': output.append(html.escape(token.content))
    return ''.join(output)


class Book(BaseDocTemplate):
    def __init__(self, volume):
        self.volume = volume
        super().__init__(str(OUT / volume['file']), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
                         topMargin=52, bottomMargin=46, title=f"Kit Entrevista Real {VERSION} | {volume['title']}",
                         author='Allan Winckler', subject='Preparação para entrevistas de backend pleno e sênior',
                         creator=f'Kit Entrevista Real {VERSION}; Markdown + ReportLab', pageCompression=1)
        frame = Frame(MARGIN, 46, WIDTH, H - 98, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates(PageTemplate(id='Book', frames=[frame], onPage=self.page_art))

    def page_art(self, canvas, doc):
        canvas.saveState()
        if doc.page == 1:
            canvas.setFillColor(INK)
            canvas.rect(0, H - 13, W, 13, fill=1, stroke=0)
            canvas.setFillColor(GOLD)
            canvas.rect(MARGIN, 105, 5, 93, fill=1, stroke=0)
            canvas.setFillColor(LIGHT)
            canvas.setFont('VeraBold', 87)
            canvas.drawRightString(W - MARGIN, H - 145, self.volume['id'])
        else:
            canvas.setFillColor(GRAY)
            canvas.setFont('Vera', 7.5)
            canvas.drawString(MARGIN, H - 29, 'KIT ENTREVISTA REAL')
            canvas.drawRightString(W - MARGIN, H - 29, self.volume['title'])
            canvas.setStrokeColor(colors.HexColor('#d4dfe4'))
            canvas.line(MARGIN, H - 36, W - MARGIN, H - 36)
        canvas.setFont('Vera', 7.2)
        canvas.setFillColor(GRAY)
        canvas.drawString(MARGIN, 25, f'Allan Winckler | {VERSION} | CC BY-NC 4.0')
        canvas.drawRightString(W - MARGIN, 25, f"{self.volume['id']} / {doc.page:02d}")
        canvas.restoreState()

    def afterFlowable(self, flowable):
        if hasattr(flowable, 'heading_level'):
            level = flowable.heading_level
            key = flowable.bookmark_key
            text = flowable.getPlainText()
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(text, key, level=level, closed=False)
            self.notify('TOCEntry', (level, text, self.page, key))


def markdown_story(text, prefix, source, forms=False):
    tokens = MarkdownIt('commonmark').enable('table').parse(text)
    story = []
    i = 0
    headings = 0
    lists = []
    pending_bullet = None
    while i < len(tokens):
        t = tokens[i]
        if t.type == 'heading_open':
            level = int(t.tag[1:])
            if level == 1 and story: story.append(PageBreak())
            if forms and level == 2 and tokens[i + 1].content.startswith('Ficha '): story.append(PageBreak())
            p = Paragraph(inline(tokens[i + 1].children, source), STYLES[min(level, 3)])
            p.heading_level = 0 if level == 1 else 1
            p.bookmark_key = f'{prefix}-{headings}'
            headings += 1
            story.append(p)
            i += 3
            continue
        if t.type == 'paragraph_open':
            style = FORM if forms and '____' in tokens[i + 1].content else BODY
            story.append(Paragraph(inline(tokens[i + 1].children, source), BULLET if pending_bullet else style, bulletText=pending_bullet))
            pending_bullet = None
            i += 3
            continue
        if t.type in ('bullet_list_open', 'ordered_list_open'):
            lists.append({'ordered': t.type == 'ordered_list_open', 'counter': 0})
        elif t.type == 'list_item_open':
            lists[-1]['counter'] += 1
            pending_bullet = f"{lists[-1]['counter']}." if lists[-1]['ordered'] else '-'
        elif t.type in ('bullet_list_close', 'ordered_list_close'):
            lists.pop()
        elif t.type == 'fence':
            lines = []
            for line in t.content.rstrip().splitlines():
                if t.info in ('sh', 'bash') and len(line) > 94:
                    current = ''
                    for word in map(shlex.quote, shlex.split(line)):
                        if current and len(current) + len(word) + 1 > 94:
                            lines.append(current + ' \\')
                            current = '  ' + word
                        else:
                            current += (' ' if current else '') + word
                    lines.append(current)
                else:
                    lines.extend(textwrap.wrap(line, width=96, replace_whitespace=False, drop_whitespace=False) or [''])
            story.append(XPreformatted(html.escape('\n'.join(lines)), CODE))
        elif t.type == 'table_open':
            rows = []
            row = []
            header = False
            i += 1
            while tokens[i].type != 'table_close':
                cell = tokens[i]
                if cell.type == 'tr_open': row = []
                elif cell.type == 'th_open': header = True
                elif cell.type == 'td_open': header = False
                elif cell.type == 'inline': row.append(Paragraph(inline(cell.children, source), TABLE_HEAD if header else SMALL))
                elif cell.type == 'tr_close': rows.append(row)
                i += 1
            cols = len(rows[0])
            weights = {2: [0.33, 0.67], 3: [0.23, 0.4, 0.37], 4: [0.21, 0.26, 0.26, 0.27]}.get(cols, [1 / cols] * cols)
            headers = [cell.getPlainText() for cell in rows[0]]
            if 'Nota / NO' in headers: weights = [0.30, 0.13, 0.57]
            if 'Início relativo' in headers: weights = [0.22, 0.16, 0.12, 0.50]
            table = LongTable(rows, colWidths=[WIDTH * w for w in weights], repeatRows=1, rowSplitRange=(2, -1), hAlign='LEFT', spaceAfter=13)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), INK),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT]),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (-1, -1), 6), ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                ('TOPPADDING', (0, 0), (-1, -1), 7), ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
                ('LINEBELOW', (0, 0), (-1, 0), 1, GOLD),
            ]))
            story.append(KeepTogether([table]) if len(rows) <= 5 else table)
        i += 1
    return story


def build(volume):
    cover_tag = ParagraphStyle('CoverTag', parent=BODY, fontName='VeraBold', fontSize=10, leading=15, textColor=GOLD)
    cover_title = ParagraphStyle('CoverTitle', parent=BODY, fontName='VeraBold', fontSize=34, leading=43, spaceAfter=22)
    cover_sub = ParagraphStyle('CoverSub', parent=BODY, fontSize=14, leading=21, textColor=GRAY)
    story = [Spacer(1, 110), Paragraph('KIT ENTREVISTA REAL', cover_tag), Spacer(1, 35),
             Paragraph(volume['title'], cover_title), Paragraph(volume['subtitle'], cover_sub), Spacer(1, 37),
             Paragraph('Backend TypeScript e PostgreSQL<br/>Pleno e sênior', BODY), Spacer(1, 40),
             Paragraph(f"VOLUME {volume['id']} | EDIÇÃO {VERSION}", cover_tag),
             Paragraph('Allan Winckler<br/>Conteúdo gratuito em português', BODY), Spacer(1, 18),
             Paragraph('Histórico real / Investigação / Arquitetura<br/>Code review / Comportamento', BODY), Spacer(1, 12),
             Paragraph('Copyright 2026 Allan Winckler. Materiais sob <link href="https://creativecommons.org/licenses/by-nc/4.0/" color="#17617a">CC BY-NC 4.0</link>.<br/>Fontes editáveis e laboratório: <link href="https://github.com/awmoreira/kit-entrevista-real" color="#17617a">github.com/awmoreira/kit-entrevista-real</link>.', SMALL), PageBreak(),
             Paragraph('Neste volume', STYLES[1])]
    toc = TableOfContents()
    toc.levelStyles = [ParagraphStyle('TOC0', parent=BODY, fontName='VeraBold', fontSize=9.3, leading=14, spaceBefore=6),
                       ParagraphStyle('TOC1', parent=BODY, fontSize=8.5, leading=11.5, leftIndent=11, firstLineIndent=0, spaceBefore=1.5)]
    story.extend([toc, Spacer(1, 15), Paragraph('Fontes editáveis em Markdown no repositório e no ZIP. Esta edição identifica separadamente verificação técnica e piloto pedagógico.', SMALL), PageBreak()])
    for index, source in enumerate(volume['sources']):
        if index: story.append(PageBreak())
        text = (ROOT / source).read_text()
        if re.search('[\u2010-\u2015]', text):
            raise ValueError(f'Use hífen ASCII em {source}')
        story.extend(markdown_story(text, f"v{volume['id']}-s{index}", source, forms=source.endswith('04-fichas.md')))
    Book(volume).multiBuild(story)


volumes = json.loads((ROOT / 'conteudo/volumes.json').read_text())
manifest = {'version': VERSION, 'generator': f'ReportLab {reportlab.Version}', 'volumes': []}
for volume in volumes:
    build(volume)
    manifest['volumes'].append({'file': volume['file'], 'sources': [
        {'path': source, 'sha256': hashlib.sha256((ROOT / source).read_bytes()).hexdigest()} for source in volume['sources']]})
    print(f"Gerado: {volume['file']}")
(OUT / 'sources.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
