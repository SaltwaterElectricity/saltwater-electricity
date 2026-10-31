
from pathlib import Path
env_file = Path('src/firebaseConfig.js')
lines = env_file.read_text().splitlines()
new_lines = []

skip_block = False
for line in lines:
    if 'if (typeof window !== "undefined") {' in line and 'window.firebaseConfig' in line:
        skip_block = True
        continue
    if skip_block and '}' in line:
        skip_block = False
        continue
    if not skip_block:
        new_lines.append(line)

env_file.write_text('\n'.join(new_lines) + '\n')
