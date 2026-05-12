import os
import re

ROUTERS_DIR = r'd:\DOWNLOADS\energymatrix_uat\PYTHON\app\routers'

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern to find callproc with a prefix
    # We want to catch callproc("masters.proc", ...) or callproc('windmill.proc', ...)
    pattern = re.compile(r'cursor\.callproc\(\s*["\'](masters|windmill|solar)\.([^"\']+)["\']')
    
    new_content = pattern.sub(r'cursor.callproc("\2"', content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed prefixes in {filepath}")
    else:
        print(f"No prefixes found in {filepath}")

def main():
    for filename in os.listdir(ROUTERS_DIR):
        if filename.endswith('.py'):
            fix_file(os.path.join(ROUTERS_DIR, filename))

if __name__ == "__main__":
    main()
