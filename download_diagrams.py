import base64
import urllib.request
import re
import os

def download_diagrams():
    if not os.path.exists('Report'):
        os.makedirs('Report')

    with open('PROJECT_WORKFLOW.md', 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract mermaid blocks
    diagrams = re.findall(r'```mermaid\n(.*?)\n```', content, re.DOTALL)

    for i, diagram in enumerate(diagrams):
        # Mermaid.ink expects base64 encoded string
        # To avoid issues with padding or multiline, ensure strict base64 encoding
        b64 = base64.b64encode(diagram.encode('utf-8')).decode('utf-8')
        url = f"https://mermaid.ink/img/{b64}?type=png&bgColor=!white"
        
        req = urllib.request.Request(
            url, 
            data=None, 
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        )
        
        try:
            with urllib.request.urlopen(req) as response:
                filepath = f'Report\\Workflow_Diagram_{i+1}.png'
                with open(filepath, 'wb') as out_file:
                    out_file.write(response.read())
            print(f"Downloaded {filepath}")
        except Exception as e:
            print(f"Failed diagram {i+1}: {e}")

if __name__ == '__main__':
    download_diagrams()
