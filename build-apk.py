import os
import sys
import re
import subprocess
import shutil

def replace_in_file(file_path, search_replace_pairs):
    with open(file_path, 'r') as file:
        content = file.read()
        for search, replace in search_replace_pairs:
            content = re.sub(search, replace, content)
    with open(file_path, 'w') as file:
        file.write(content)

def process_files(root_dir, website_url):
    search_replace_pairs = [
        (r'const baseUrl = window\.location\.origin;', f'const baseUrl = "{website_url}";'),
        (r'const socket = io\("/api/game"\);', f'const socket = io("{website_url}/api/game");'),
        (r'const socket = io\("/api/social"\);', f'const socket = io("{website_url}/api/social");')
    ]

    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.html') or file.endswith('.js'):
                file_path = os.path.join(root, file)
                replace_in_file(file_path, search_replace_pairs)

def build_android():
    subprocess.run(['cordova', 'platform', 'rm', 'android'])
    subprocess.run(['cordova', 'platform', 'add', 'android'])
    subprocess.run(['cordova', 'build', 'android'])

def restore_files(backup_dir, root_dir):
    for root, dirs, files in os.walk(backup_dir):
        for file in files:
            backup_file_path = os.path.join(root, file)
            original_file_path = os.path.join(root_dir, os.path.relpath(backup_file_path, backup_dir))
            shutil.copy2(backup_file_path, original_file_path)
    shutil.rmtree(backup_dir)

def main():
    if len(sys.argv) > 1:
        website_url = sys.argv[1].rstrip('/')
    else:
        website_url = input("Veuillez saisir l'URL du site web (localhost ne fonctionnera pas) : ").rstrip('/')

    root_dir = 'mobile/www'
    backup_dir = 'mobile/www_backup'

    shutil.copytree(root_dir, backup_dir)
    process_files(root_dir, website_url)
    build_android()
    restore_files(backup_dir, root_dir)

if __name__ == '__main__':
    main()