"""MIT. Stable ZIP with explicit relative paths, no local caches or personal answers."""
import sys
import zipfile
from pathlib import Path
source, target = map(Path, sys.argv[1:])
with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for path in sorted(source.rglob('*')):
        if not path.is_file():
            continue
        info = zipfile.ZipInfo(str(path.relative_to(source.parent)), date_time=(2026, 10, 30, 12, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        archive.writestr(info, path.read_bytes())
print(f'ZIP criado: {target.name}')
