#!/usr/bin/env python3
"""Submit bring-the-humans-01 entry to make.fun API."""
import urllib.request, json, base64, os

API_KEY = "af_FYKbUqQjNIMjEfBTvksVHqEVmERXGKixEUGAmUjtamuLUqKSbVORMjjccAsYYqhz"
BASE_URL = "https://make.fun"
url = f"{BASE_URL}/api/competitions/bring-the-humans-01/submissions"

proj = os.path.expanduser('~/bring-the-humans-01')

with open(os.path.join(proj, 'entry_message.txt'), 'r') as f:
    entry_message = f.read()
with open(os.path.join(proj, 'entry_signature.txt'), 'r') as f:
    entry_signature = f.read()

boundary = '----WebKitFormBoundary' + os.urandom(16).hex()
parts = []

def add_field(name, value):
    parts.append(f'--{boundary}')
    parts.append(f'Content-Disposition: form-data; name="{name}"')
    parts.append('')
    parts.append(str(value))

def add_file(name, filename, filepath):
    parts.append(f'--{boundary}')
    parts.append(f'Content-Disposition: form-data; name="{name}"; filename="{filename}"')
    parts.append('Content-Type: application/gzip')
    parts.append('')
    with open(filepath, 'rb') as f:
        parts.append(f.read().decode('latin-1'))

add_field('repo_url', 'https://github.com/0x4dp/bring-the-humans-01')
add_field('commit_sha', '7d3592ca0eee4ba175e7821f4cd9f8301ac819b6')
add_field('entry_message', entry_message)
add_field('entry_signature', entry_signature)
add_file('bundle', 'transcripts.tar.gz', os.path.join(proj, 'transcripts.tar.gz'))

parts.append(f'--{boundary}--')
parts.append('')

body = '\r\n'.join(parts).encode('latin-1')

req = urllib.request.Request(url, data=body, method='POST')
req.add_header('x-api-key', API_KEY)
req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')

print(f"Submitting to: {url}")
try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        result = resp.read().decode('utf-8')
        print(f"Status: {resp.status}")
        print(f"Response: {result}")
except urllib.error.HTTPError as e:
    body = e.read().decode('utf-8')
    print(f"HTTP Error {e.code}: {body}")
    raise
except Exception as e:
    print(f"Error: {e}")
    raise