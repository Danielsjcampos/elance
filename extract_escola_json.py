import re
import json

def extract_escola_data(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the JSON object assigned to window._site
    match = re.search(r'window\._site\s*=\s*(\{.*?\});', content, re.DOTALL)
    if not match:
        print("Could not find window._site JSON")
        return

    json_str = match.group(1)
    try:
        data = json.loads(json_str)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        return

    # Find the specific page
    target_uri = "escola-de-formagco-para-novos-leiloeiros"
    page_data = None
    for page in data.get('pages', []):
        if page.get('uriPath') == target_uri:
            page_data = page
            break
    
    if not page_data:
        print(f"Page with uriPath '{target_uri}' not found.")
        return

    with open("escola_data.txt", "w", encoding="utf-8") as out:
        out.write(f"Page Title: {page_data.get('title')}\n")
        out.write("-" * 20 + "\n")

        for section in page_data.get('sections', []):
            binding = section.get('binding', {})
            category = section.get('category')
            
            out.write(f"Category: {category}\n")
            out.write(f"Title: {binding.get('title')}\n")
            out.write(f"Subtitle: {binding.get('subtitle')}\n")
            out.write(f"Description: {binding.get('description')}\n")
            
            # Images
            if 'image' in binding:
                 out.write(f"Image: {binding['image'].get('value')}\n")
            
            # Lists (simple)
            if 'list' in binding:
                out.write("List Items:\n")
                for item in binding['list']:
                    out.write(f"  - Title: {item.get('title')}\n")
                    out.write(f"    Description: {item.get('description')}\n")
                    out.write(f"    Price: {item.get('price')}\n")
            
            out.write("=" * 20 + "\n")

if __name__ == "__main__":
    extract_escola_data("temp_escola.html")
