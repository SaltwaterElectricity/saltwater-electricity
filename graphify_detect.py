
import json
from graphify.detect import detect
from pathlib import Path

extra_excludes = ['.env*', 'node_modules/', 'build/', 'dist/', 'coverage/', 'sms-api-migration/', 'graphify-out/']
result = detect(Path('.'), extra_excludes=extra_excludes)
Path('graphify-out/.graphify_detect.json').write_text(json.dumps(result, ensure_ascii=False), encoding='utf-8')

print(f"Total: {result.get('total_files', 0)} files")
for cat, files in result.get('files', {}).items():
    print(f"{cat}: {len(files)} files")
