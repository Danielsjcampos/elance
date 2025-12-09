import re
import json

def extract_ecossistema_data(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Find the start of the JSON object
        start_marker = 'window._site='
        start_index = content.find(start_marker)
        
        if start_index == -1:
            print("Could not find window._site=")
            return
        
        json_start = start_index + len(start_marker)
        potential_json = content[json_start:]
        
        decoder = json.JSONDecoder()
        try:
             driver_data, idx = decoder.raw_decode(potential_json)
             data = driver_data
        except json.JSONDecodeError as e:
            print(f"JSON Decode Error with raw_decode: {e}")
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

        target_uri = "o-ecossistema-e-lance-e-my-bid"
        page_data = None
        for page in data.get('pages', []):
            if page.get('uriPath') == target_uri:
                page_data = page
                break

        if not page_data:
            print(f"Page with uriPath '{target_uri}' not found.")
            print("Available pages:")
            for p in data.get('pages', []):
                print(f" - {p.get('uriPath')}")
            return

        with open("ecossistema_data.txt", "w", encoding="utf-8") as out:
            out.write(f"Page Title: {page_data.get('title')}\n")
            out.write("-" * 20 + "\n")

            if 'sections' in page_data:
                for section in page_data['sections']:
                    binding = section.get('binding', {})
                    category = section.get('category')
                    
                    out.write(f"Category: {category}\n")
                    # Try to find standard fields, but also dump generic ones if standard not found
                    title = binding.get('title') or binding.get('heading')
                    subtitle = binding.get('subtitle') or binding.get('subHeading')
                    description = binding.get('description') or binding.get('text')
                    
                    if title: out.write(f"Title: {title}\n")
                    if subtitle: out.write(f"Subtitle: {subtitle}\n")
                    if description: out.write(f"Description: {description}\n")

                    # Debug: dump binding keys
                    with open("ecossistema_debug.txt", "a", encoding="utf-8") as debug:
                        debug.write(f"Category: {category}\n")
                        debug.write(json.dumps(binding, indent=2))
                        debug.write("\n" + "="*20 + "\n")


                    if 'image' in binding:
                         val = binding['image'].get('value')
                         if val:
                             out.write(f"Image: {val}\n")
                    
                    if 'images' in binding: # Carousel or gallery
                        for img in binding['images']:
                             out.write(f"Image (Gallery): {img.get('value')}\n")

                    if 'buttons' in binding and isinstance(binding['buttons'], list):
                        for btn in binding['buttons']:
                            link = btn.get('link', {})
                            href = link.get('href') 
                            if not href: href = btn.get('href')
                            label = btn.get('title') or btn.get('label')
                            out.write(f"Button: {label} -> {href}\n")

                    if 'list' in binding:
                        out.write("List Items:\n")
                        for item in binding['list']:
                             title = item.get('title') or item.get('heading')
                             desc = item.get('description') or item.get('text')
                             out.write(f"  - Title: {title}\n")
                             out.write(f"    Description: {desc}\n")
                             if 'image' in item:
                                out.write(f"    Image: {item['image'].get('value')}\n")

                    # Sometimes content is in 'cards' for features
                    if 'cards' in binding:
                        out.write("Cards:\n")
                        for card in binding['cards']:
                            title = card.get('title')
                            desc = card.get('description')
                            out.write(f"  - Card Title: {title}\n")
                            out.write(f"    Card Desc: {desc}\n")
                            if 'image' in card:
                                out.write(f"    Card Image: {card['image'].get('value')}\n")

                    out.write("=" * 20 + "\n")
            else:
                 print("No sections found in page data.")

        print("Extraction complete. Check ecossistema_data.txt")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    extract_ecossistema_data("temp_ecossistema.html")
