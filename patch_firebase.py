
import sys

file_path = 'src/firebaseConfig.js'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    new_lines.append(line)
    if 'const app = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG);' in line:
        new_lines.append('\nif (typeof window !== "undefined") {\n  window.firebaseConfig = FIREBASE_CONFIG;\n  window.firebaseApp = { app };\n}\n')

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
