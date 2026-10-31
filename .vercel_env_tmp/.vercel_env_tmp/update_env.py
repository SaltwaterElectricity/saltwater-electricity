
import os
from pathlib import Path

env_file = Path('.env.test')
lines = env_file.read_text().splitlines()
new_lines = []
for line in lines:
    if line.startswith('API_BASE_URL='):
        new_lines.append(f'API_BASE_URL=https://saltwater-electricity-e48da50ic-salinity.vercel.app')
    elif line.startswith('APPROVED_TEST_API_BASE_URL='):
        new_lines.append(f'APPROVED_TEST_API_BASE_URL=https://saltwater-electricity-e48da50ic-salinity.vercel.app')
    else:
        new_lines.append(line)

env_file.write_text('\n'.join(new_lines) + '\n')
