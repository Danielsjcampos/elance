import re
import json

def extract_indique_data(file_path):
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

        target_uri = "indique-a-e-lance-para-realizar-o-seu-leilao"
        page_data = None
        for page in data.get('pages', []):
            if page.get('uriPath') == target_uri:
                page_data = page
                break

        if not page_data:
            print(f"Page with uriPath '{target_uri}' not found.")
            return

        with open("indique_data.txt", "w", encoding="utf-8") as out:
            out.write(f"Page Title: {page_data.get('title')}\n")
            out.write("-" * 20 + "\n")

            if 'sections' in page_data:
                for section in page_data['sections']:
                    binding = section.get('binding', {})
                    category = section.get('category')
                    
                    out.write(f"Category: {category}\n")
                    
                    title = binding.get('title') or binding.get('heading')
                    subtitle = binding.get('subtitle') or binding.get('subHeading')
                    description = binding.get('description') or binding.get('text')
                    
                    if title: out.write(f"Title: {title}\n")
                    if subtitle: out.write(f"Subtitle: {subtitle}\n")
                    if description: out.write(f"Description: {description}\n")

                    if 'form' in binding:
                         out.write("Form found inside binding.\n")

                    # Debug: dump binding keys
                    out.write("Debug Binding:\n")
                    out.write(json.dumps(binding, indent=2))
                    out.write("\n" + "="*20 + "\n")
            else:
                 print("No sections found in page data.")

        print("Extraction complete. Check indique_data.txt")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    extract_indique_data("temp_indique.html")
