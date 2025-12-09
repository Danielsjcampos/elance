import re
import json

def extract_mentoria_data(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Find the start of the JSON object
        start_marker = 'window._site='
        start_index = content.find(start_marker)
        
        if start_index == -1:
            print("Could not find window._site=")
            return
        
        # Move past the marker
        json_start = start_index + len(start_marker)
        
        # Attempt to find the end. It likely ends with a semicolon before the next script tag or EOF.
        # But JSON objects can be nested.
        # Let's try to grab a large chunk and clean it up.
        potential_json = content[json_start:]
        
        # It usually ends with }; or just }
        # Let's verify if there is a semicolon
        # We can try to parse continuously smaller chunks if it fails, or smarter: count braces.
        
        decoder = json.JSONDecoder()
        try:
             driver_data, idx = decoder.raw_decode(potential_json)
             data = driver_data
        except json.JSONDecodeError as e:
            print(f"JSON Decode Error with raw_decode: {e}")
            # Fallback: try to find the last };
            end_index = potential_json.rfind('};')
            if end_index != -1:
                 clean_json = potential_json[:end_index+1]
                 try:
                    data = json.loads(clean_json)
                 except:
                    print("Fallback parsing failed.")
                    return
            else:
                return

        # Find the specific page
        target_uri = "mentoria-trilha-do-arrematante"
        page_data = None
        for page in data.get('pages', []):
            if page.get('uriPath') == target_uri:
                page_data = page
                break

        if not page_data:
            print(f"Page with uriPath '{target_uri}' not found.")
            # Print available pages for debugging
            print("Available pages:")
            for p in data.get('pages', []):
                print(f" - {p.get('uriPath')}")
            return

        with open("mentoria_data.txt", "w", encoding="utf-8") as out:
            out.write(f"Page Title: {page_data.get('title')}\n")
            out.write("-" * 20 + "\n")

            if 'sections' in page_data:
                for section in page_data['sections']:
                    binding = section.get('binding', {})
                    category = section.get('category')
                    
                    out.write(f"Category: {category}\n")
                    
                    # Some titles are HTML, let's keep them as is for now or strip tags if needed.
                    out.write(f"Title: {binding.get('title')}\n")
                    out.write(f"Subtitle: {binding.get('subtitle')}\n")
                    out.write(f"Description: {binding.get('description')}\n")

                    # Images
                    if 'image' in binding:
                         val = binding['image'].get('value')
                         if val:
                             out.write(f"Image: {val}\n")

                    # Buttons
                    if 'buttons' in binding and isinstance(binding['buttons'], list):
                        for btn in binding['buttons']:
                            link = btn.get('link', {})
                            href = link.get('href') # Sometimes it is directly in btn
                            if not href: href = btn.get('href')
                            out.write(f"Button: {btn.get('title')} -> {href}\n")

                    # Lists
                    if 'list' in binding:
                        out.write("List Items:\n")
                        for item in binding['list']:
                            out.write(f"  - Title: {item.get('title')}\n")
                            out.write(f"    Subtitle: {item.get('subtitle')}\n")
                            out.write(f"    Description: {item.get('description')}\n")
                            if 'image' in item:
                                out.write(f"    Image: {item['image'].get('value')}\n")
                            if 'link' in item:
                                link_ref = item['link'].get('href') if isinstance(item.get('link'), dict) else item.get('href')
                                out.write(f"    Link: {link_ref}\n")

                    out.write("=" * 20 + "\n")
            else:
                 print("No sections found in page data.")

        print("Extraction complete. Check mentoria_data.txt")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    extract_mentoria_data("temp_mentoria.html")
