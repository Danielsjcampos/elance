import json
from bs4 import BeautifulSoup

def extract_data(file_path):
    soup = None
    # PowerShell might have saved as UTF-16 LE if not specified, or Windows-1252.
    # Let's try likely encodings.
    encodings = ['utf-8', 'latin-1', 'cp1252', 'utf-16']
    
    for enc in encodings:
        try:
            with open(file_path, 'r', encoding=enc) as f:
                html_content = f.read()
            soup = BeautifulSoup(html_content, 'html.parser')
            if soup.body:
                break
        except (UnicodeDecodeError, UnicodeError):
            continue
    
    if not soup or not soup.body:
        print("Could not parse file with standard encodings.")
        return

    sections = []
    # Find the div that contains sections
    for child in soup.body.children:
        if child.name == 'div':
            found_sections = child.find_all('section', recursive=False)
            if len(found_sections) > 0:
                sections = found_sections
                break
    
    if not sections:
        # Fallback: just find all sections in body
        sections = soup.body.find_all('section')

    extracted_sections = []

    for i, section in enumerate(sections):
        # Skip navbar (usually first section or has navigation class)
        classes = section.get('class', [])
        if i == 0 and ('navigation' in str(classes) or 'nav' in str(classes)):
            continue

        headers = [h.get_text(strip=True) for h in section.find_all(['h1', 'h2', 'h3', 'h4', 'h5'])]
        paragraphs = [p.get_text(strip=True) for p in section.find_all('p') if p.get_text(strip=True)]
        
        # Get images with absolute or relative paths
        images = []
        for img in section.find_all('img'):
            src = img.get('src') or img.get('data-src')
            if src:
                images.append(src)

        buttons = []
        for a in section.find_all('a'):
            text = a.get_text(strip=True)
            href = a.get('href')
            if text and href:
                buttons.append({"text": text, "href": href})

        # List items for modules/benefits
        list_items = [li.get_text(strip=True) for li in section.find_all('li')]

        sec_data = {
            "id": f"section-{i}",
            "classes": classes,
            "headers": headers,
            "paragraphs": paragraphs,
            "images": images,
            "buttons": buttons,
            "list_items": list_items
        }
        
        extracted_sections.append(sec_data)

    output_data = {
        "page_title": soup.title.string if soup.title else "Curso Advogados",
        "sections": extracted_sections
    }

    with open('curso_adv_data.json', 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"Extracted {len(extracted_sections)} sections to curso_adv_data.json")

if __name__ == "__main__":
    extract_data('temp_cursoadv.html')
