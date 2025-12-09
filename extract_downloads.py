
import json
from html.parser import HTMLParser

class MyHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.data = []
        self.current_tag = None
        self.current_attrs = {}

    def handle_starttag(self, tag, attrs):
        self.current_tag = tag
        attr_dict = dict(attrs)
        
        if tag == 'a':
            self.data.append({
                'type': 'link',
                'href': attr_dict.get('href'),
                'text': '',
                'title': attr_dict.get('title'),
                'class': attr_dict.get('class')
            })
        elif tag == 'img':
            self.data.append({
                'type': 'image',
                'src': attr_dict.get('src'),
                'alt': attr_dict.get('alt'),
                'class': attr_dict.get('class')
            })
        elif tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div']:
             self.data.append({
                'type': 'text_element',
                'tag': tag,
                'text': '',
                'class': attr_dict.get('class')
            })
            
    def handle_data(self, data):
        if data.strip():
            # Attach text to the last element if it's currently open or just added
            if self.data:
                last = self.data[-1]
                if 'text' in last:
                    last['text'] += data.strip() + " "

parser = MyHTMLParser()

with open('temp_downloads.html', 'r', encoding='utf-8') as f:
    content = f.read()

parser.feed(content)

# Filter for likely download items
import re
filtered_data = []

for item in parser.data:
    if item['type'] == 'link' and item['href']:
        # links usually contain http/https and maybe "download" or "drive" or "dropbox" or file extensions
        if any(x in item['href'] for x in ['drive.google', 'dropbox', '.pdf', '.doc', '.zip', 'download', 'bit.ly', 'mybid.com.br']):
            filtered_data.append(item)
    elif item['type'] == 'text_element' and len(item.get('text', '')) > 5:
        # Keep significant text
        filtered_data.append(item)


with open('downloads_data.json', 'w', encoding='utf-8') as f:
    json.dump(filtered_data, f, indent=2)

print("Extraction complete. Data saved to downloads_data.json")

