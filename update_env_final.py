
from pathlib import Path
new_url = 'https://saltwater-electricity-e48da50ic-salinity.vercel.app'
env_file = Path('.env.test')
lines = env_file.read_text().splitlines()
new_lines = []
for line in lines:
    if line.startswith('API_BASE_URL=') or line.startswith('APPROVED_TEST_API_BASE_URL='):
        key = line.split('=')[0]
        new_lines.append(key + '=' + new_url)
    else:
        new_lines.append(line)
env_file.write_text('\n'.join(new_lines) + '\n')
